const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    credentials: true
}));
app.use(express.json());

// MongoDB Connection
const uri = "mongodb+srv://tonmoyahamed2009:tonmoytoma22@cluster0.k4r7r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        console.log("Connected to MongoDB");

        const db = client.db('ShopSmart');
        const usersCollection = db.collection('users');
        const bannerCollection = db.collection('banner');
        const testimonialsCollection = db.collection('testimonials');

        // JWT Route
        app.post('/jwt', async (req, res) => {
            const { email } = req.body;
            const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token });
        });

        // Banner Routes
        app.get('/banner', async (req, res) => {
            const banners = await bannerCollection.find().toArray();
            res.send(banners);
        });

        // Testimonials Routes
        app.get('/testimonials', async (req, res) => {
            const testimonials = await testimonialsCollection.find().toArray();
            res.send(testimonials);
        });

        app.post('/testimonial', async (req, res) => {
            const newComment = req.body;
            try {
                const result = await testimonialsCollection.insertOne(newComment);
                res.status(201).send(result);
            } catch (error) {
                console.error('Error adding comment:', error.message);
                res.status(500).send({ message: 'Failed to add comment' });
            }
        });

        // Users Routes
        app.get('/users', async (req, res) => {
            const users = await usersCollection.find().toArray();
            res.send(users);
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email });
            res.send(user);
        });

        app.delete('/users/:email', async (req, res) => {
            const email = req.params.email;
            try {
                const result = await usersCollection.deleteOne({ email });
                if (result.deletedCount > 0) {
                    res.send({ message: 'User deleted successfully' });
                } else {
                    res.status(404).send({ message: 'User not found' });
                }
            } catch (error) {
                res.status(500).send({ message: 'Failed to delete user' });
            }
        });

        app.put('/user', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const updateDoc = {
                $set: user,
                $setOnInsert: { timestamp: Date.now() }
            };
            const options = { upsert: true };
            try {
                const result = await usersCollection.updateOne(query, updateDoc, options);
                res.send(result);
            } catch (error) {
                console.error('Error updating user:', error.message);
                res.status(500).send({ message: 'Failed to update user' });
            }
        });

        app.post('/user', async (req, res) => {
            const newUser = req.body;
            try {
                const result = await usersCollection.insertOne(newUser);
                res.status(201).send(result);
            } catch (error) {
                console.error('Error registering user:', error.message);
                res.status(500).send({ message: 'Failed to register user' });
            }
        });

        app.get('/logout', (req, res) => {
            try {
                res.clearCookie('token', {
                    maxAge: 0,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                }).send({ success: true });
            } catch (error) {
                res.status(500).send({ message: 'Failed to log out' });
            }
        });

        app.get('/', (req, res) => {
            res.send('Server is running');
        });

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

    } finally {
        process.on('SIGINT', async () => {
            // await client.close();
            // process.exit(0);
        });
    }
}

run().catch(console.error);
