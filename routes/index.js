var express = require("express");
var router = express.Router();
const fs = require('fs');
const request = require("request");
const nodemailer = require('nodemailer')
const cors = require('cors');
const XLSX = require('xlsx');
const path = require('path');
const dataFolderPath = path.join(__dirname, 'data');
const filePath = path.join(dataFolderPath, 'join-requests.xlsx');

router.use(cors({
  origin: 'https://cybersec-tcoer.onrender.com'
  // origin: 'http://localhost:3000'
}));
// router.use(cors());

router.get("/", function (req, res, next) {
  res.render("index", { title: "TCOER | Cybersecurity Club" });
});

router.get("/medium-feed", (req, res) => {
  request("https://medium.com/feed/@Cyb3rsecurity", (error, response, body) => {
    if (error) return res.status(500).send(error);
    res.set("Content-Type", "application/xml");
    res.send(body);
  });
});

router.get("/blog", (req, res) => {
  res.render("blog-page", { title: "TCOER | Cybersecurity Club" });
});

router.get("/resources", (req, res) => {
  res.render("resources-page", { title: "TCOER | Cybersecurity Club" });
});

router.get("/events", (req, res) => {
  res.render("events-page", { title: "TCOER | Cybersecurity Club" });
});

router.get("/contact", (req, res) => {
  res.render("contact-page", { title: "TCOER | Cybersecurity Club" });
});

router.post('/submit-join-form', async (req, res) => {
  console.log('Request Body:', req.body);
  const { name, email, message } = req.body;

  try {
    if (!fs.existsSync(dataFolderPath)) {
      fs.mkdirSync(dataFolderPath, { recursive: true });
      console.log('Data folder created.');
    }

    let workbook;
    let sheet;
    if (fs.existsSync(filePath)) {
      // Load existing workbook
      workbook = XLSX.readFile(filePath);
      console.log('Existing file loaded.');
      sheet = workbook.Sheets['Join Requests'] || XLSX.utils.json_to_sheet([], { header: ['Name', 'Email', 'Message'] });
    } else {
      // Create new workbook and sheet
      console.log('No file found, creating a new one.');
      sheet = XLSX.utils.json_to_sheet([], { header: ['Name', 'Email', 'Message'] });
      workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, 'Join Requests');
    }

    // Add new row to the sheet
    const newRow = { Name: name, Email: email, Message: message };
    XLSX.utils.sheet_add_json(sheet, [newRow], { header: ['Name', 'Email', 'Message'], skipHeader: true, origin: -1 });

    // Save the workbook to file
    XLSX.writeFile(workbook, filePath);
    console.log('File saved successfully.');

    res.send('Form data saved to Excel sheet.');
  } catch (error) {
    console.error('Error saving to Excel:', error);
    res.status(500).send('Failed to save data.');
  }
});

router.post('/send-email', (req, res) => {
  const { name, email, message } = req.body;

  // Configure the transporter for nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or use another email service
    auth: {
      user: 'rohanunbeg0918@gmail.com', // replace with your email
      pass: 'wcbp fqdo prxm jwmm', // replace with your email password or app-specific password
    },
  });

  // Email options
  const mailOptions = {
    from: email, // sender address
    to: 'rohanunbegfreelance@gmail.com', // receiver address
    subject: `Message from ${name}`, // Subject line
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).send('Message sent successfully');
    }
  });
});


module.exports = router;
