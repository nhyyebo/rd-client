const express = require('express');
const cors = require('cors');
const app = express();

// Allow requests from specific origin
app.use(cors({
    origin: 'https://aesthetic-rd.netlify.app/' // Replace with your frontend URL
}));

app.get('/your-endpoint', (req, res) => {
    res.json({ message: 'Hello World' });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
