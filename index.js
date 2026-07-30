const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/prediccion', async (req, res) => {
    const stopCode = (req.query.cod || 'PB785').trim().toUpperCase();
    
    // Endpoint oficial y directo de consulta de paraderos de Red
    const apiUrl = `https://m.red.cl/rest/prediccion/paradero/${stopCode}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://m.red.cl/'
            }
        });

        if (!response.ok) {
            // Si el paradero no existe o la API falla
            return res.status(response.status).json({
                error: `No se encontró información para el paradero ${stopCode}`,
                paradero: stopCode,
                servicios: []
            });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Error al consultar la API:', error.message);
        res.status(500).json({
            error: 'Error interno al conectar con el servicio de buses',
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