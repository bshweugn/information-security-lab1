# Работа 1: Разработка защищенного REST API с интеграцией в CI/CD

## Описание сервиса
Сервис использует REST API и реализован на Node.js + Express с JWT-аутентификацией, SQLite.

## Эндпоинты

### Аутентификация

#### POST /auth/login
**Описание** Вход в систему для получения JWT токена  
**Защищённость** Публичный  
**Тело запроса**
```json
{
  "username": "string (обязательно)",
  "password": "string (обязательно)"
}
```

**Коды ответов**
- `200 OK` - Успешная аутентификация
- `400 Bad Request` - Отсутствуют обязательные поля
- `401 Unauthorized` - Неверные учётные данные

**Пример успешного ответа**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Использование**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"adminpass"}'
```

#### POST /auth/register
**Описание** Регистрация нового пользователя (не для продакшена)  
**Защищённость** Публичный  
**Тело запроса**
```json
{
  "username": "string (мин. 3 символа)",
  "password": "string (мин. 6 символов)"
}
```

**Коды ответов**
- `201 Created` - Пользователь успешно создан
- `400 Bad Request` - Неверные данные или пользователь уже существует

**Пример успешного ответа**
```json
{
  "id": 3,
  "username": "newuser"
}
```

**Использование**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"password123"}'
```

### Данные

#### GET /api/data
**Описание** Получение списка всех пользователей  
**Защищённость** JWT токен  
**Заголовки** `Authorization: Bearer <token>`

**Коды ответов**
- `200 OK` - Успешное получение данных
- `401 Unauthorized` - Отсутствует или неверный токен

**Пример успешного ответа**
```json
{
  "data": [
    {
      "id": 1,
      "username": "admin",
      "role": "admin"
    },
    {
      "id": 2,
      "username": "user", 
      "role": "user"
    }
  ]
}
```

**Использование**
```bash
curl -X GET http://localhost:3000/api/data \
  -H "Authorization: Bearer TOKEN"
```

#### POST /api/data/post
**Описание** Создание нового поста (хранится в памяти)  
**Защищённость** JWT токен  
**Заголовки** `Authorization: Bearer <token>`  
**Тело запроса**
```json
{
  "title": "string (макс. 200 символов)",
  "body": "string (макс. 2000 символов)"
}
```

**Коды ответов**
- `201 Created` - Пост успешно создан
- `400 Bad Request` - Слишком длинный ввод
- `401 Unauthorized` - Отсутствует или неверный токен

**Пример успешного ответа**
```json
{
  "post": {
    "id": 1,
    "author": "admin",
    "title": "Заголовок",
    "body": "Тело поста"
  }
}
```

**Использование**
```bash
curl -X POST http://localhost:3000/api/data/post \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Заголовок","body":"Содержание поста"}'
```

## Локальный запуск
1. Скопируйте репозиторий
2. Создайте `.env` на основе `.env.example` и задайте `JWT_SECRET`
3. Установите зависимости `npm ci`
4. Запустите `npm start`
5. По умолчанию созданы пользователи `admin:adminpass` и `user:userpass`

## Безопасность

### Методы защиты
- **JWT аутентификация**
- **Хеширование паролей bcrypt**
- **Rate limiting**
- **Helmet.js**
- **Санитизация ввода**
- **CORS**

### Защита от XSS атак
Реализована защита от XSS:

#### Входные данные
- **Санитизация при вводе** Использование `validator.escape()` для экранирования HTML символов в пользовательском вводе
- **Валидация длины** Ограничения на размер полей (title ≤ 200 символов, body ≤ 2000 символов)

#### Выходные данные
- **XSS фильтрация** Библиотека `xss` очищает все выходные данные от потенциально опасных тегов и скриптов
- **Рекурсивная санитизация** Обработка вложенных объектов и массивов
- **Content Security Policy** Helmet.js устанавливает защитные заголовки

### Защита от SQL инъекций
Используется несколько уровней защиты от SQL инъекций:

#### ORM Sequelize
- **Параметризованные запросы** Все запросы к БД используют prepared statements
- **Автоматическое экранирование** Sequelize автоматически экранирует все параметры
- **Типизация** Строгая типизация полей

### Мониторинг безопасности
- **Логирование** Все ошибки аутентификации записываются в консоль
- **Rate Limiting** Отслеживание превышения лимитов запросов
- **Токены** Ограничение действия токена по времени

## Быстрый старт

### Получить токен и использовать API
```bash
# 1. Получить токен
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"adminpass"}' | \
  jq -r '.token')

# 2. Использовать токен для получения данных
curl -X GET http://localhost:3000/api/data \
  -H "Authorization: Bearer TOKEN"

# 3. Создать пост
curl -X POST http://localhost:3000/api/data/post \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Заголовок","body":"Содержание"}'
