# Pruebas de la API con Insomnia

## 1. Login admin
![Login Admin](<Captura de pantalla 2026-04-08 094708.png>)
Prueba del endpoint `POST /api/auth/login`. Se envían las credenciales del administrador (email y contraseña) y el servidor devuelve un **200 OK** con los datos del usuario y el token JWT necesario para las peticiones privadas.

## 2. Crear feria
![Crear Feria](<Captura de pantalla 2026-04-08 094936.png>)
Prueba del endpoint `POST /api/ferias`. Se envía el token JWT en la cabecera de autorización junto con los datos de la Feria de Jerez 2025. El servidor devuelve **201 Created** con los datos de la feria creada.

## 3. Obtener todas las ferias
![Obtener Ferias](<Captura de pantalla 2026-04-08 095205.png>)
Prueba del endpoint `GET /api/ferias`. Sin necesidad de token, el servidor devuelve **200 OK** con la lista de todas las ferias almacenadas en la base de datos.

## 4. Crear caseta
![Crear Caseta](<Captura de pantalla 2026-04-08 100430.png>)
Prueba del endpoint `POST /api/casetas`. Se envía el token JWT junto con los datos de la caseta número 1, "La Casapuerta", asociada a la Feria de Jerez 2025. El servidor devuelve **201 Created** con los datos de la caseta creada.

## 5. Crear menú
![Crear Menú](<Captura de pantalla 2026-04-08 095725-1.png>)
Prueba del endpoint `POST /api/menus`. Se envía el token JWT junto con los datos de un plato del menú asociado a la caseta creada anteriormente. El servidor devuelve **201 Created** con los datos del plato creado.

## 6. Crear concierto
![Crear Concierto](<Captura de pantalla 2026-04-08 100258-1.png>)
Prueba del endpoint `POST /api/conciertos`. Se envía el token JWT junto con los datos de un concierto asociado a la caseta. El servidor devuelve **201 Created** con los datos del concierto creado.

## 7. Actualizar feria
![Actualizar Feria](<Captura de pantalla 2026-04-08 131144.png>)
Prueba del endpoint `PUT /api/ferias/:id`. Se envía el token JWT junto con los datos actualizados de la feria. El servidor devuelve **200 OK** con los datos de la feria actualizada.

## 8. Eliminar feria
![Eliminar Feria](<Captura de pantalla 2026-04-08 195125.png>)
Prueba del endpoint `DELETE /api/ferias/:id`. Se envía el token JWT y el servidor devuelve **200 OK** con un mensaje confirmando que la feria ha sido eliminada correctamente.

## 9. Obtener una caseta
![Obtener Caseta](<Captura de pantalla 2026-04-08 195223.png>)
Prueba del endpoint `GET /api/casetas/:id`. Sin necesidad de token, el servidor devuelve **200 OK** con los datos de la caseta solicitada por su ID.

## 10. Actualizar caseta
![Actualizar Caseta](<Captura de pantalla 2026-04-08 195324.png>)
Prueba del endpoint `PUT /api/casetas/:id`. Se envía el token JWT junto con los datos actualizados de la caseta. El servidor devuelve **200 OK** con los datos de la caseta actualizada.

## 11. Eliminar caseta
![Eliminar Caseta](<Captura de pantalla 2026-04-08 195407.png>)
Prueba del endpoint `DELETE /api/casetas/:id`. Se envía el token JWT y el servidor devuelve **200 OK** con un mensaje confirmando que la caseta ha sido eliminada correctamente.

## 12. Obtener menús de una caseta
![Obtener Menús Caseta](<Captura de pantalla 2026-04-08 195603.png>)
Prueba del endpoint `GET /api/menus/caseta/:casetaId`. Sin necesidad de token, el servidor devuelve **200 OK** con la lista de platos del menú asociados a la caseta solicitada.

## 13. Actualizar menú
![Actualizar Menú](<Captura de pantalla 2026-04-08 195813.png>)
Prueba del endpoint `PUT /api/menus/:id`. Se envía el token JWT junto con los datos actualizados del plato. El servidor devuelve **200 OK** con los datos del plato actualizado.

## 14. Eliminar menú
![Eliminar Menú](<Captura de pantalla 2026-04-08 195902.png>)
Prueba del endpoint `DELETE /api/menus/:id`. Se envía el token JWT y el servidor devuelve **200 OK** con un mensaje confirmando que el plato ha sido eliminado correctamente.

## 15. Obtener conciertos de una caseta
![Obtener Conciertos Caseta](<Captura de pantalla 2026-04-08 195938.png>)
Prueba del endpoint `GET /api/conciertos/caseta/:casetaId`. Sin necesidad de token, el servidor devuelve **200 OK** con la lista de conciertos asociados a la caseta solicitada.

## 16. Actualizar concierto
![Actualizar Concierto](<Captura de pantalla 2026-04-08 200040.png>)
Prueba del endpoint `PUT /api/conciertos/:id`. Se envía el token JWT junto con los datos actualizados del concierto. El servidor devuelve **200 OK** con los datos del concierto actualizado.

## 17. Eliminar concierto
![Eliminar Concierto](<Captura de pantalla 2026-04-08 200107.png>)
Prueba del endpoint `DELETE /api/conciertos/:id`. Se envía el token JWT y el servidor devuelve **200 OK** con un mensaje confirmando que el concierto ha sido eliminado correctamente.

## 18. POST sin token (Error 401)
![Error 401](<Captura de pantalla 2026-04-08 200316.png>)
Prueba de seguridad del endpoint `POST /api/ferias` sin enviar token JWT. El servidor devuelve **401 Unauthorized** confirmando que las rutas privadas están correctamente protegidas.

## 19. GET con ID inexistente (Error 404)
![Error 404](<Captura de pantalla 2026-04-08 200345.png>)
Prueba de manejo de errores del endpoint `GET /api/ferias/:id` con un ID que no existe en la base de datos. El servidor devuelve **404 Not Found** confirmando que el manejo de errores funciona correctamente.