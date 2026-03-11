# FeriaApp

**Autor:** Pablo Sanz Aznar
**Fecha:** 10 de marzo de 2025
**Ciclo:** Desarrollo de Aplicaciones Web

---

## Índice

1. [Identificación de necesidades](#1-identificación-de-necesidades)
2. [Oportunidades de negocio](#2-oportunidades-de-negocio)
3. [Tipo de proyecto](#3-tipo-de-proyecto)
4. [Características específicas](#4-características-específicas)
5. [Obligaciones legales y prevención](#5-obligaciones-legales-y-prevención)
6. [Ayudas y subvenciones](#6-ayudas-y-subvenciones)
7. [Guión de trabajo](#7-guión-de-trabajo)

---

## 1. Identificación de necesidades.

### Descripción del problema:

Las ferias locales en España, como la Feria de Jerez, son eventos de gran importancia cultural y económica que concentran a miles de visitantes durante varios días. Sin embargo, actualmente no existe una plataforma digital oficial que centralice su información de forma estructurada y accesible.

Los visitantes, especialmente aquellos que no conocen la feria, se enfrentan a una serie de problemas concretos:

- La información sobre casetas, menús y programación está dispersa en redes sociales, PDFs desactualizados o simplemente no está disponible online.
- Durante la propia feria, la cobertura móvil es limitada debido a la concentración de personas, lo que dificulta la consulta de información en tiempo real.
- No existe una forma sencilla de localizar una caseta concreta dentro del recinto ferial.
- Los visitantes desconocen la programación de conciertos y actividades hasta que llegan al lugar.

### Cómo se detectó la necesidad:

La necesidad fue identificada a través de la propuesta del tutor laboral durante el período de prácticas en empresa (FFEOE), quien señaló la ausencia de una solución digital moderna para este tipo de eventos locales.

### Usuarios objetivo:

- **Visitantes de ferias locales:** Personas que asisten a la feria y necesitan orientarse, consultar menús, programación y localizar casetas de forma rápida y sin depender de conexión a internet.
- **Administrador de la plataforma:** El propio desarrollador, que carga y mantiene los datos usando información pública oficial disponible en fuentes como el Ayuntamiento de Jerez.

---

## 2. Oportunidades de negocio.

### Análisis del mercado:

Actualmente existen algunas soluciones parciales para eventos y ferias:

| Solución | Descripción | Limitaciones |
|---|---|---|
| Web oficial del Ayuntamiento de Jerez | Información básica de la feria | No interactiva, sin mapa, sin programación detallada |
| Redes sociales (Instagram, Facebook) | Publicaciones de casetas | Información dispersa, no centralizada |
| Apps genéricas de eventos (Fever, Eventbrite) | Gestión de entradas y eventos | No orientadas a ferias locales, sin mapa de casetas |
| App Android TFG anterior | Mapa de casetas en Android | Solo Android, sin despliegue real, datos inventados |

### Propuesta de valor diferencial:

FeriaApp se diferencia de las soluciones existentes en varios aspectos clave:

- **Centralización:** Toda la información de la feria en un único lugar estructurado y accesible.
- **Funcionamiento offline:** Gracias a la tecnología PWA, la aplicación funciona sin conexión a internet una vez cargada, lo cual es especialmente útil en entornos con mala cobertura como una feria.
- **Generación de página estática:** La web pública se genera automáticamente como HTML estático y se publica en GitHub Pages, garantizando tiempos de carga mínimos.
- **Mapa interactivo:** Visualización de casetas sobre el mapa oficial del recinto, importado directamente desde los recursos públicos del ayuntamiento.
- **Buscador inteligente:** Con tolerancia a errores tipográficos mediante Fuse.js, facilitando la búsqueda a cualquier tipo de usuario.

### Potencial y escalabilidad:

Aunque el caso de uso principal es la Feria de Jerez, la plataforma está diseñada de forma genérica para escalar a cualquier otra feria o evento local, simplemente añadiendo nuevos eventos desde el panel de administración. Esto le da recorrido real más allá de una única edición y la convierte en una solución reutilizable año tras año.

---

## 3. Tipo de proyecto.

### Tipo de aplicación:

FeriaApp es una aplicación web con arquitectura híbrida compuesta por dos partes diferenciadas:

- **Panel de administración (SPA):** Aplicación de página única desarrollada con React 18, que permite gestionar toda la información de la feria. Solo accesible para el administrador mediante autenticación JWT.

- **Web pública (PWA + Página estática):** Página estática generada automáticamente y publicada en GitHub Pages cada vez que el administrador actualiza los datos. Está diseñada como Progressive Web App (PWA), lo que permite instalarla en el móvil y consultarla sin conexión a internet.

### Justificación de la arquitectura:

Esta arquitectura híbrida está justificada por las necesidades específicas del proyecto:

- La **generación de página estática** elimina la necesidad de un servidor para la web pública, reduciendo costes y mejorando el rendimiento.
- La **PWA** resuelve el problema de la mala cobertura móvil en las ferias, permitiendo consultar la información descargada previamente.
- El **panel MERN** proporciona una interfaz de administración completa con API REST, autenticación con roles y base de datos MongoDB.

### Arquitectura técnica

```
┌─────────────────────────────────────────────────────────┐
│                    ADMINISTRADOR                        │
│                                                         │
│  React SPA (panel admin) ──► Express API REST           │
│                                    │                    │
│                               MongoDB Atlas             │
│                                    │                    │
│                          Generación estática            │
│                                    │                    │
│                          Octokit ──► GitHub Pages       │
└─────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────┐
│                     VISITANTE                           │
│                                                         │
│          PWA estática (GitHub Pages)                    │
│          - Funciona offline                             │
│          - Instalable en móvil                          │
│          - Mapa interactivo                             │
│          - Buscador inteligente                         │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Características específicas.

### MVP - Funcionalidades obligatorias:

| Prioridad | Funcionalidad | Descripción |
|---|---|---|
| Alta | Autenticación JWT | Login del administrador con roles |
| Alta | Gestión de ferias | CRUD completo de ferias |
| Alta | Gestión de casetas | CRUD completo con ubicación en mapa |
| Alta | Gestión de menús | CRUD de platos y precios por caseta |
| Alta | Gestión de programación | CRUD de conciertos con fecha y hora |
| Alta | Generación de página estática | Build automático y push a GitHub Pages |
| Alta | Web pública PWA | Página instalable y funcional offline |
| Alta | Mapa interactivo | Visualización de casetas con Leaflet.js |
| Alta | Importación de mapa oficial | Subida de imagen/PDF del mapa del ayuntamiento |
| Alta | Buscador inteligente | Búsqueda con tolerancia tipográfica con Fuse.js |
| Alta | Despliegue con Docker | Contenedorización completa del panel admin |
| Alta | CI/CD con GitHub Actions | Pipeline de integración y despliegue continuo |

### Funcionalidades opcionales (mejoras futuras):

| Prioridad | Funcionalidad |
|---|---|
| Media | Soporte para múltiples ferias simultáneas |
| Media | Filtros avanzados por tipo de caseta o actividad |
| Baja | Notificaciones push para recordar conciertos |
| Baja | Estadísticas de uso del panel de administración |

### Requisitos técnicos:

**Frontend (panel de administración):**
- React 18
- JavaScript ES6+
- Vite
- SCSS
- React Router DOM
- Axios
- Context API
- JWT Decode
- Leaflet.js

**Frontend (web pública):**
- HTML/CSS/JS estático generado desde Node.js
- Leaflet.js para el mapa interactivo
- Fuse.js para el buscador inteligente
- Service Workers y Web App Manifest para PWA

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT + bcrypt
- express-validator
- Helmet.js
- Morgan
- Swagger
- Octokit (integración con API de GitHub)

**Base de datos:**
- MongoDB local en desarrollo
- MongoDB Atlas en producción

**Despliegue:**
- Docker y Docker Compose
- Nginx como reverse proxy
- GitHub Actions para CI/CD
- GitHub Pages para la web pública estática

---

## 5. Obligaciones legales y prevención.

### Normativa aplicable:

**RGPD (Reglamento General de Protección de Datos):**
La aplicación gestiona únicamente datos del administrador (usuario y contraseña cifrada). Los visitantes de la web pública no necesitan registrarse ni proporcionar datos personales, por lo que el impacto del RGPD es mínimo. No obstante, se implementarán las siguientes medidas:

- Las contraseñas se almacenan cifradas con bcrypt.
- Los tokens JWT tienen tiempo de expiración definido.
- No se almacenan datos personales de visitantes.

**LSSI-CE (Ley de Servicios de la Sociedad de la Información):**
- La web pública incluirá un aviso legal con la información del titular de la aplicación.
- Se indicará claramente que la información proviene de fuentes públicas oficiales.

**Propiedad intelectual:**
- Los datos utilizados (mapas, programación, menús) provienen de fuentes públicas oficiales como el Ayuntamiento de Jerez, por lo que su uso está permitido.
- Se citarán las fuentes originales en la aplicación.

### Medidas de seguridad

- Autenticación mediante JWT con expiración de token.
- Cifrado de contraseñas con bcrypt.
- Validación de datos en servidor con express-validator.
- Headers de seguridad con Helmet.js.
- Variables de entorno gestionadas con dotenv.
- Acceso a la base de datos restringido al backend.
- Panel de administración protegido por autenticación.

### Accesibilidad web:

La web pública cumplirá con el estándar **WCAG 2.1 nivel AA**:

- Contraste de colores mínimo de 4.5:1.
- Navegación accesible por teclado.
- Textos alternativos en imágenes.
- Diseño responsive para cualquier dispositivo.
- Tipografía legible y tamaños de fuente adecuados.

---

## 6. Ayudas y subvenciones.

### Ayudas disponibles:

**Kit Digital:**
Programa del Gobierno de España para la digitalización de pequeñas empresas y autónomos. Aunque este proyecto es un TFG y no una empresa, el tipo de solución desarrollada (digitalización de eventos locales) encaja con la categoría de "Presencia en internet y sitio web" del programa, lo que podría ser relevante si se continúa el proyecto en un contexto profesional.

**ENISA (Empresa Nacional de Innovación):**
Ofrece préstamos participativos para jóvenes emprendedores. En caso de darle continuidad al proyecto como producto comercial, podría ser una vía de financiación a explorar.

### Recursos gratuitos y de bajo coste utilizados:

| Recurso | Coste | Uso en el proyecto |
|---|---|---|
| GitHub | Gratuito | Control de versiones y CI/CD |
| GitHub Pages | Gratuito | Publicación de la web pública estática |
| MongoDB Atlas (tier gratuito) | Gratuito | Base de datos en producción |
| Docker Hub | Gratuito | Publicación de imágenes Docker |
| Leaflet.js | Gratuito (open source) | Mapas interactivos |
| Fuse.js | Gratuito (open source) | Buscador inteligente |
| Octokit | Gratuito (open source) | Integración con API de GitHub |
| Figma (plan gratuito) | Gratuito | Prototipado y guía de estilos |
| Visual Studio Code | Gratuito | Entorno de desarrollo |

El coste total del proyecto es de **0 €**, utilizando exclusivamente herramientas gratuitas o de código abierto.

---

## 7. Guión de trabajo.

### Metodología

Se aplicará **SCRUM** en modalidad individual con sprints de dos semanas. Al final de cada sprint se grabará un vídeo de demostración (máximo 5 minutos) mostrando los avances realizados.

**Herramientas de gestión:**
- **GitHub Projects** para la gestión del backlog y seguimiento de tareas.
- **GitHub** para control de versiones con ramas por funcionalidad.
- **Toggl Track** para el registro de horas dedicadas.

**Configuración del tablero en GitHub Projects:**

| Campo | Valores |
|---|---|
| Estado | Backlog, To Do, In Progress, Done |
| Sprint | 0, 1, 2, 3, 4 |
| Prioridad | Alta, Media, Baja |
| Estimación | Horas estimadas |
| Categoría | Frontend, Backend, BD, DevOps, Testing, Docs |

### Cronograma:

#### Sprint 0 (10 - 23 marzo): Configuración y diseño.
- Configuración del entorno de desarrollo.
- Creación del repositorio y GitHub Projects.
- Prototipado en Figma (todas las pantallas).
- Guía de estilos: colores, tipografías, componentes.
- Diseño del modelo de datos en MongoDB.
- Diseño de los endpoints de la API REST.

**Entregable:** Prototipo en Figma funcional + arquitectura documentada.

#### Sprint 1 (24 marzo - 6 abril): Backend y autenticación.
- Configuración de Node.js + Express + MongoDB.
- Implementación de modelos: Feria, Caseta, Menú, Concierto.
- API REST completa con todos los endpoints CRUD.
- Sistema de autenticación JWT con roles.
- Documentación de la API con Swagger.
- Pruebas de endpoints con Insomnia.

**Entregable:** API REST funcional y documentada.

#### Sprint 2 (7 - 20 abril): Panel de administración.
- Desarrollo del panel de administración en React.
- Formularios de gestión de ferias, casetas, menús y conciertos.
- Integración con la API REST mediante Axios.
- Implementación de Octokit para generación y push de estáticos.
- Importación de imagen/PDF del mapa oficial.

**Entregable:** Panel de administración funcional con generación de estáticos.

#### Sprint 3 (21 abril - 4 mayo): Web pública PWA.
- Desarrollo de la web pública estática.
- Integración de Leaflet.js para el mapa interactivo.
- Implementación del buscador con Fuse.js.
- Configuración de Service Workers y manifest para PWA.
- Verificación del funcionamiento offline.

**Entregable:** Web pública PWA funcional e instalable.

#### Sprint 4 (5 - 18 mayo): Despliegue y documentación.
- Dockerización completa del panel de administración.
- Configuración de Nginx como reverse proxy.
- Pipeline CI/CD con GitHub Actions.
- Pruebas unitarias e integración del backend.
- Documentación completa en /docs.
- Carga de datos reales de la Feria de Jerez.

**Entregable:** Aplicación desplegada y documentación completa.

#### Semana final (19 - 22 mayo): Revisión y entrega.
- Revisión general de la aplicación.
- Corrección de errores detectados.
- Entrega final del proyecto.

### Resumen de hitos

| Fecha | Hito |
|---|---|
| 23 marzo | Prototipo en Figma y arquitectura documentada |
| 6 abril | API REST funcional y documentada |
| 20 abril | Panel de administración con generación de estáticos |
| 4 mayo | Web pública PWA funcional |
| 18 mayo | Aplicación desplegada y documentada |
| 22 mayo | Entrega final |
