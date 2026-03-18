# 02. Descripción.

## Descripción general:

FeriaApp es una plataforma web con arquitectura híbrida compuesta por dos partes diferenciadas: un panel de administración desarrollado con el stack MERN, y una web pública estática generada automáticamente y publicada en GitHub Pages. Esta arquitectura garantiza un rendimiento óptimo para el visitante y una gestión sencilla para el administrador.

Toda la información proviene de fuentes públicas oficiales como el Ayuntamiento de Jerez de la Frontera, y es gestionada directamente por el administrador desde el panel interno, sin depender de terceros. La plataforma está diseñada para reutilizarse en cada nueva edición de la feria y para escalar a otros eventos en el futuro.

---

## Funcionalidades principales.

### 1. Autenticación y roles:

El sistema de autenticación está basado en JSON Web Tokens (JWT). Existen dos roles diferenciados:

- **Administrador:** Acceso completo al panel de administración. Puede gestionar ferias, casetas, menús, conciertos y generar la web pública.
- **Visitante:** Acceso a la web pública estática. No requiere registro ni autenticación.

### 2. Gestión de ferias:

El administrador puede crear, editar y eliminar ferias con los siguientes datos:

- Nombre de la feria.
- Descripción.
- Fechas de inicio y fin.
- Ubicación general.

### 3. Gestión de casetas:

El administrador puede dar de alta, editar y eliminar casetas con los siguientes datos:

- Nombre y número de caseta
- Descripción
- Ubicación sobre el mapa del recinto

### 4. Gestión de menús:

Cada caseta puede tener asociado un menú con:

- Nombre del plato o bebida.
- Precio.
- Descripción opcional.

### 5. Gestión de programación:

El administrador puede gestionar la programación de conciertos y actividades con:

- Nombre del artista o actividad.
- Fecha y hora.
- Caseta asociada.

### 6. Generación automática de página estática:

Cada vez que el administrador guarda cambios en el panel, el backend genera automáticamente los archivos estáticos actualizados y los publica en GitHub Pages mediante la API de GitHub con Octokit. Esto garantiza que la web pública siempre esté actualizada y no requiera un servidor para funcionar.

### 7. Web pública como PWA instalable:

La web que consultan los visitantes es una página estática diseñada como Progressive Web App (PWA):

- Instalable en el móvil como si fuera una app nativa.
- Funciona sin conexión a internet una vez cargada, gracias a los Service Workers.
- Especialmente útil cuando la cobertura móvil en el recinto ferial es limitada.

### 8. Importación del mapa oficial:

El administrador puede subir la imagen o PDF del mapa oficial publicado por el Ayuntamiento de Jerez. Ese mapa se muestra como fondo en el panel y el administrador simplemente pincha sobre él para marcar la ubicación de cada caseta, reduciendo al mínimo la introducción manual de datos.

### 9. Mapa interactivo:

La web pública muestra todas las casetas sobre el mapa oficial del recinto mediante Leaflet.js. El visitante puede pulsar sobre cualquier caseta para ver su información detallada, menú y programación.

### 10. Buscador inteligente:

El buscador de casetas incorpora tolerancia a errores tipográficos mediante Fuse.js. El visitante encuentra lo que busca aunque escriba mal el nombre de la caseta.

---

## Interfaz de usuario y experiencia de usuario (UI/UX).

### Principios de diseño:

- **Mobile first:** El diseño está pensado principalmente para móvil, ya que la mayoría de los visitantes consultarán la aplicación desde su teléfono durante la feria.
- **Simplicidad:** Interfaz limpia e intuitiva que permita encontrar información rápidamente.
- **Accesibilidad:** Cumplimiento del estándar WCAG 2.1 nivel AA, con contraste de colores mínimo de 4.5:1 y navegación accesible por teclado.
- **Rendimiento:** La web pública es una página estática, lo que garantiza tiempos de carga mínimos incluso con conexión lenta.

### Panel de administración:

Interfaz SPA desarrollada con React 18, con las siguientes secciones:

- **Dashboard:** Resumen general de ferias, casetas y programación.
- **Gestión de ferias:** Listado y formularios CRUD.
- **Gestión de casetas:** Listado, formularios CRUD y editor de ubicación en mapa.
- **Gestión de menús:** Listado y formularios CRUD por caseta.
- **Gestión de programación:** Listado y formularios CRUD por caseta.
- **Publicar:** Botón para generar y publicar la web pública estática.

### Web pública:

Página estática PWA con las siguientes secciones:

- **Inicio:** Información general de la feria y acceso rápido al mapa.
- **Mapa:** Mapa interactivo con todas las casetas del recinto.
- **Casetas:** Listado con buscador inteligente y fichas detalladas.
- **Programación:** Agenda de conciertos y actividades ordenada por fecha y hora.

---

## Usuarios objetivo y casos de uso.

### Usuarios objetivo:

| Tipo de usuario | Descripción |
|---|---|
| Visitante de la feria | Persona que asiste a la feria y necesita consultar información rápidamente desde su móvil |
| Administrador | El propio desarrollador, que carga y mantiene los datos usando información pública oficial |

### Casos de uso principales:

**Caso de uso 1: Consultar información de una caseta**
1. El visitante abre la web pública desde su móvil.
2. Accede al mapa interactivo.
3. Pulsa sobre una caseta.
4. Visualiza el nombre, menú y programación de la caseta.

**Caso de uso 2: Buscar una caseta**
1. El visitante accede a la sección de casetas.
2. Escribe el nombre de la caseta en el buscador (aunque cometa un error tipográfico).
3. El buscador muestra los resultados más relevantes.
4. El visitante accede a la ficha de la caseta.

**Caso de uso 3: Consultar la programación**
1. El visitante accede a la sección de programación.
2. Visualiza los conciertos y actividades ordenados por fecha y hora.
3. Pulsa sobre un concierto para ver la caseta donde se celebra.

**Caso de uso 4: Usar la app sin internet**
1. El visitante ha cargado la web previamente con conexión.
2. Durante la feria, sin cobertura, abre la app instalada en su móvil.
3. Consulta toda la información almacenada localmente sin necesidad de internet.

**Caso de uso 5: Actualizar información como administrador**
1. El administrador accede al panel con sus credenciales.
2. Edita la información de una caseta o añade un concierto nuevo.
3. Pulsa "Publicar".
4. El sistema genera automáticamente la web pública actualizada y la publica en GitHub Pages.