const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

app.get('/api/prediccion', async (req, res) => {
    const stopCode = (req.query.cod || 'PB785').trim().toUpperCase();
    
    // API pública de XOR.cl para transporte Red
    const apiUrl = `https://api.xor.cl/red/bus-stop/${stopCode}`;

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 8000
        });

        res.json(response.data);

    } catch (error) {
        console.error('Error al consultar XOR.cl:', error.message);

        if (error.response) {
            return res.status(error.response.status).json({
                error: `No se pudo obtener la información del paradero ${stopCode}`,
                status: error.response.status
            });
        }

        res.status(500).json({
            error: 'Error de conexión con el servicio de buses',
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