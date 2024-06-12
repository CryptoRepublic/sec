const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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
