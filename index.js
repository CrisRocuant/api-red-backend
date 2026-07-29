const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

// Cabeceras estándar para simular una consulta de navegador web
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://www.red.cl/',
    'X-Requested-With': 'XMLHttpRequest'
};

app.get('/api/prediccion', async (req, res) => {
    const stopCode = (req.query.cod || 'PE161').trim().toUpperCase();

    // Probamos primero la variante REST con query param y si falla la ruta directa
    const urlPrimary = `https://www.red.cl/rest/prediccion/paradero?cod=${stopCode}`;
    const urlSecondary = `https://www.red.cl/rest/prediccion/paradero/${stopCode}`;

    try {
        let response = await fetch(urlPrimary, { headers: HEADERS });

        if (response.status === 404) {
            // Intentar ruta secundaria
            response = await fetch(urlSecondary, { headers: HEADERS });
        }

        if (response.status === 404) {
            return res.json({ 
                servicios: [], 
                mensaje: 'No se encontraron recorridos ni información activa para este paradero.' 
            });
        }

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: `Red.cl devolvió un código de estado ${response.status}` 
            });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Error al consultar Red.cl:', error.message);
        res.status(500).json({ 
            error: 'Error interno en el servidor proxy', 
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