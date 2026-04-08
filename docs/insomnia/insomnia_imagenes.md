# Pruebas de la API con Insomnia

## 1. Login admin
![alt text](<Captura de pantalla 2026-04-08 094708.png>)
Prueba del endpoint `POST /api/auth/login`. Se envían las credenciales del administrador (email y contraseña) y el servidor devuelve un **200 OK** con los datos del usuario y el token JWT necesario para las peticiones privadas.
ç
## 2. Crear feria
![alt text](<Captura de pantalla 2026-04-08 094936.png>)
Prueba del endpoint `POST /api/ferias`. Se envía el token JWT en la cabecera de autorización junto con los datos de la Feria de Jerez 2025. El servidor devuelve **201 Created** con los datos de la feria creada.

## 3. Obtener todas las ferias
![Obtener Ferias](<Captura de pantalla 2026-04-08 095205.png>)
Prueba del endpoint `GET /api/ferias`. Sin necesidad de token, el servidor devuelve **200 OK** con la lista de todas las ferias almacenadas en la base de datos.

## 4. Crear caseta
![alt text](<Captura de pantalla 2026-04-08 095725.png>)
Prueba del endpoint `POST /api/casetas`. Se envía el token JWT junto con los datos de la caseta número 1, "La Casapuerta", asociada a la Feria de Jerez 2025. El servidor devuelve **201 Created** con los datos de la caseta creada.

## 5. Crear menú
![alt text](<Captura de pantalla 2026-04-08 100258.png>)
Prueba del endpoint `POST /api/menus`. Se envía el token JWT junto con los datos de un plato del menú asociado a la caseta creada anteriormente. El servidor devuelve **201 Created** con los datos del plato creado.

## 6. Crear concierto
![alt text](<Captura de pantalla 2026-04-08 100430.png>)
Prueba del endpoint `POST /api/conciertos`. Se envía el token JWT junto con los datos de un concierto asociado a la caseta. El servidor devuelve **201 Created** con los datos del concierto creado.

## 7. Actualizar feria
![alt text](<Captura de pantalla 2026-04-08 131144.png>)
Prueba del endpoint `PUT /api/ferias/:id`. Se envía el token JWT junto con los datos actualizados de la feria. El servidor devuelve **200 OK** con los datos de la feria actualizada.

## 8. Eliminar feria
![alt text](<Captura de pantalla 2026-04-08 195125.png>)
Prueba del endpoint `DELETE /api/ferias/:id`. Se envía el token JWT y el servidor devuelve **200 OK** con un mensaje confirmando que la feria ha sido eliminada correctamente.

## 9. Obtener una caseta
![alt text](<Captura de pantalla 2026-04-08 195223.png>)
Prueba del endpoint `GET /api/casetas/:id`. Sin necesidad de token, el servidor devuelve **200 OK** con los datos de la caseta solicitada por su ID.

## 10. Actualizar caseta
![alt text](<Captura de pantalla 2026-04-08 195324.png>)
Prueba del endpoint `PUT /api/casetas/:id`. Se envía el token JWT junto con los datos actualizados de la caseta. El servidor devuelve **200 OK** con los datos de la caseta actualizada.

## 11. Eliminar caseta
![alt text](<Captura de pantalla 2026-04-08 195407.png>)
Prueba del endpoint `DELETE /api/casetas/:id`. Se envía el token JWT y el servidor devuelve **200 OK** con un mensaje confirmando que la caseta ha sido eliminada correctamente.

## 12. Obtener menús de una caseta
![alt text](<Captura de pantalla 2026-04-08 195603.png>)
Prueba del endpoint `GET /api/menus/caseta/:casetaId`. Sin necesidad de token, el servidor devuelve **200 OK** con la lista de platos del menú asociados a la caseta solicitada.

## 13. Actualizar menú
![alt text](<Captura de pantalla 2026-04-08 195813.png>)
Prueba del endpoint `PUT /api/menus/:id`. Se envía el token JWT junto con los datos actualizados del plato. El servidor devuelve **200 OK** con los datos del plato actualizado.

## 14. Eliminar menú
![alt text](<Captura de pantalla 2026-04-08 195902.png>)
Prueba del endpoint `DELETE /api/menus/:id`. Se envía el token JWT y el servidor devuelve **200 OK** con un mensaje confirmando que el plato ha sido eliminado correctamente.

## 15. Obtener conciertos de una caseta
![alt text](<Captura de pantalla 2026-04-08 195938.png>)
Prueba del endpoint `GET /api/conciertos/caseta/:casetaId`. Sin necesidad de token, el servidor devuelve **200 OK** con la lista de conciertos asociados a la caseta solicitada.

## 16. Actualizar concierto
![alt text](<Captura de pantalla 2026-04-08 200040.png>)
Prueba del endpoint `PUT /api/conciertos/:id`. Se envía el token JWT junto con los datos actualizados del concierto. El servidor devuelve **200 OK** con los datos del concierto actualizado.

## 17. Eliminar Concierto
![alt text](<Captura de pantalla 2026-04-08 200107.png>)
Prueba del endpoint `DELETE /api/conciertos/:id`. Se envía el token JWT y el servidor devuelve **200 OK** con un mensaje confirmando que el concierto ha sido eliminado correctamente.

## 18. POST sin token (Error 401)
![alt text](<Captura de pantalla 2026-04-08 200316.png>)
Prueba de seguridad del endpoint `POST /api/ferias` sin enviar token JWT. El servidor devuelve **401 Unauthorized** confirmando que las rutas privadas están correctamente protegidas.

## 19. GET con ID inexistente (Error 404)
![alt text](<Captura de pantalla 2026-04-08 200345.png>)
Prueba de manejo de errores del endpoint `GET /api/ferias/:id` con un ID que no existe en la base de datos. El servidor devuelve **404 Not Found** confirmando que el manejo de errores funciona correctamente.