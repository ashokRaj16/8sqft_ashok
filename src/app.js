import express from 'express';
import path from 'path';

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.resolve('src', 'views'));


// app.set('views', path.join(path.dirname(new URL(import.meta.url).pathname), "views"));
// console.log(path.join(path.dirname(new URL(import.meta.url).pathname), "views") );
// console.log("Path: ", path.resolve('src', 'views'));
// app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.render('index');
})

app.get('*', (req, res) => {
    res.render('404');
})

export default app;