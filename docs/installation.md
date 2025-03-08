# Installation Guide

## Prerequisites
- Node.js (for Angular)
- PHP (for Laravel)
- Composer (for Laravel dependencies)
- MySQL (for database)

## Steps

### 1. Clone the repository
```bash
git clone https://github.com/your-username/learnify.git
```

### 2. Set up the Frontend (Angular)
#### Navigate to the frontend folder:
```bash
cd frontend
```
#### Install dependencies:
```bash
npm install
```
#### Start the development server:
```bash
ng serve
```

### 3. Set up the Backend (Laravel)
#### Navigate to the backend folder:
```bash
cd ../backend
```
#### Install dependencies:
```bash
composer install
```
#### Set up the `.env` file:
```bash
cp .env.example .env
```
#### Run migrations:
```bash
php artisan migrate
```
#### Start the Laravel server:
```bash
php artisan serve
