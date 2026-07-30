const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();
app.use(cors());

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.9'
};

app.get('/api/prediccion', async (req, res) => {
    const stopCode = (req.query.cod || 'PB785').trim().toUpperCase();
    const url = `https://www.red.cl/planifica-tu-viaje/cuando-llega/?codsimt=${stopCode}`;

    try {
        const response = await fetch(url, { headers: HEADERS });

        if (!response.ok) {
            return res.json({ servicios: [], mensaje: 'No se pudo conectar con Red.cl' });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const serviciosMap = {};

        // Extraer los buses desde la estructura DOM del sitio oficial
        $('.item-servicio, .servicio-item, [data-servicio]').each((_, el) => {
            const $el = $(el);
            const servicio = $el.find('.nombre-servicio, .servicio, h4').text().trim() || 'Servicio';
            const tiempo = $el.find('.tiempo, .distancia-tiempo').text().trim() || 'Sin estimación';
            const distancia = $el.find('.distancia').text().trim() || '';

            if (servicio) {
                if (!serviciosMap[servicio]) {
                    serviciosMap[servicio] = { id: servicio, buses: [] };
                }
                serviciosMap[servicio].buses.push({ tiempo, distancia });
            }
        });

        const servicios = Object.values(serviciosMap);

        // Retornar siempre en el formato JSON esperado por el frontend
        res.json({
            paradero: stopCode,
            servicios: servicios
        });

    } catch (error) {
        console.error('Error al realizar scraping:', error.message);
        res.status(500).json({ 
            error: 'Error procesando la información del paradero', 
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