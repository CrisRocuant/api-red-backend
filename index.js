const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Habilitar CORS para permitir peticiones desde tu app en Firebase
app.use(cors());

// Ruta principal para consultar la predicción de paraderos
app.get('/api/prediccion', async (req, res) => {
    const stopCode = (req.query.cod || 'PB1230').trim().toUpperCase();
    const url = `https://www.red.cl/rest/prediccion/paradero/${stopCode}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://www.red.cl/',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

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

// Ruta de prueba para verificar que el servidor está encendido
app.get('/', (req, res) => {
    res.send('Servidor API Red Metropolitana activo 🚀');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});