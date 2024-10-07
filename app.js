const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const userModel = require('./models/usermodel');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB with options to avoid deprecation warnings
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// Set up middleware
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/create', async (req, res) => {
    try {
        const { name, email, image } = req.body;

        // Basic validation (ensure all fields are provided)
        if (!name || !email || !image) {
            return res.status(400).send('All fields are required');
        }

        const user = await userModel.create({ name, email, image });
        
        // Redirect to read after successful creation
        res.redirect('/read');
    } catch (error) {
        console.error('Error creating user:', error);
        
        // Handle specific error messages
        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(409).send('User already exists'); // Handle unique constraint violation
        }
        
        res.status(500).send('Error creating user');
    }
});

app.get('/read', async (req, res) => {
    try {
        const users = await userModel.find(); // Ensure this query is efficient
        res.render('read', { users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Error fetching users');
    }
});

app.get('/delete/:id', async (req, res) => {
    try {
        await userModel.findByIdAndDelete(req.params.id);
        res.redirect('/read');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Error deleting user');
    }
});

app.get('/edit/:userid', async (req, res) => {
    try {
        const user = await userModel.findById(req.params.userid);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('edit', { user });
    } catch (error) {
        console.error('Error fetching user for edit:', error);
        res.status(500).send('Error fetching user');
    }
});

app.post('/update/:userid', async (req, res) => {
    try {
        const { name, email, image } = req.body;
        await userModel.findByIdAndUpdate(req.params.userid, { name, email, image }, { new: true });
        res.redirect('/read');
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Error updating user');
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!'); // Send a user-friendly message
});

// Start server (if not using serverless)
if (process.env.NODE_ENV !== 'serverless') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
