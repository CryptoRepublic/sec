const express = require('express');
const fs = require('fs');
const path = require('path');

    const helmet = require('helmet');
    const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Use Helmet to set various HTTP headers for security
//app.use(helmet());

// Imposta manualmente gli header di sicurezza, escludendo X-Frame-Options
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
});

// Rate limiting to prevent brute force attacks
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', apiLimiter);

// Middleware to serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Middleware per verificare l'header personalizzato
app.use('/api/protected/*', (req, res, next) => {
    const secretHeader = req.headers['x-secret-header'];
    if (secretHeader !== 'mySecretValue') {
        return res.status(403).send('Forbidden');
    }
    next();
});

// API endpoint to serve protected files
app.get('/api/protected/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'protected', filename);

    fs.access(filePath, fs.constants.R_OK, (err) => {
        if (err) {
            return res.status(404).send('File not found');
        }
        res.sendFile(filePath);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
