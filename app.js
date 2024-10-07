const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const userModel = require('./models/usermodel');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Failed to connect to MongoDB', err));

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/create', async (req, res) => {
    let { name, email, image } = req.body;
    let user = await userModel.create({ name, email, image });
    res.redirect('read');
});

app.get('/read', async (req, res) => {
    let users = await userModel.find();
    res.render('read', { users });
});

app.get('/delete/:id', async (req, res) => {
    await userModel.findOneAndDelete({ _id: req.params.id });
    res.redirect('/read');
});

app.get('/edit/:userid', async (req, res) => {
    let user = await userModel.findOne({ _id: req.params.userid });
    res.render('edit', { user });
});

app.post('/update/:userid', async (req, res) => {
    let { name, email, image } = req.body;
    await userModel.findOneAndUpdate({ _id: req.params.userid }, { name, email, image }, { new: true });
    res.redirect('/read');
});

app.use((err, req, res, next) => {
    console.error(err.stack); // Log error stack
    res.status(500).send('Something went wrong!'); // Send a user-friendly message
});

// Export app for Vercel serverless
module.exports = app;
