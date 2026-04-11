# API testing with Insomnia.

## 1. Admin login
![alt text](<Captura de pantalla 2026-04-08 094708.png>)
Test of the endpoint `POST /api/auth/login`. The administrator credentials (email and password) are sent and the server returns a **200 OK** with the user data and the JWT token needed for private requests.

## 2. Create fair
![alt text](<Captura de pantalla 2026-04-08 094936.png>)
Test of the `POST /api/ferias` endpoint. The JWT token is sent in the authorization header along with the data of the Feria de Jerez 2025. The server returns **201 Created** with the data of the created fair.

## 3. Get all the fairs
![Obtener Ferias](<Captura de pantalla 2026-04-08 095205.png>)
Test of the endpoint `GET /api/ferias`. Without the need for a token, the server returns **200 OK** with the list of all fairs stored in the database.

## 4. Create booth
![alt text](<Captura de pantalla 2026-04-08 095725.png>)
Test of the endpoint `POST /api/casetas`. The JWT token is sent along with the data of booth number 1, "La Casapuerta", associated with the Jerez Fair 2025. The server returns **201 Created** with the data of the created booth.

## 5. Create meniu
![alt text](<Captura de pantalla 2026-04-08 100258.png>)
Test of the endpoint `POST /api/menus`. The JWT token is sent along with the data of a menu dish associated with the booth created earlier. The server returns **201 Created** with the data of the created dish.

## 6. Create concert
![alt text](<Captura de pantalla 2026-04-08 100430.png>)
Test of the endpoint `POST /api/conciertos`. The JWT token is sent along with the data of a concert associated with the booth. The server returns **201 Created** with the data of the created concert.

## 7. Update fair
![alt text](<Captura de pantalla 2026-04-08 131144.png>)
Test of the `PUT /api/ferias/:id` endpoint. The JWT token is sent along with the updated fair data. The server returns **200 OK** with the updated fair data.

## 8. Delete fair
![alt text](<Captura de pantalla 2026-04-08 195125.png>)
Test of the endpoint `DELETE /api/ferias/:id`. The JWT token is sent and the server returns **200 OK** with a message confirming that the fair has been successfully deleted.

## 9. Get a booth
![alt text](<Captura de pantalla 2026-04-08 195223.png>)
Test of the endpoint `GET /api/casetas/:id`. Without the need for a token, the server returns **200 OK** with the data of the caseta requested by its ID.

## 10. Update booth
![alt text](<Captura de pantalla 2026-04-08 195324.png>)
Test of the endpoint `PUT /api/casetas/:id`. The JWT token is sent along with the updated booth data. The server returns **200 OK** with the updated booth data.

## 11. Delete booth
![alt text](<Captura de pantalla 2026-04-08 195407.png>)
Test of the endpoint `DELETE /api/casetas/:id`. The JWT token is sent and the server returns **200 OK** with a message confirming that the booth has been deleted successfully.

## 12. Get menu from a booth
![alt text](<Captura de pantalla 2026-04-08 195603.png>)
Test of the endpoint `GET /api/menus/caseta/:casetaId`. No token is needed, the server returns **200 OK** with the list of menu dishes associated with the requested booth.

## 13. Update menu
![alt text](<Captura de pantalla 2026-04-08 195813.png>)
Test of the endpoint `PUT /api/menus/:id`. The JWT token is sent along with the updated dish data. The server returns **200 OK** with the updated dish data.

## 14. Delete menu
![alt text](<Captura de pantalla 2026-04-08 195902.png>)
Test of the endpoint `DELETE /api/menus/:id`. The JWT token is sent and the server returns **200 OK** with a message confirming that the dish has been successfully deleted.

## 15. Get concerts from a booth
![alt text](<Captura de pantalla 2026-04-08 195938.png>)
Test of the endpoint `GET /api/conciertos/caseta/:casetaId`. No token is needed, the server returns **200 OK** with the list of concerts associated with the requested booth.

## 16. Update concert
![alt text](<Captura de pantalla 2026-04-08 200040.png>)
Test of the endpoint `PUT /api/conciertos/:id`. The JWT token is sent along with the updated concert data. The server returns **200 OK** with the updated concert data.

## 17. Delete Concert
![alt text](<Captura de pantalla 2026-04-08 200107.png>)
Test of the endpoint `DELETE /api/conciertos/:id`. The JWT token is sent and the server returns **200 OK** with a message confirming that the concert has been successfully deleted.

## 18. POST without token (Error 401)
![alt text](<Captura de pantalla 2026-04-08 200316.png>)
Security test of the `POST /api/ferias` endpoint without sending a JWT token. The server returns **401 Unauthorized**, confirming that private routes are properly protected.

## 19. GET with non-existent ID (Error 404)
![alt text](<Captura de pantalla 2026-04-08 200345.png>)
Error handling test of the endpoint `GET /api/ferias/:id` with an ID that does not exist in the database. The server returns **404 Not Found** confirming that the error handling works correctly.