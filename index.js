const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/prediccion', async (req, res) => {
    const stopCode = (req.query.cod || 'PB785').trim().toUpperCase();
    
    // URL de la API directa de Red.cl
    const apiUrl = `https://www.red.cl/rest/prediccion/paradero/${stopCode}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://www.red.cl/planifica-tu-viaje/cuando-llega/'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({
                error: `Red.cl devolvió un código de estado ${response.status}`,
                paradero: stopCode,
                servicios: []
            });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Error al consultar la API de Red:', error.message);
        res.status(500).json({
            error: 'Error de servidor al consultar información en tiempo real',
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