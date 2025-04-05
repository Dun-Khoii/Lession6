const express = require('express');
const app = express();
const mongoose = require('mongoose');
const PORT = 3000;
const User = require('./user.model');
const redis = require('redis');
require('dotenv').config();

//kết nối redis cloud
const redisClient = redis.createClient({url: process.env.REDIS_URL_CLOUD});

redisClient.on('connect', () => {
    console.log(`Redis client connected to: ${process.env.REDIS_URL_CLOUD}`);
});

redisClient.on('error', (err) => {
    console.error(`Redis connection error: ${err.message}`);
});

// Gọi connect()
redisClient.connect().catch((err) => {
    console.error(`Failed to connect Redis: ${err.message}`);
});

mongoose.connect('mongodb://localhost:27017/Redis')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));


//tạo dữ liệu giả
app.post('/', async (req, res) => {
    const users = [];
    for (let i = 0; i < 10000; i++) {
        users.push({
            name: `user${i}`,
            email: `user${i}@example.com`,
            age: Math.round(Math.random() * 50) + 18,
        });
    }
    await User.insertMany(users);
    res.status(200).json('success');
});
app.get('/get-with-no-cache', async (req, res) => {
    const start = Date.now();
    const result = await User.countDocuments({});
    const duration = Date.now() - start;

    res.status(200).json({
        total: result,
        time: duration,
    });
});

app.get('/get-with-cache', async (req, res) => {
    const start = Date.now();
    const usersCache = await redisClient.get('users');
    if (!usersCache) {
        const result = await User.countDocuments({});
        await redisClient.set('users', JSON.stringify(result));
        res.status(200).json({
            total: result,
            time: Date.now() - start,
        });
    } else {
        res.status(200).json({
            users: await JSON.parse(usersCache),
            time: Date.now() - start,
        });
    }
});


app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});