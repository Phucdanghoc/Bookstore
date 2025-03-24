const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require ('body-parser')
const routes = require('./routers/index');
dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended:false}))
app.use(bodyParser.json())
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/Bookstore';
mongoose
    .connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection failed:', err.message));
app.use("/uploads", express.static("uploads"));
app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
