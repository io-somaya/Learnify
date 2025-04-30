<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Learnify Password</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #4a67b7;
            margin-bottom: 10px;
        }

        h1 {
            color: #4a67b7;
            border-bottom: 2px solid #eaeaea;
            padding-bottom: 10px;
            font-size: 24px;
        }

        .content {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 20px;
            border: 1px solid #eaeaea;
        }

        .button {
            display: inline-block;
            background-color: #4a67b7;
            color: white !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }

        .button:hover {
            background-color: #3a558c;
        }

        .footer {
            text-align: center;
            font-size: 14px;
            color: #777;
            margin-top: 30px;
            border-top: 1px solid #eaeaea;
            padding-top: 20px;
        }

        .note {
            font-size: 13px;
            color: #888;
            margin-top: 20px;
        }
    </style>
</head>

<body>
    <div class="header">
        <div class="logo">Learnify</div>
    </div>

    <div class="content">
        <h1>Reset Your Password</h1>

        <p>Hello,</p>

        <p>We received a request to reset your password for your Learnify account. Click the button below to create a
            new password. This link will expire in 15 minutes.</p>

        <div style="text-align: center;">
            <a href="{{ $url }}" class="button">Reset Password</a>
        </div>

        <p class="note">If you didn't request this password reset, you can safely ignore this email. Your account
            security is important to us.</p>
    </div>

    <div class="footer">
        <p>Thank you for choosing Learnify</p>
        <p>&copy; {{ date('Y') }} Learnify. All rights reserved.</p>
    </div>
</body>

</html>
