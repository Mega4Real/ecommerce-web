Frontend Setup (Vue):
1. Remove vercel.json from your Vue project (or make it empty {})
2. Set up environment variables for API calls:
Create .env file in your Vue project:
envVITE_API_URL=https://your-backend.vercel.app
3. Use the API URL in your Vue app:
javascript// In your API calls
const API_URL = import.meta.env.VITE_API_URL;

fetch(`${API_URL}/api/endpoint`)
  .then(res => res.json())
  .then(data => console.log(data));
4. Add environment variable in Vercel:

Go to your Vue project on Vercel
Settings → Environment Variables
Add: VITE_API_URL = https://your-backend.vercel.app
Redeploy


Backend Setup (Express):
1. Update vercel.json:
json{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
2. Enable CORS in your Express app to allow frontend requests:
javascriptconst cors = require('cors');

app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'http://localhost:5173' // for local development
  ]
}));
3. Install CORS if needed:
bashnpm install cors