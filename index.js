const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());

app.get('/api/prediccion', async (req, res) => {
    const stopCode = (req.query.cod || 'PB785').trim().toUpperCase();
    const url = `https://www.red.cl/planifica-tu-viaje/cuando-llega/?codsimt=${stopCode}`;

    let browser = null;

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process'
            ]
        });

        const page = await browser.newPage();
        let apiData = null;

        // Interceptamos la llamada interna de red.cl que trae el JSON con los buses
        page.on('response', async (response) => {
            const respUrl = response.url();
            if (respUrl.includes('/rest/prediccion/') || respUrl.includes('prediccion')) {
                try {
                    const json = await response.json();
                    if (json) apiData = json;
                } catch (e) {
                    // Ignorar respuestas que no sean JSON
                }
            }
        });

        // Navegar a la página y esperar la carga dinámica
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });

        await browser.close();

        if (apiData) {
            return res.json(apiData);
        }

        // Si no se capturó respuesta JSON directa, devolvemos respuesta estructurada
        res.json({
            paradero: stopCode,
            servicios: []
        });

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error con Puppeteer:', error.message);
        res.status(500).json({
            error: 'Error al obtener la información en tiempo real',
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