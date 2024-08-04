
# YOUTUBE BACKEND CLONE

## Overview

This project is a backend clone of YouTube, designed to mimic the core functionalities of the popular video-sharing platform. It is built using Node.js, Express.js, and MongoDB. The main features include user authentication, video streaming, commenting on videos, subscription model, and watch history.

## Features

- User Authentication (Sign Up, Log In, Log Out)
- Video Streaming
- Commenting on Videos
- Like and Dislike Videos
- User Profile Management
- Subscription Model
- Watch History

## Technologies Used

- **Node.js**: JavaScript runtime for building the server-side application.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing user and video data.
- **Mongoose**: ODM for MongoDB and Node.js.
- **JWT**: JSON Web Tokens for authentication.

## Project Structure

```
YOUTUBE BACKEND CLONE/
├── node_modules/
├── public/
│ └── temp/
│ └── .gitkeep
├── src/
│ ├── controllers/
│ │ └── user-controller.js
│ ├── db/
│ │ └── db.js
│ ├── middlewares/
│ │ ├── auth.js
│ │ └── multer.js
│ ├── models/
│ │ ├── subscription-model.js
│ │ ├── user-model.js
│ │ └── video-model.js
│ ├── routes/
│ │ └── user-routes.js
│ ├── utils/
│ │ ├── ApiError.js
│ │ ├── ApiResponse.js
│ │ ├── asyncHandler.js
│ │ └── cloudinary.js
├── app.js
├── constants.js
├── index.js
├── .env
├── .gitignore
├── .prettierignore
├── .prettierrc
├── package-lock.json
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB installed and running

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Nitesh-18/Youtube-Backend-Clone.git
cd Youtube-Backend-Clone
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory and add the following:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the server:

```bash
npm start
```

The server should now be running on `http://localhost:5000`.

<!-- ## API Endpoints

### Auth

- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/login`: Log in a user

### Videos

- `GET /api/videos`: Get all videos
- `GET /api/videos/:id`: Get a video by ID

### Comments

- `POST /api/comments`: Add a comment to a video
- `GET /api/comments/:videoId`: Get all comments for a video
- `DELETE /api/comments/:id`: Delete a comment by ID

### Subscriptions

- `POST /api/subscriptions`: Subscribe to a channel
- `GET /api/subscriptions`: Get all subscriptions for a user

### Watch History

- `POST /api/watchHistory`: Add a video to watch history
- `GET /api/watchHistory`: Get watch history for a user -->


## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

## Contact

For any questions or feedback, please contact me via [LinkedIn](https://www.linkedin.com/in/nitesh-r-a15518243/).

---
