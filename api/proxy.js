export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins (or specify your frontend URL)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allowed methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allowed headers

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end(); // Respond to preflight requests
        return;
    }

    // Your API logic here
    const apiKey = req.query.apiKey; // Get the API key from the query parameters
    const response = await fetch('https://api.real-debrid.com/rest/1.0/user', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });

    const data = await response.json();
    res.status(response.status).json(data); // Send the response back to the client
}