<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Add middleware configuration here if needed
    })
    ->withExceptions(function (Exceptions $exceptions) {

        // Handle ModelNotFoundException (404)
        //related with data
        $exceptions->render(function (ModelNotFoundException $e, $request) {
            if ($request->is("api/*")) {
                $model = class_basename($e->getModel());
                $ids = implode(', ', $e->getIds());
                return response()->json([
                    'status' => 404,
                    'message' => "{$model} resource not found (ID: {$ids})",
                ]);
            }
        });

        // Handle ValidationException (422)
        $exceptions->render(function (ValidationException $e, $request) {
            if ($request->is("api/*")) {
                return response()->json([
                    'status' => 422,
                    'message' => "Validation failed",
                    'errors' => $e->errors(),
                ]);
            }
        });

        // Handle AuthenticationException (401)
        $exceptions->render(function (AuthenticationException $e, $request) {
            if ($request->is("api/*")) {
                return response()->json([
                    'status' => 401,
                    'message' => "Unauthorized",
                ]);
            }
        });

        // Handle NotFoundHttpException (404)
        //related with url
        $exceptions->render(function (NotFoundHttpException $e, $request) {
            if ($request->is("api/*")) {
                return response()->json([
                    'status' => 404,
                    'message' => "Resource not found",
                ]);
            }
        });

        // Handle MethodNotAllowedHttpException (405)
        $exceptions->render(function (MethodNotAllowedHttpException $e, $request) {
            if ($request->is("api/*")) {
                $allowed = implode(', ', $e->getHeaders()['Allow'] ?? []);
                return response()->json([
                    'status' => 405,
                    'message' => "Method not allowed. Allowed: {$allowed}",
                ]);
            }
        });

        // Handle TooManyRequestsHttpException (429)
        $exceptions->render(function (TooManyRequestsHttpException $e, $request) {
            if ($request->is("api/*")) {
                $retry = $e->getHeaders()['Retry-After'] ?? 60;
                return response()->json([
                    'status' => 429,
                    'message' => "Too many requests. Try again in {$retry} seconds",
                ]);
            }
        });

        // Handle generic errors (500)
        $exceptions->render(function (\Throwable $e, $request) {
            if ($request->is("api/*")) {
                $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
                return response()->json([
                    'status' => $status,
                    'message' => $status === 500 ? 'Internal Server Error' : $e->getMessage(),
                    'errors' => config('app.debug') ? ['debug' => $e->getMessage()] : null,
                ], $status);
            }
        });
    })
    ->create();