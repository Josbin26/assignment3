// Task1: initiate app and run server at 3000

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path=require('path');
app.use(express.static(path.join(__dirname+'/dist/FrontEnd')));
// Task2: create mongoDB connection 

// Set MONGODB_URI in a .env file to your MongoDB Atlas connection string.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((error) => console.error('MongoDB connection error:', error.message));

// Define the employee document structure. Mongoose uses the "employees" collection.
const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 }
}, { versionKey: false });

const Employee = mongoose.models.Employee ||
    mongoose.model('Employee', employeeSchema, 'employees');

//Task 2 : write api with error handling and appropriate api mentioned in the TODO below


//TODO: get data from db  using api '/api/employeelist'
app.get('/api/employeelist', async (req, res, next) => {
    try {
        const employees = await Employee.find({});
        res.status(200).json(employees);
    } catch (error) {
        next(error);
    }
});


//TODO: get single data from db  using api '/api/employeelist/:id'
app.get('/api/employeelist/:id', async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json(employee);
    } catch (error) {
        next(error);
    }
});


//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.post('/api/employeelist', async (req, res, next) => {
    try {
        const { name, location, position, salary } = req.body;
        if (name == null || location == null || position == null || salary == null ||
            String(name).trim() === '' || String(location).trim() === '' ||
            String(position).trim() === '' || !Number.isFinite(Number(salary)) ||
            Number(salary) < 0) {
            return res.status(400).json({
                message: 'Please provide name, location, position, and a valid non-negative salary'
            });
        }

        const employee = await Employee.create({
            name: String(name).trim(),
            location: String(location).trim(),
            position: String(position).trim(),
            salary: Number(salary)
        });
        res.status(201).json(employee);
    } catch (error) {
        next(error);
    }
});


//TODO: delete a employee data from db by using api '/api/employeelist/:id'
app.delete('/api/employeelist/:id', async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json({ message: 'Employee deleted successfully', employee });
    } catch (error) {
        next(error);
    }
});


//TODO: Update  a employee data from db by using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.put('/api/employeelist', async (req, res, next) => {
    try {
        // The frontend sends the employee object; accept either _id or id.
        const id = req.body._id || req.body.id;
        const { name, location, position, salary } = req.body;

        if (!id || !mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'A valid employee _id is required' });
        }
        if (name == null || location == null || position == null || salary == null ||
            String(name).trim() === '' || String(location).trim() === '' ||
            String(position).trim() === '' || !Number.isFinite(Number(salary)) ||
            Number(salary) < 0) {
            return res.status(400).json({
                message: 'Please provide name, location, position, and a valid non-negative salary'
            });
        }

        const employee = await Employee.findByIdAndUpdate(
            id,
            {
                name: String(name).trim(),
                location: String(location).trim(),
                position: String(position).trim(),
                salary: Number(salary)
            },
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json(employee);
    } catch (error) {
        next(error);
    }
});

// The provided build folder is named "Frontend" (capital F); retain the supplied
// static-path line above and also serve the actual folder name.
app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));

// API and database errors return JSON instead of an HTML error page.
app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Internal server error' });
});

//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Employee App server running on port ${PORT}`);
});

