Update your vercel.json to:
json{
  "rewrites": [
    {
      "source": "/(.*)",
      "dest": "/index.js"
    }
  ]
}