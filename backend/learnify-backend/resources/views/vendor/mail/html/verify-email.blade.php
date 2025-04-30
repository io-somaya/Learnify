<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Learnify Email Address</title>
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

        .welcome {
            font-weight: bold;
            font-size: 18px;
            color: #4a67b7;
        }
    </style>
</head>

<body>
    <div class="header">
        <div class="logo">Learnify</div>
    </div>

    <div class="content">
        <h1>Verify Your Email Address</h1>

        <p class="welcome">Hello {{ $user->name }},</p>

        <p>Welcome to Learnify! We're excited to have you join our learning community. To get started, please verify
            your email address by clicking the button below:</p>

        <div style="text-align: center;">
            <a href="{{ $url }}" class="button">Verify Email Address</a>
        </div>

        <p class="note">If you did not create a Learnify account, you can safely ignore this email.</p>
    </div>

    <div class="footer">
        <p>Thank you for choosing Learnify</p>
        <p>&copy; {{ date('Y') }} Learnify. All rights reserved.</p>
    </div>
</body>

</html>
