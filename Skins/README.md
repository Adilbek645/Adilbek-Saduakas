# SkinVault

Веб-приложение для каталога игровых скинов, кейсов, блога и личных кабинетов пользователей. Проект построен на Next.js, React, TypeScript, PostgreSQL и Drizzle ORM.

## Что нужно установить

- Node.js 20 или новее
- npm
- PostgreSQL 14 или новее

Проверить установку можно командами:

```powershell
node --version
npm --version
psql --version
```

## Запуск на Windows

Откройте PowerShell в папке проекта:

```powershell
cd "ваш_путь"
```

### 1. Установите зависимости

```powershell
npm install
```

### 2. Создайте базу данных

Запустите PostgreSQL и создайте базу `app_db`:

```powershell
psql -U postgres -c "CREATE DATABASE app_db;"
```

Если база уже существует, эту команду повторять не нужно.

### 3. Настройте подключение

Создайте в корне проекта файл `.env.local`:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

Замените `postgres:postgres` на имя пользователя и пароль вашей установки PostgreSQL.

### 4. Создайте таблицы

Выполните команду из корня проекта:

```powershell
npx drizzle-kit push --config=drizzle.config.json
```

Конфигурация Drizzle по умолчанию также использует подключение `postgresql://postgres:postgres@127.0.0.1:5432/app_db`. Если параметры PostgreSQL отличаются, измените их в `drizzle.config.json` перед выполнением команды.

### 5. Запустите сайт

Для режима разработки:

```powershell
npm run dev
```

Откройте в браузере [http://localhost:3000](http://localhost:3000).

При первом обращении к приложению автоматически создаются демонстрационные игры, скины, кейсы, статьи и пользователи.

## Демо-аккаунты

Откройте страницу [http://localhost:3000/login](http://localhost:3000/login):

| Роль | E-mail | Пароль |
| --- | --- | --- |
| Администратор | `admin@skinvault.gg` | `admin123` |
| Автор | `author@skinvault.gg` | `author123` |
| Покупатель | `buyer@skinvault.gg` | `buyer123` |

## Полезные страницы

- `/` — главная страница
- `/skins` — каталог скинов
- `/cases` — кейсы
- `/blog` — блог
- `/login` — вход
- `/dashboard` — кабинет покупателя
- `/studio` — кабинет автора
- `/admin` — панель администратора

## Проверка проекта

```powershell
npm run lint
npm run typecheck
```

## Production-запуск

После настройки базы и переменной `DATABASE_URL` выполните:

```powershell
npm run build
npm run start
```

Production-версия будет доступна по адресу [http://localhost:3000](http://localhost:3000).

## Частые проблемы

### `DATABASE_URL is required`

Убедитесь, что файл `.env.local` находится в корне проекта рядом с `package.json` и содержит переменную `DATABASE_URL`. После изменения переменных перезапустите dev-сервер.

### Ошибка подключения к PostgreSQL

Проверьте, что служба PostgreSQL запущена, база `app_db` создана, а логин, пароль, порт и имя базы в `.env.local` правильные.

### Порт 3000 занят

Запустите Next.js на другом порту:

```powershell
npm run dev -- -p 3001
```

После этого откройте [http://localhost:3001](http://localhost:3001).