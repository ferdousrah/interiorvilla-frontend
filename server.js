import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sendEmailHandler from './api/send-email.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Add error handling for server startup
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Middleware
app.use(cors());
app.use(express.json());

// API route
app.post('/api/send-email', sendEmailHandler);

// Team members API endpoint
app.get('/api/team-members', (req, res) => {
  // Proxy request to Payload CMS
  fetch('https://cms.interiorvillabd.com/api/team-members?depth=1')
    .then(response => response.json())
    .then(data => res.json(data))
    .catch(error => {
      console.error('Error fetching team members:', error);
      res.status(500).json({ error: 'Failed to fetch team members' });
    });
});

// Serve static files from dist directory (for production)
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing (for production)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server successfully started on port ${PORT}`);
  console.log(`🌐 API endpoint available at: http://localhost:${PORT}/api/send-email`);
}).on('error', (error) => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
});