<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email Address</title>
</head>
<body>
    <h1>Verify Your Email Address</h1>
    <p>Hello {{ $user->name }},</p>
    <p>Thank you for registering with us. Please click the button below to verify your email address:</p>
    <a href="{{$url}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none;">
        Verify Email
    </a>
    <p>If you did not create an account, no further action is required.</p>
    <p>Thank you,<br>{{ config('app.name') }}</p>
</body>
</html>
