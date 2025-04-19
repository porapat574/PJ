const express = require('express')
const app = express()
const port = 3000;
const path = require('path')
const ejs = require('ejs')
const cors = require('cors'); 
const routes = require('./routes/routes.js')
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use(express.static(path.join(__dirname,'public/img')))
app.use(express.urlencoded({extended: false}))
app.set('views', path.join(__dirname,'views'))
app.set('view engine','ejs')
app.use(routes)

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
