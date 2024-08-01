// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const WebSocket = require('ws');
const http = require('http');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 5000;

const cors = require('cors')
app.use(cors())

mongoose.connect('mongodb://localhost:27017/realtimeprices', { useNewUrlParser: true, useUnifiedTopology: true });

const priceSchema = new mongoose.Schema({
    symbol: String,
    price: Number,
    timestamp: { type: Date, default: Date.now }
});

const Price = mongoose.model('Price', priceSchema);

const fetchData = async () => {
    const symbols = ['bitcoin', 'ethereum', 'litecoin', 'ripple', 'cardano'];
    try {
        for (const symbol of symbols) {
            const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
            const price = response.data[symbol].usd;
            const priceData = new Price({ symbol, price });
            await priceData.save();
            broadcastPrice({ symbol, price, timestamp: new Date() });
        }
    } catch (error) {
        console.error(error);
    }
};

const broadcastPrice = (data) => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

setInterval(fetchData, 5000);

app.get('/prices/:symbol', async (req, res) => {
    const { symbol } = req.params;
    const prices = await Price.find({ symbol }).sort({ timestamp: -1 }).limit(20);
    res.json(prices);
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
