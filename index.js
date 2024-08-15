const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const port = process.env.PORT || 8000;

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
        ],
        credentials: true
    })
);

app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://tonmoyahamed2009:tonmoytoma22@cluster0.wgmtb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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

        const usersCollection = client.db('classmaster').collection('users');
        const bannerCollection = client.db('classmaster').collection('banner');
        const testimonialsCollection = client.db('classmaster').collection('testimonials');


        // JWT Related Server

        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

            res.send({ token });
        });

        // Banner Realated Server
        app.get('/banner', async (req, res) => {
            const banner = await bannerCollection.find().toArray();
            res.send(banner);
        });


        // testimonials Related Server
        app.get('/testimonials', async (req, res) => {
            const test = await testimonialsCollection.find().toArray();
            res.send(test);
        });


        app.post('/testimonial', async (req, res) => {
            const newComment = req.body;
            try {
                const result = await testimonialsCollection.insertOne(newComment);
                res.status(201).send(result);
            } catch (error) {
                console.error('Error registering user:', error.message);
                res.status(500).send({ message: 'Failed to Add Comment' });
            }
        });






        //Users Related Endpoint's
        app.get('/users', async (req, res) => {
            const users = await usersCollection.find().toArray();
            res.send(users);
        });


        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const result = await usersCollection.findOne({ email });
            res.send(result);
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
            const query = { email: user?.email, name: user.displayName };
            const isExist = await usersCollection.findOne(query);
            if (isExist) {
                if (user.status === 'Requested') {
                    const result = await usersCollection.updateOne(query, {
                        $set: { status: user?.status },
                    });
                    return res.send(result);
                } else {
                    return res.send(isExist);
                }
            }

            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    ...user,
                    timestamp: Date.now(),
                },
            };
            const result = await usersCollection.updateOne(query, updateDoc, options);
            res.send(result);
        });

        app.post('/user', async (req, res) => {
            const newUser = req.body;
            try {
                const result = await usersCollection.insertOne(newUser);
                res.status(201).send(result);
            } catch (error) {
                console.error('Error registering user:', error.message);
                res.status(500).send({ message: 'Failed to register user. Please try again.' });
            }
        });




        app.get('/logout', async (req, res) => {
            try {
                res.clearCookie('token', {
                    maxAge: 0,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                }).send({ success: true });
            } catch (err) {
                res.status(500).send(err);
            }
        });

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

    } finally {
        process.on('SIGINT', async () => {


        });
    }
}


run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('classmaster is sitting');
});
