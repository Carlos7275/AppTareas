# Proyecto de Tareas - API y Frontend

Este proyecto es una aplicación de gestión de tareas con **backend en NestJS** y **frontend en React**. Permite crear, consultar y administrar tareas, así como recibir notificaciones push mediante Firebase Cloud Messaging (FCM).  

---

## 🏗 Arquitectura del Proyecto

El proyecto se divide en dos partes principales:

1. **Backend (API - NestJS)**  
   - Servidor REST que maneja usuarios, tareas y notificaciones.  
   - Se conecta a **MySQL**, **Redis** y **RabbitMQ**.  
   - Implementa notificaciones push usando Firebase Admin SDK.  
   - Cron jobs para enviar recordatorios de tareas próximas a vencer.  

2. **Frontend (React)**  
   - Aplicación web en React con rutas protegidas y públicas.  
   - Integración con Firebase para notificaciones push.  
   - Dashboard de tareas y descargas de reportes.  

---

## ⚡ Backend (NestJS)

### Características

- CRUD de usuarios y tareas.  
- Manejo de prioridades (`LEVE`, `NORMAL`, `MEDIANA`, `ALTA`).  
- Notificaciones push vía FCM a dispositivos registrados.  
- Cron jobs automáticos para enviar recordatorios.  
- Uso de **TypeORM** con MySQL.  
- Cache con Redis y mensajería con RabbitMQ.  


---

## ⚛ Frontend (React)

### Características

- Login y registro de usuarios.  
- Panel de tareas con filtro y búsqueda.  
- Descargas de reportes en EXCEL.  
- Integración con Firebase para recibir notificaciones push en el navegador.  
- Uso de **Material-UI (MUI)** para componentes y estilos.  

### Archivos importantes

- `src/firebase/firebase.config.js` → Configuración de Firebase web (API key pública).  
- `src/pages/...` → Componentes principales de las páginas.  
- `src/components/...` → Componentes reutilizables (Navbar, Footer, Modals).  

---

## 🔧 Cómo ejecutar el proyecto

Para ejecutar el proyecto localmente, puedes usar **Docker Compose**:
     docker-compose up --build

1. Clonar el repositorio:

```bash
git clone https://github.com/Carlos7275/AppTareas
cd apptareas
