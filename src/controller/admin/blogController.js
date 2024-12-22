

const getBlogsList = async (req, res) => {
    try {
        // get Blog profile.
        const result = await getBlogById(id);
        if(result) {
            return successResponse(res, false, "Blog Profile.", result)
        }

    } catch (error) {
        return badRequestResponse(res, false, "Something went wrong.", error)
    }
}

const getBlogById = async (req, res) => {
    try {
        // get Blog profile.
        const result = await getBlogById(id);
        if(result) {
            return successResponse(res, false, "Blog Profile.", result)
        }

    } catch (error) {
        return badRequestResponse(res, false, "Something went wrong.", error)
    }
}

const updateBlogById = async (req, res) => {
    try {
        // get Blog profile.
        const result = await getBlogById(id);
        if(result) {
            return successResponse(res, false, "Blog Profile.", result)
        }

    } catch (error) {
        return badRequestResponse(res, false, "Something went wrong.", error)
    }
}

const updateBlogProfileById = async (req, res) => {
    try {
        // get Blog profile.
        const result = await getBlogById(id);
        if(result) {
            return successResponse(res, false, "Blog Profile.", result)
        }

    } catch (error) {
        return badRequestResponse(res, false, "Something went wrong.", error)
    }
}

const changeBlogStatusById = async (req, res) => {
    try {
        // get Blog profile.
        const result = await getBlogById(id);
        if(result) {
            return successResponse(res, false, "Blog Profile.", result)
        }

    } catch (error) {
        return badRequestResponse(res, false, "Something went wrong.", error)
    }
}

const changeBlogStatusByIds = async (req, res) => {
    try {
        // get Blog profile.
        const result = await getBlogById(id);
        if(result) {
            return successResponse(res, false, "Blog Profile.", result)
        }

    } catch (error) {
        return badRequestResponse(res, false, "Something went wrong.", error)
    }
}
