const express   = require('express');
app         = express(),
path        = require('path'),
bodyParser  = require('body-parser'),
nodemailer  = require('nodemailer'),
mongoose    = require('mongoose'),
Customer    = require('./models/customer'),
require('dotenv').config(),
engines = require('consolidate');

let url = process.env.DATABASEURL || "mongodb://localhost/cvDB-test"
mongoose.connect(url,{ useUnifiedTopology: true, useNewUrlParser: true }); 

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname,'public')))


app.set('views', __dirname + '/views');
app.engine('html', engines.mustache);
app.set('view engine', 'html');

app.get('/', function(req,res){
    res.render('index')
})

// route which captures form details, uploads it to database and then sends mail for confirmation
app.post('/done',(req,res,next)=>{
  /*Uploading lead data to database. Creates an object then stores it to MongoDB.*/
  const name = req.body.name,
  email = req.body.email,
  phoneNo = req.body.phonenumber,
  leadScore = req.body.stage,
  ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
  console.log(req.body)

  const newCustomer = {name:name, email:email, phoneNo:phoneNo, leadScore:leadScore, ip:ip}
  Customer.create(newCustomer, function(err,newlyCreated){
      if(err){
          console.log(err)
      }else{
          console.log(newlyCreated);
      }
  })
    
    /*Transport service is used by node mailer to send emails, it takes service and auth object as parameters.
    here we are using gmail as our service 
    In Auth object , we specify our email and password
    */
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
      user: process.env.MAIL,//replace with your email
      pass: process.env.MAILKEY//replace with your password
  }
}); 

  /*
    In mail options we specify from and to address, subject and HTML content.
    In our case , we use our personal email as from and to address,
    html is our form details which we parsed using bodyParser.
    */
    var mailOptions = {
    from: process.env.MAIL,//replace with your email
    to: `${req.body.email}`,//replace with your email
    subject: `CrackVerbal Registration Successful`,
    html:`<h2> Dear ${req.body.name},</h2><br>
    <h3> Thank you for registering for CrackVerbal Webinar.</h3><br>`
};

  /* Here comes the important part, sendMail is the method which actually sends email, it takes mail options and
   call back as parameter 
   */

   transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      res.send('error') // if error occurs send error as response to client
  } else {
      console.log('Email sent: ' + info.response);
//      res.send('Registration Successful. Thank you for participating.')//if mail is sent successfully send Sent successfully as response
      res.redirect('/done')
  }
});
})

app.get('/done',function(req,res){
    res.render('done')
})
let PORT = process.env.PORT || 5051;
app.listen(PORT, process.env.IP, () => console.log("cv-rf Server Has Started! PORT:",PORT));