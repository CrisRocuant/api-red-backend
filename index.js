const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');

const app = express();
app.use(cors());

// Agente HTTPS que ignora restricciones de certificados estrictos de APIs públicas
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

app.get('/api/prediccion', async (req, res) => {
    const stopCode = (req.query.cod || 'PB785').trim().toUpperCase();
    const apiUrl = `https://m.red.cl/rest/prediccion/paradero/${stopCode}`;

    try {
        const response = await axios.get(apiUrl, {
            httpsAgent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://m.red.cl/'
            },
            timeout: 8000
        });

        res.json(response.data);

    } catch (error) {
        console.error('Error al consultar la API de Red:', error.message);
        
        if (error.response) {
            return res.status(error.response.status).json({
                error: `Red respondió con estado ${error.response.status}`,
                paradero: stopCode,
                servicios: []
            });
        }

        res.status(500).json({
            error: 'No se pudo conectar con el servidor de Red',
            details: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.send('Servidor API Red Metropolitana activo 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});