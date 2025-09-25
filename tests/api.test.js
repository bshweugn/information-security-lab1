console.log('Используйте curl/Postman для тестирования API.');
console.log('Примеры:');
console.log('1) Вход (получить токен):');
console.log('curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d \'{"username":"admin","password":"adminpass"}\'');
console.log('2) Получение данных:');
console.log('curl http://localhost:3000/api/data -H "Authorization: Bearer <token>"');
