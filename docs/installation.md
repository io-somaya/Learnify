# Installation Guide

## Prerequisites

- Node.js (for Angular)
- PHP (for Laravel)
- Composer (for Laravel dependencies)
- MySQL (for database)

## Steps

### 1. Clone the repository

```bash
# if http
git clone https://github.com/your-username/learnify.git

#if ssh
git clone git@github.com:io-somaya/Learnify.git

```

### 2. Set up the Frontend (Angular)

#### Navigate to the frontend folder:

```bash
cd frontend/learnify-frontend
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

#### Set up the `.env` file and adjust db confugration:

```bash
cp .env.example .env
```

### Generate Application Key

```bash
php artisan key:generate
```


#### Run migrations:

```bash
php artisan migrate
```

#### Start the Laravel server:

```bash
php artisan serve
```



Here’s the formatted content for a `.md` file:

```markdown
### Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/your-username/learnify.git

# Using SSH
git clone git@github.com:io-somaya/Learnify.git
```

