# 📚 Learnify - Next-Gen E-Learning Platform (Laravel 11 + Angular 18)

**A cutting-edge e-learning platform** leveraging the latest stable releases of Laravel (v11) and Angular (v18) for optimal performance, security, and developer experience.

**Learnify** is a full-featured e-learning platform designed for educational institutions, offering live classes, recorded lectures, automated grading, and performance analytics — all with secure multi-role access for students, teachers, and parents.

> 🚀 Developed with Angular, Laravel, and MySQL as part of the ITI Graduation Program by a team of passionate developers.

## 📋 Table of Contents
- [Key Features](#-key-features)
- [Tech Stack & Integrations](#️-tech-stack--integrations)
- [Modern Stack Advantages](#-modern-stack-advantages)
- [Installation & Setup](#️-installation--setup)
- [Key Integrations](#-key-integrations)
- [Deployment](#-deployment)
- [Contributors](#-contributors)
- [Project Governance](#-project-governance)
- [Compatibility Notes](#️-compatibility-notes)
- [License & Copyright](#-license--copyright)
- [Security Policy](#-security-policy)

## ✨ Key Features

- **Live Zoom Integration:** Real-time interactive classes with [Zoom API](#)
- **Automated Grading:** AI-assisted assessment system
- **Payment Processing:** Secure transactions via Paymob
- **Email Notifications:** Reliable delivery with SendGrid
- **Multi-Role Dashboards:** Tailored interfaces for Students, Teachers, and Parents
- **Performance Analytics:** Detailed progress tracking with visual reports
- **Responsive UI:** Mobile-friendly Bootstrap 5 design

## 🛠️ Tech Stack & Integrations

| Category          | Technologies                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| **Frontend**      | Angular 18 (+ Signals), Bootstrap 5.3, SSR Chart.js                          |
| **Backend**       | Laravel 11 (PHP 8.2+), Laravel Reverb (WebSockets), Laravel Pulse, Sanctum   |
| **Database**      | MySQL 8.0+ (With JSON support) (Eloquent ORM)                                |
| **APIs**          | Zoom Meetings API, Paymob Payment Gateway, SendGrid Email API                |
| **Security**      | JWT Authentication, Role-Based Access Control, Data Encryption               |

## 🚀 Modern Stack Advantages

### **Laravel 11**
- Simplified directory structure 
- Per-second cron scheduling
- Model casts as methods
- `once()` helper for singleton-like services

### **Angular 18**
- Signals for reactive state management
- Improved Hydration (SSR)
- `@let` template syntax (experimental)
- Default `zoneless` change detection

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+
- PHP 8.2
- Composer 2.5+
- MySQL 8.0+

### 1. Clone Repository
```bash
git clone https://github.com/io-somaya/Learnify.git
cd Learnify
```

### 2. Backend Setup
```bash
cd backend
composer install --ignore-platform-reqs # Laravel 11 requires PHP 8.2+
cp .env.example .env  # Configure Zoom, Paymob, SendGrid keys
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install --legacy-peer-deps  # Handle Angular 18 peer dependencies
ng serve
```

Access the platform at `http://localhost:4200`

## 🔐 Key Integrations

### Zoom Meetings
```json
"jubaer/zoom-laravel": "^1.3"
```
- Live class scheduling
- Attendance tracking
- Recording management

### Paymob Payments
```php
// Sample payment integration
$payment = new PaymobGateway(config('paymob.api_key'));
```
- Secure fee collection
- Subscription management
- Invoice generation

### SendGrid Email
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
```
- Automated notifications
- Bulk email campaigns
- Activity alerts

## 🔄 Deployment

### Laravel 11 (Production)
```bash
php artisan optimize:clear
php artisan route:cache
php artisan event:cache
```

### Angular 18 (Production)
```bash
ng build --configuration production --aot
```

## 👨‍💻 Contributors

| Member                | Role                | Contact                           |
|-----------------------|---------------------|-----------------------------------|
| **Omar Rizk**         | Backend Developer   | [GitHub](https://github.com/OmarMMRizk) · [LinkedIn](https://www.linkedin.com/in/omar-mohamed-rizk/) |
| **Abdelrahman Hasan** | Full-Stack Developer| [GitHub](https://github.com/Abdo-hasen) · [LinkedIn](https://www.linkedin.com/in/abdelrhman-hasan22/) |
| **Somaya Hassan**     | Frontend Lead       | [GitHub](https://github.com/io-somaya) · [LinkedIn](https://www.linkedin.com/in/io-somaya/) |
| **Mahmoud Elsayed**   | Database Architect  | [GitHub](https://github.com/Mahmoud-Eid-Elsayed) · [LinkedIn](https://www.linkedin.com/in/mahmoud-elsayed/) |

## 📜 Project Governance

| Document               | Purpose                                                                 |
|------------------------|-------------------------------------------------------------------------|
| [CODE_OF_CONDUCT](./CODE_OF_CONDUCT.md) | Community interaction guidelines |
| [LICENSE](./LICENSE)   | Custom usage permissions (All rights reserved)                          |
| [SECURITY](./SECURITY.md) | Vulnerability reporting and policies                              |

## ⚠️ Compatibility Notes
- Requires **PHP 8.2+** (Laravel 11 minimum)
- **Node.js v20+** recommended for Angular 18
- MySQL 8.0+ for full JSON column support

## 📄 License & Copyright

This project is **not open-source** and is protected under a custom license. Unauthorized use, modification, or distribution is strictly prohibited without written consent from the Learnify team.
Unauthorized use of this codebase violates:  
- Laravel's license terms ([view](https://laravel.com))  
- Angular's MIT license dependencies ([view](https://angular.io/license))  

## 🔒 Security Policy

Report vulnerabilities responsibly:  
1. Email security issues to **learnify.security@example.com**  
2. Do not disclose publicly until patched  
3. Include reproduction steps and impact analysis  

See [SECURITY.md](./SECURITY.md) for full disclosure policy.