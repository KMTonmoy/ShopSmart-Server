# ShopSmart-Server API

This is the server-side implementation of an ShopSmart-Server API using Node.js, Express.js, and MongoDB. The API manages users' cart items, allowing them to add, view, and delete items from their shopping cart.

## Features

- **User Authentication**: Manage user sessions and authenticate API requests.
- **Cart Management**: 
  - Add items to the cart.
  - View cart items.
  - Delete items from the cart.
- **Order Processing**: Place orders and clear cart items upon order confirmation.

## Technologies Used

- **Node.js**: JavaScript runtime for building server-side applications.
- **Express.js**: Web framework for building RESTful APIs.
- **MongoDB**: NoSQL database for storing cart and user information.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB.
- **JWT (JSON Web Tokens)**: For securing API endpoints and managing user authentication.
- **bcrypt.js**: For hashing and verifying user passwords.

## Prerequisites

- **Node.js** (version 14.x or higher)
- **MongoDB** (local or cloud instance)

## Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/KMTonmoy/ShopSmart-Server
    cd ShopSmart-Server
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Set up environment variables:**
    Create a `.env` file in the root directory with the following environment variables:
    ```bash
    PORT=8000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    ```

4. **Run the server:**
    ```bash
    nodemon index.js
    ```
    The server should be running on `http://localhost:8000`.

 

