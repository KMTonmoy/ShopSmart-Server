const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
const uri = `${process.env.MongoURI}`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db('ShopSmart');
        const usersCollection = db.collection('users');
        const bannerCollection = db.collection('banner');
        const testimonialsCollection = db.collection('testimonials');
        const productsCollection = db.collection('products');
        const cartCollection = db.collection('cart');

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


        // Cart Related Api 
        app.get('/carts', async (req, res) => {
            const cart = await cartCollection.find().toArray();
            res.send(cart);
        });

        app.post('/cart', async (req, res) => {
            const newitem = req.body;
            const result = await cartCollection.insertOne(newitem);
            res.status(201).send(result);

        });

        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        })
        app.delete('/cartss/:email', async (req, res) => {
            const email = req.params.email;
            try {
                const query = { userEmail: email };
                const result = await cartCollection.deleteMany(query);
                if (result.deletedCount > 0) {
                    res.send({ message: 'Cart items deleted successfully' });
                } else {
                    res.status(404).send({ message: 'No items found for this email' });
                }
            } catch (error) {
                res.status(500).send({ message: 'Failed to delete items from cart' });
            }
        });




        // Products Route with Pagination
        app.get('/products', async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            try {
                const totalProducts = await productsCollection.countDocuments();
                const products = await productsCollection.find().skip(skip).limit(limit).toArray();

                res.send({
                    products,
                    currentPage: page,
                    totalPages: Math.ceil(totalProducts / limit),
                    totalProducts
                });
            } catch (error) {
                res.status(500).send({ message: 'Failed to fetch products' });
            }
        });
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.findOne(query);
            res.send(result);
        })



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
                res.status(500).send({ message: 'Failed to update user' });
            }
        });

        app.post('/user', async (req, res) => {
            const newUser = req.body;
            try {
                const result = await usersCollection.insertOne(newUser);
                res.status(201).send(result);
            } catch (error) {
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
