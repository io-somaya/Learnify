<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body>
    <h1>Reset Your Password</h1>
    <p>Hello,</p>
    <p>You are receiving this email because we received a password reset request for your account. Click the button below to reset your password:</p>
    <a href="{{$url}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none;">
        Reset Password
    </a>
    <p>If you did not request a password reset, no further action is required.</p>
    <p>Thank you,<br>{{ config('app.name') }}</p>
</body>
</html>
