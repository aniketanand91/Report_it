// import { getLocation } from './Assest/report-it-main';
// var loc = require('./Assest/report-it-main');
var con = require('./connection');
var multer = require('multer');
var express = require('express');
const cloudinary = require('cloudinary').v2;
var app = express();
const moment = require('moment-timezone');
const port=7000;
var path=require('path');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
var mapsdk = require('mapmyindia-sdk-nodejs');



cloudinary.config({
    cloud_name: 'dwd4wntjw',
    api_key: '882292927282525',
    api_secret: 'xDhjRjckhLaKbXzPOT1OlQiGMjo'
  });

con.connect((error) => {
    if (error) {
      console.log('Error connecting to MySQL database');
    } else {
      console.log('Connected to MySQL database');
    }
  });

const upload = multer({
    storage: multer.diskStorage({}),
    limits: { fileSize: 9000000 }, // 9 MB file size limit
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        cb('Error: File must be an image', false);
      } else {
        cb(null, true);
      }
    }
  });



app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))
app.use(express.static('Assest'));



app.get('/',function(req,res){
    return res.render('index')
})


app.post('/',upload.single('picture'), async (req,res)  => {
    try{

        var phone_no = req.body.phone_no;
        var pin_code = req.body.pin_code;
        var land_mark = req.body.land_mark;
        const result = await cloudinary.uploader.upload(req.file.path);
        const imageUrl = result.url;

        const now = moment().tz('Asia/Kolkata');
        const formattedDate = now.format('DD-MM-YYYY HH:mm:ss');

        var sql ="INSERT INTO report_it(reported_at,phone_no,pin_code,land_mark,picture_url) VALUES('"+formattedDate+"','"+phone_no+"','"+pin_code+"','"+land_mark+"','"+imageUrl+"');"
        con.query(sql, (error, results) => {
            if (error) {
              console.log(error);
              res.status(500).send('Error inserting image URL into MySQL database');
            } else {
              console.log('Image URL inserted into MySQL database');
              res.status(200).render('submission_page');
            }
          });
        } catch (error) {
          console.log(error);
          res.status(500).send('Error uploading image to Cloudinary');
        }
      }); 

      app.listen(port,function(error){
        if(error){
            console.log("Something Wrong")
        }
        console.log("Server Running up",port)
      });