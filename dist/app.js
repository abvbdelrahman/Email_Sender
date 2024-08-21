"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 1000;
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'pug');
// Static folder
app.use('/public', express_1.default.static(path_1.default.join(__dirname, 'public')));
// Middleware
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.get('/contact', (req, res) => {
    const message = req.query.msg ? decodeURIComponent(req.query.msg) : null;
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
    let transporter = nodemailer_1.default.createTransport({
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
        console.log('Preview URL: %s', nodemailer_1.default.getTestMessageUrl(info));
        const msg = 'Email has been sent';
        res.redirect(`/contact?msg=${encodeURIComponent(msg)}`);
    });
});
app.listen(port, () => console.log(`Server started on port ${port}...`));
//# sourceMappingURL=app.js.map