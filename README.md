# 🛒 E-Commerce API

A Node.js + Express REST API for managing products, shopping carts, and user accounts.  
This API allows customers to browse products, and add items to their cart.  
It also provides secure admin routes for managing the store.

---

## Features

- User registration & login (JWT authentication)
- Product CRUD operations
- Shopping cart creation, update & retrieval
- Secure routes for authenticated users
- Image uploads for products
- MongoDB + Mongoose for data persistence

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **File Uploads:** Multer and cloudinary
- **Other Tools:** bcrypt, dotenv, nodemon

---

| Method       | Endpoint                  | Description               | Auth Required | Admin Auth Required |
| ------------ | ------------------------- | ------------------------- | ------------- | ------------------- |
| **User**     |                           |                           |               |
| POST         | `/createUser`             | Register a new user       | No            | No                  |
| POST         | `/login`                  | Login and get JWT         | No            | No                  |
| GET          | `/getUsers`               | Get all users             | Yes           | Yes                 |
| GET          | `/getUserByID/:id`        | Get a particular user     | Yes           | Yes                 |
| PUT          | `/updateUser/:id`         | Update user               | Yes           | No                  |
| **Category** |                           |                           |               |
| POST         | `/createCategory`         | Create category           | Yes           | Yes                 |
| PUT          | `/updateCategory/:id`     | Update a category         | Yes           | Yes                 |
| DELETE       | `/deleteCategoryByID/:id` | Delete a category         | Yes           | Yes                 |
| GET          | `/getCategories`          | Get all categories        | No            | No                  |
| GET          | `/getCategoryByID/:id`    | Get alll categories by id | No            | No                  |
| **Products** |                           |                           |               |
| POST         | `/createProduct`          | Get all products          | Yes           | Yes                 |
| GET          | `/getAllProducts`         | Get product details       | No            | No                  |
| GET          | `/getProductByID/:id`     | Get a product             | No            | No                  |
| PUT          | `/updateProduct/:id`      | Update a product          | Yes           | Yes                 |
| DELETE       | `/deleteProductByID/:id`  | Delete a product          | Yes           | Yes                 |
| **Cart**     |                           |                           |               |
| GET          | `/getCart`                | Get current user's cart   | Yes           | No                  |
| POST         | `/createCart`             | Create cart               | Yes           | No                  |
| PUT          | `/updateCart/:id`         | Update cart               | Yes           | No                  |
| DELETE       | `/deleteCartByID/:id`     | Delete cart               | Yes           | No                  |

---

src/
│── config/ # DB connection & environment setup
│── controllers/ # Business logic
│── models/ # Mongoose schemas
│── routes/ # API routes
│── middleware/ # Authentication
│── utils/ # Helper functions
│── app.js # Main Express app
│── server.js # Server entry point
