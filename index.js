const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

// Cabeceras exactas que utiliza el sitio cuando navegas en "planifica-tu-viaje"
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'es-ES,es;q=0.9',
    'Referer': 'https://www.red.cl/planifica-tu-viaje/cuando-llega/',
    'X-Requested-With': 'XMLHttpRequest'
};

app.get('/api/prediccion', async (req, res) => {
    const stopCode = (req.query.cod || 'PB785').trim().toUpperCase();

    // Endpoints probables que usa la web de Red con codsimt
    const urlsToTry = [
        `https://www.red.cl/rest/prediccion/paradero?codsimt=${stopCode}`,
        `https://www.red.cl/rest/prediccion/paradero/${stopCode}`,
        `https://www.red.cl/rest/prediccion/paradero?cod=${stopCode}`
    ];

    let lastError = null;

    for (const url of urlsToTry) {
        try {
            const response = await fetch(url, { headers: HEADERS });

            if (response.ok) {
                const data = await response.json();
                // Verificamos que contenga datos válidos de servicios o respuesta
                if (data && (data.servicios || data.respuesta || Array.isArray(data))) {
                    return res.json(data);
                }
            } else if (response.status === 404) {
                lastError = '404';
            }
        } catch (err) {
            console.error(`Error consultando ${url}:`, err.message);
            lastError = err.message;
        }
    }

    // Si no encontró datos o fue 404, devolvemos un JSON limpio sin romper la app
    return res.json({
        servicios: [],
        mensaje: 'No hay información de buses disponibles para este paradero o el código no existe.'
    });
});

app.get('/', (req, res) => {
    res.send('Servidor API Red Metropolitana activo 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});