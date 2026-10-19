# Guía de Despliegue en Producción — Sendero / TeaLearning (PWA1)

> Consulta la guía maestra sincronizada en ambos repositorios para el despliegue en **Azure App Service + Azure SQL Database** (`PWA1-BACKEND-API`) y **Cloudflare Pages** (`PWA1-FRONTEND`).

- **Archivo de configuración de rutas Cloudflare Pages:** [`_redirects`](./_redirects) (`/` $\rightarrow$ `/Interfaz_General.html 200`)
- **Archivo de cabeceras de seguridad y caché Cloudflare Pages:** [`_headers`](./_headers)
- **Resolución automática de entorno (`localhost` vs Producción):** [`api-client.js`](./api-client.js) (`PRODUCTION_API_URL`)
- **Guía paso a paso completa:** Ver [`PWA1-BACKEND-API/DEPLOYMENT_GUIDE.md`](../PWA1-BACKEND-API/DEPLOYMENT_GUIDE.md)
