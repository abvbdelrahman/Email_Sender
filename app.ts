import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const port = process.env.PORT || 1000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/contact', (req, res) => {
    const message = req.query.msg ? decodeURIComponent(req.query.msg as string) : null;
    res.render('contact', { msg: message });
});

app.post('/send', (req, res) => {
    const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>Company: ${req.body.company}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${req.body.phone}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

  // Create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Setup email data with unicode symbols
  let mailOptions = {
    from: `"Contact Form" <${process.env.EMAIL_USER}>`,
    to: req.body.recipientEmail,
    subject: 'New Contact Request',
    text: 'Hello world?',
    html: output
  };
  
  // Send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      const msg = 'Failed to send email';
      return res.redirect(`/contact?msg=${encodeURIComponent(msg)}`);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    const msg: string = 'Email has been sent';
    res.redirect(`/contact?msg=${encodeURIComponent(msg)}`);
  });
});

app.listen(port, () => console.log(`Server started on port ${port}...`));
