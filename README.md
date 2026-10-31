# TaskFlow
TaskFlow - учебный full-stack веб-сервис для управления персональными
задачами.
## Возможности
1. Регистрация и вход пользователя.
2. Серверные сессии и cookie.
3. Личный кабинет.
4. Создание, просмотр, изменение и удаление задач.
5. Статусы, приоритеты и сроки.
6. Поиск и фильтрация.
7. Отдельные страницы React Router.
8. Персональные задачи каждого пользователя.
9. PostgreSQL для постоянного хранения.
10. Обработка загрузки и ошибок.
11. Автоматические тесты сервера и React-компонентов.
12. Production-сборка React.
## Стек
1. React.
2. Vite.
3. React Router.
4. Node.js.
5. Express.
6. PostgreSQL.
7. pg.
8. express-session.
9. connect-pg-simple.
10. bcrypt.
11. Vitest.
12. Supertest.
13. React Testing Library.
## Структура
```text
taskflow/
 client/
 server/
 README.md
 .gitignore
```
## Требования
1. Node.js LTS.
2. npm.
3. PostgreSQL.
4. Git.
## Подготовка базы данных
Создайте базу `taskflow` и таблицы `users` и `tasks` по SQL из практических работ
4 и 6.
## Настройка server/.env
Скопируйте `server/.env.example` в `server/.env` и заполните локальные значения:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskflow
DB_USER=postgres
DB_PASSWORD=your_password
SESSION_SECRET=your_long_random_secret
```
## Установка зависимостей
```bash
cd client
npm install
cd ../server
npm install
```
## Запуск в режиме разработки
Терминал 1:
```bash
cd server
npm run dev
```
Терминал 2:
```bash
cd client
npm run dev
```
Клиент: `http://localhost:5173`
API: `http://localhost:3000`
## Тесты сервера
Создайте отдельную базу `taskflow_test`, затем выполните:
```bash
cd server
npm test
```
## Тесты клиента
```bash
cd client
npm test
```
## Production build
```bash
cd client
npm run build
cd ../server
npm run start:prod
```
После этого откройте `http://localhost:3000`.
## Демонстрационная учетная запись
Если готовая учетная запись не создается автоматически, зарегистрируйте
пользователя через страницу `/register`.