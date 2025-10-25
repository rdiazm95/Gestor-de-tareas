# 🧠 Gestor de Tareas Inteligente  
Gestor de proyectos colaborativo con tiempo real, adjuntos en Cloudinary y registro de actividad.

---

## 📸 Vista Previa del Proyecto

_Añade aquí tus gifs o capturas mostrando el funcionamiento de tareas, comentarios y carga de archivos._

⬇️  
![Demo GIF Pendiente](ruta/a/tu/demo.gif)

---

## 🚀 Características Principales

✅ **Gestión de tareas completa:** creación, edición, eliminación y asignación a usuarios.  
✅ **Subida de archivos a Cloudinary:** adjunta documentos, imágenes y PDFs directamente desde el navegador.  
✅ **Historial de actividad:** seguimiento de cambios (asignaciones, estados, adjuntos).  
✅ **Comentarios y comunicación:** sección integrada de discusión en cada tarea.  
✅ **Socket.io (tiempo real):** actualizaciones automáticas entre usuarios sin recargar.  
✅ **Interfaz moderna React:** diseño legible y adaptable (desktop & móvil).  

---

## 🧩 Estructura del Proyecto
```
📦 GestorDeTareas/
│
├── client/ # Aplicación React (frontend)
│ ├── src/
│ └── package.json
│
├── server/ # API Node.js / Express (backend)
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── config/
│ └── package.json
│
├── .gitignore
└── README.md # Este archivo
```


## ⚙️ Tecnologías Utilizadas

### **Frontend**
- ⚛️ React 18  
- 🔄 Axios (para llamadas API)  
- 💅 TailwindCSS / CSS Modules  
- 📦 react-hot-toast (notificaciones visuales)  

### **Backend**
- 🧩 Node.js + Express  
- 🗃️ MongoDB + Mongoose  
- ☁️ Cloudinary para almacenamiento de archivos  
- 🔐 JSON Web Token (JWT) para autenticación  
- ⚡ Socket.io para tiempo real  

---

## 🧠 Requisitos Previos

Antes de ejecutar el proyecto necesitas tener instalado:

- [Node.js](https://nodejs.org/) (v18 o superior)
- [MongoDB](https://www.mongodb.com/try/download/community) (puedes usar su cluster versión web)
- Una [cuenta gratuita de Cloudinary](https://cloudinary.com/)

---

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz de **server/** con esta configuración:

- PORT=5000
- MONGO_URI=mongodb://localhost:xxx/prueba (ruta de ejemplo)
- JWT_SECRET=clave-ultra-secreta
- CLOUDINARY_NAME=tu_nombre
- CLOUDINARY_API_KEY=tu_api_key
- CLOUDINARY_API_SECRET=tu_api_secret



Y otro `.env` opcional en el **client/** para conectar con el backend local:

REACT_APP_API_URL=http://localhost:5000/api



---

## 🧑‍💻 Instalación

### **1. Clonar el repositorio**

git clone https://github.com/tu-usuario/gestor-de-tareas.git
cd gestor-de-tareas



### **2. Instalar dependencias**

Instala las dependencias **del backend** y **del frontend**:

cd server
npm install

cd ../client
npm install



---

## ▶️ Ejecución en Desarrollo

### **Backend**
cd server
npm run dev


El servidor arrancará por defecto en [http://localhost:5000](http://localhost:5000).

### **Frontend**
cd client
npm start


La interfaz se abrirá automáticamente en tu navegador en [http://localhost:5173/](http://localhost:5173/).

---

## 🔗 Conexión entre Frontend y Backend

El cliente se comunica con el backend mediante la variable:
REACT_APP_API_URL=http://localhost:5000/api


Por tanto, asegúrate de tener ambos corriendo simultáneamente.

---

## 🧮 Comandos Importantes

| Comando                | Descripción                         |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | Arranca servidor con nodemon        |
| `npm start`            | Arranca el cliente React            |
| `npm run build`        | Genera build de producción del frontend |
| `npm test`             | Ejecuta pruebas                     |

---

## 🔧 Futuras Mejoras

🧩 **Despliegue Cloud:** configurar hosting automático en Render (backend) y Vercel (frontend)  
📱 **Modo móvil:** optimización total mobile-first  


---

## 📦 Buenas Prácticas

- Mantén tu archivo `.env` fuera del control de versiones (ver `.gitignore`).  
- Usa ramas de Git para nuevas funcionalidades (`feature/nueva-funcionalidad`).  
- Realiza commits descriptivos y concisos.  
- Documenta nuevas APIs desde `server/routes`.

---

## 👩‍💻 Autor

**Desarrollado por:** Ruben  
🗓️ **Año:** 2025  
📫 **Contacto:**  [Linkedin](https://www.linkedin.com/in/rubendim/).





---

## 🎬 Capturas

_Añade aquí tus GIFs o capturas finales una vez subido a GitHub:_

1. Vista general del tablero  
2. Subida y eliminación de archivos Cloudinary  
3. Colaboración entre usuarios en tiempo real  

⬇️  
![Dashboard Demo](ruta/a/dashboard.gif)
![Cloudinary Upload Demo](ruta/a/subida.gif)
![Realtime Update Demo](ruta/a/realtime.gif)

---

## 🧭 Licencia

Este proyecto se distribuye bajo la licencia MIT.  
Puedes usarlo y modificarlo libremente citando al autor.