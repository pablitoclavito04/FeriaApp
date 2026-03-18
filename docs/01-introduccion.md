# 01. Introducción, objetivos y antecedentes.
 
## Origen de la idea y motivación del proyecto:
 
FeriaApp nace a partir de una necesidad detectada durante el período de prácticas en empresa (FFEOE), donde el tutor laboral señaló la ausencia de una plataforma digital moderna que centralizara la información de las ferias locales en España.
 
Las ferias locales, como la Feria de Jerez de la Frontera, son eventos de gran importancia cultural y económica que concentran a miles de visitantes durante varios días. Sin embargo, la información sobre casetas, menús, programación de conciertos y servicios se encuentra dispersa en redes sociales, PDFs desactualizados o simplemente no está disponible de forma estructurada online.
 
A esto se suma un problema específico del contexto ferial: la cobertura móvil en el recinto es limitada debido a la concentración de personas, lo que dificulta la consulta de información en tiempo real. Esta combinación de factores motivó el desarrollo de una solución digital accesible, rápida y funcional incluso sin conexión a internet.
 
## Expectativas y objetivos específicos.
 
### Objetivo general:
 
Desarrollar una plataforma web full stack basada en el stack MERN que centralice la información de ferias locales y permita consultarla de forma cómoda, rápida y sin depender de conexión a internet desde cualquier dispositivo.
 
### Objetivos específicos:
 
- Implementar un panel de administración completo con autenticación JWT y roles diferenciados.
- Desarrollar una API REST bien documentada siguiendo los principios RESTful.
- Generar automáticamente una página estática publicada en GitHub Pages cada vez que el administrador actualice los datos.
- Diseñar la web pública como Progressive Web App (PWA) instalable y funcional offline.
- Integrar un mapa interactivo con Leaflet.js que muestre la ubicación de las casetas sobre el mapa oficial del recinto.
- Implementar un buscador inteligente con tolerancia a errores tipográficos mediante Fuse.js.
- Desplegar la aplicación con Docker y Docker Compose, con Nginx como reverse proxy.
- Configurar un pipeline de CI/CD con GitHub Actions.
- Documentar el proyecto completo siguiendo la estructura establecida.
 
### Objetivos de aprendizaje:
 
- Aplicar el stack MERN en un proyecto real de principio a fin.
- Integrar tecnologías modernas como PWA, generación de estáticos y CI/CD.
- Gestionar un proyecto individual siguiendo metodología SCRUM simplificada.
 
## Análisis comparativo de aplicaciones similares:
 
Actualmente existen algunas soluciones parciales para eventos y ferias locales, pero ninguna cubre de forma completa las necesidades identificadas:
 
| Solución | Descripción | Limitaciones |
|---|---|---|
| Web oficial del Ayuntamiento de Jerez | Información básica de la feria | No interactiva, sin mapa de casetas, sin programación detallada |
| Redes sociales (Instagram, Facebook) | Publicaciones de casetas y organización | Información dispersa, no centralizada, no funciona offline |
| Apps genéricas de eventos (Fever, Eventbrite) | Gestión de entradas y eventos | No orientadas a ferias locales, sin mapa de casetas ni menús |
| App Android TFG anterior | Mapa de casetas en Android | Solo Android, sin despliegue real, datos inventados, no mantenida |
 
### Conclusión del análisis:
 
Ninguna de las soluciones existentes combina en un único lugar la centralización de información, el funcionamiento offline, la generación de contenido estático de alto rendimiento y un mapa interactivo sobre el plano oficial del recinto. FeriaApp cubre este hueco con una arquitectura moderna, un coste de infraestructura de 0 € y una plataforma reutilizable para cualquier edición futura de la feria.