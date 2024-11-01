const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');

const app = express();

// Import your modules
const socketHandler = require('./controllers/Socket');
const database = require('./config/database');
const cloud = require('./config/cloudinary');

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(express.json());
app.use(cookieParser());

// CORS setup for HTTP requests
app.use(cors({
    origin: 'https://nexier.vercel.app/',  // Allow this origin
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// File upload setup
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp'
}));

// Database and cloud service connections
database.connect();
cloud.cloudinaryconnect();

// Serve static files
// app.use(express.static(path.join(__dirname, 'public')));

// Define your routes
const userRoutes = require('./routes/User');
const itemsRoutes = require('./routes/Items');
const profileRoute = require('./routes/Profile');
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/item', itemsRoutes);
app.use('/api/v1/profile', profileRoute);

app.get('/data', (req, res) => {
    const sampleData = {
        message: 'Hello, this is your JSON response!',
        data: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
            { id: 3, name: 'Item 3' }
        ]
    };
    res.json(sampleData);
});


// Set up server and socket.io
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: 'https://nexier.vercel.app/',  // Allow this origin for WebSocket connections
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Pass the socket.io instance to the WebSocket handler
socketHandler(io);

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
