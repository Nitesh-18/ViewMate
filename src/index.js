// require('dotenv').config;  ------------> Bad way
import dotenv from "dotenv";
import connectDB from './db/db.js';

dotenv.config({
    path: './env'
})

connectDB();