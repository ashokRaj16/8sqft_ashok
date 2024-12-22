import { Request, Response, NextFunction } from "express";

import excelJS from "exceljs";
import PDFDocument from 'pdfkit';
import fs from "fs";
import multer from "multer";
import multers3 from 'multer-s3';

import * as blogModel from "../model/blogModel.js";
import * as response from "../config/response.js";
import { blogValidator } from "./validation/blogValidator.js";
import { formattedDate } from "../helper/commonHelper.js";
import { json } from "body-parser";
import { uploadImageToS3, getImageFromS3 } from "../config/s3.js";
import { error } from "console";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/images')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`)
    }
})

const storageArray = multer.diskStorage({
    destination: function (req, file, cb) {
        
        const path = `./uploads/images/${formattedDate()}`;
        if(!fs.existsSync(path)){
            fs.mkdir(path, (err) =>{
                console.log(err);            
            })
        }
        cb(null, path)
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1];
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`)
    }
})

const multerFilter = (req:any, file:any, cb :any) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed!!"), false);
    }
};

const upload = multer( {
    storage: storage,
    fileFilter: multerFilter,
    limits:{
        files: 1,
    }
})

// @desc    get all blogs
// @route   GET /v1/admin/blog
// @access  Private
export const getAllBlogs = async ( req: Request, res: Response ) => {
    let data:any = {};
    try{
        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 2;
        let search = JSON.parse(req.query.search?.toString()||"{}");
        
        // let totalCount: any = await blogModel.getAllBlogs();
        let skip = (page-1) * limit ;
        let startIndex = (page -1) * limit;
        let endIndex = page * limit;

        let whereClause: any = {}
        let pagination : any = {}
        let orderBy : any= {}

        let orderByColumn: any = req.query.orderBy || "title";
        let order = req.query.order || "asc";
        orderBy[orderByColumn] = order;
        
        if(search.hasOwnProperty('q')){
            whereClause = {
                OR: [
                    {
                        title: { contains: search.q }
                    },
                    {
                        content: { contains: search.q }
                    },
                ]
            };
        }

        // Excel export (pdf, excel & other format).
        if (req.query.export_excel && req.query.export_excel !== "") {
            excelExport(res, whereClause, orderBy)
            return;
		}
        
        let totalCount: any = await blogModel.getAllBlogs("count", whereClause);
        let blogs :any = await blogModel.getAllBlogs("data", whereClause, limit, skip, orderBy);
        
        if(endIndex < Number(totalCount))
        {
            pagination.next = {
                page : page + 1,
                limit
            }
        }
        if(startIndex > 0)
        {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }

        data['blog'] = blogs;
        data['total_count'] = totalCount;
        data['total_pages'] = Math.ceil(totalCount / limit);
        data['pagination'] = pagination;

        return response.successResponseWithData(res, "Blog retrieved.", data);
    }
    catch( error: any)
    {
        return response.errorResponse(400,res, "Server Internal error", error );
    }
}

export const getSingleBlog = async ( req: Request, res: Response ) => {
    let data:any = {};
    const {id} = req.params;

    try{
        let blog = await blogModel.getBlogById(id);
        if(!blog)
        {
            return response.badRequestResponse(res, 'No blog found.');
        }
        
        data['blog'] = blog;
        return response.successResponseWithData(res, 'Successfully retrieved.', data);
    }
    catch(error : any)
    {
        return response.errorResponse(500, res , 'Internal server error.', error);
    }
}

// @desc    export excel(use excelJS). related to getAllBlogs @required: export-excel query parameter.
// @route   No route 
// @access  Private
const excelExport = async (res: Response, where : any, orderby: any ) => {
    try{
        // initialize workbook.
        let workbook = new excelJS.Workbook();

        // Set workbook property.
        workbook.creator = "Nexus Yard";
        workbook.title = "Nexus Blog";
        workbook.lastModifiedBy = 'Nexus Yard';
        workbook.description =  "";
        workbook.created = new Date();
        workbook.category = "Blog";
        workbook.manager = "Nexus Yard"
        
        // initialize excel sheet.
        let workSheet = workbook.addWorksheet("Blog");
        // protect sheet    
        // workSheet.protect("password",{
        //     deleteRows: false,
        //     insertRows: false,
        //     autoFilter: true,
        //     sort :true
        // })

        // add columns to worksheet
        workSheet.columns = [
            { header: "Sr No", key: "s_no" },
            { header: "Title", key: "title" },
            { header: "Content", key: "content" },
            { header: "Image", key: 'image'},
            { header: "Created", key: 'createdAt'}
        ]

        // get all blogs.
        let blogs:any = await blogModel.getAllBlogs("export", where, orderby)
        
        // Add rows into sheet.
        let counter = 1;
        blogs.forEach((blog :any) => {
            workSheet.addRow({
                s_no: counter,
                ...blog
            });
            counter++;
        });

        // format header row
        workSheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true}
        })

        // Download excel
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet" )
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=Blogs.xlsx"
        )
        return workbook.xlsx.write(res).then(() => {
            res.status(200);
        })
    }
    catch(error: any)
    {
        return response.errorResponse(500, res, "Internal server error.", error)
    }
}

// @desc    export pdf. //find html file include in pdf directly.
// @route   GET /v1/admin/blog/export
// @access  Private
export const exportPdf = async (req: Request, res: Response) => {
try{
    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename=invoice.pdf`,
      });

      buildPDF(
        (chunk: any) => stream.write(chunk),
        () => stream.end()
      );
}
catch(error: any)
{
    response.errorResponse(500, res, "Internal server error.", error);
}
}

// build pdf using pdfKit.
async function buildPDF(dataCallback :any, endCallback: any) {
    const doc = new PDFDocument({ bufferPages: true, font: 'Courier' });
    
    // read html file
    let html = fs.readFileSync( 'assets/template/pdf.html', "utf8");

    doc.on('data', dataCallback);
    doc.on('end', endCallback);
  
    let blog: any = await blogModel.getBlogById("5b3e8643-498f-4b3a-9ed5-06d64b7e5095");
    doc.fontSize(20).text(`Nexus Blogs ${ blog.title}`, { align: "center" });
    // Add content.
    
    doc.moveTo(0, 90).lineTo(800, 90).stroke()
    // doc
    doc.text(blog.content)
    doc.end();
}
  
// @desc    create new blog @required data: blog content
// @route   POST /v1/admin/blog
// @access  Private
export const addBlog = async ( req: Request, res: Response ) => {
    let data:any = {};
    let blogOject = req.body;
    let uploadFile : any = req.file;
    console.log(req.body, req.file);
    
    try{
        let { value, error} = blogValidator(req.body);
        if(error)
        {
            return response.badRequestResponse(res, "Validation Errors.", error)
        }
        // check for duplicate blog title
        let blog = await blogModel.getBlogByName(req.body.title);
        
        if(blog)
        {
            if(req.file){
                if(req.file.path)
                {
                    fs.unlink(`${req.file.path}`, (err) => {
                        // console.log(err)
                    });
                }
            }
            return response.badRequestResponse(res, "Blog with given title already available. Please try with different name.")
        }
        if(req.file){
            blogOject = {
                ...blogOject,
                image: uploadFile.location
            }
            // let imageResult = await uploadImageToS3(req.file);
            // console.log("uploaded:", imageResult);
        }
        let result = await blogModel.insertBlog(blogOject);
        if(result)
        {
            data['blog'] = result;
            return response.successResponseWithData(res, "Blog created.", data)
        }
        return response.badRequestResponse(res, "unable to created.")
    }
    catch(error : any)
    {
        console.log(error);
        return response.errorResponse(500, res, "Internal server error.", error)
    }
}

// @desc    delete blog @required param:id 
// @route   DELETE /v1/admin/blog
// @access  Private
export const removeBlog = async (req:Request, res: Response) => {
    let data:any = {};
    let { id } = req.params;
    try{
        let blog = await blogModel.deleteBlog(id);
        console.log(blog);
        
        if(blog.image)
        {
            fs.unlink(`.\\uploads\\images\\${blog?.image}`, (err) => {
                // console.log(err)
            });
        }
        data['blog'] = blog;
        return response.successResponseWithData(res, "Blog successfully removed.", data)
    }
    catch(error : any)
    {
        return response.errorResponse(500, res, "Internal server error.", error)
    }
}

// @desc    update blog @required param:id, data: blog content
// @route   PUT /v1/admin/blog
// @access  Private
export const updateBlog = async (req:Request, res: Response) => {
    let data:any = {};
    let blogObject = req.body;
    let {id} = req.params;
    if(!id)
    {
        return response.badRequestResponse(res, "Id must be include in request.")
    }
    try{
        let singleBlog: any = await blogModel.getBlogById(id);
        if(!singleBlog)
        {
            return response.badRequestResponse(res, "No record found with given id.")
        }
        let blogByName = await blogModel.getBlogByName(blogObject.title, id)
        if(blogByName)
        {
            if(req.file)
            {
                fs.unlink(`${req.file.path}`, (err) => {
                    // console.log(err)
                });
            }
            return response.badRequestResponse(res, "Blog with title already available.")
        }
        if(req.file){
            if(singleBlog?.image)
            {
                fs.unlink(`.\\uploads\\images\\${singleBlog?.image}`, (err) => {
                    // console.log(err)
                });
            }

            blogObject = {
                ...blogObject,
                image: req.file?.filename
            }
        }
        let blog = await blogModel.updateBlog(id, blogObject);
        data['blog'] = blog;
        return response.successResponseWithData(res, "Blog updated successfully.", data)
    }
    catch(error : any)
    {
        response.errorResponse(500, res, "Internal server error.", error)
    }
}

// @desc    get image from aws s3
// @route   PUT /v1/admin/image:id
// @access  public
export const getAwsImage = (req: Request, res: Response) => {
    const key = req.params.key;
    if(!key)
    {
        return response.badRequestResponse(res, "Key must be include in request.")
    }
    // const readStream = getImageFromS3(key);
    // readStream.on("error", (error) => {
    //     return response.badRequestResponse(res, "Error reading file: "+ error.message);
    // })
    // readStream.pipe(res);
}

//@desc banner upload.
// check for resize, validation for min and max size.
export const uploadBanner = ( req: Request, res: Response, next: NextFunction) => {
    let uploadImage = upload.single('banner');
        
        uploadImage(req, res, function(err){
            if (err instanceof multer.MulterError) {
                return response.badRequestResponse(res, "Invalid input", err.message)
            } else if (err) {
                // An unknown error occurred when uploading.
                return response.badRequestResponse(res, "Invalid input", err.message)
            }
            next();
        })
}

//@desc Upload bulk images using single keys.
export const uploadBulkImage = ( req: Request, res: Response, next: NextFunction) => {
    let uploadImage = multer({
        storage: storageArray,
        fileFilter: multerFilter,
        limits: {
            files: 5
        }
    }).array('photos');
    uploadImage(req, res, function(err){
        if (err instanceof multer.MulterError) {
            return response.badRequestResponse(res, "Invalid input", err.message)
        } else if (err) {
            // An unknown error occurred when uploading.
            return response.badRequestResponse(res, "Invalid input", err.message)
        }
        next();
    })
}

//@desc Upload multiple images using multiple keys.
export const uploadMultipleImage = async ( req: Request, res: Response, next: NextFunction) => {
    let uploadImage = multer({
        storage: storageArray,
        fileFilter: multerFilter,
        limits: {
            files: 5
        }
    }).any();
    uploadImage(req, res, function(err){
        if (err instanceof multer.MulterError) {
            return response.badRequestResponse(res, "Invalid input", err.message)
        } else if (err) {
            // An unknown error occurred when uploading.
            return response.badRequestResponse(res, "Invalid input", err.message)
        }
        next();
    })
}