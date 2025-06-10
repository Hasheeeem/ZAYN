<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\UserModel;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthController extends BaseController
{
    protected $userModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
        helper('cors');
        service('cors')->handle();
    }

    public function login()
    {
        $rules = [
            'email' => 'required|valid_email',
            'password' => 'required'
        ];

        if (!$this->validate($rules)) {
            return $this->response->setStatusCode(400)->setJSON([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $this->validator->getErrors()
            ]);
        }

        $email = $this->request->getPost('email');
        $password = $this->request->getPost('password');

        $user = $this->userModel->findByEmail($email);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            return $this->response->setStatusCode(401)->setJSON([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ]);
        }

        if ($user['status'] !== 'active') {
            return $this->response->setStatusCode(401)->setJSON([
                'status' => 'error',
                'message' => 'Account is inactive'
            ]);
        }

        // Update last login
        $this->userModel->update($user['id'], ['last_login' => date('Y-m-d H:i:s')]);

        // Generate JWT token
        $payload = [
            'iss' => base_url(),
            'aud' => base_url(),
            'iat' => time(),
            'exp' => time() + (int)env('JWT_EXPIRE', 3600),
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role']
        ];

        $token = JWT::encode($payload, env('JWT_SECRET'), env('JWT_ALGORITHM'));

        // Remove sensitive data
        unset($user['password_hash']);

        return $this->response->setJSON([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'user' => $user,
                'token' => $token,
                'expires_in' => (int)env('JWT_EXPIRE', 3600)
            ]
        ]);
    }

    public function register()
    {
        $rules = [
            'username' => 'required|min_length[3]|is_unique[users.username]',
            'email' => 'required|valid_email|is_unique[users.email]',
            'password' => 'required|min_length[8]',
            'first_name' => 'required|min_length[2]',
            'last_name' => 'required|min_length[2]',
            'role' => 'permit_empty|in_list[admin,manager,sales,user]'
        ];

        if (!$this->validate($rules)) {
            return $this->response->setStatusCode(400)->setJSON([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $this->validator->getErrors()
            ]);
        }

        $data = [
            'username' => $this->request->getPost('username'),
            'email' => $this->request->getPost('email'),
            'password' => $this->request->getPost('password'),
            'first_name' => $this->request->getPost('first_name'),
            'last_name' => $this->request->getPost('last_name'),
            'phone_number' => $this->request->getPost('phone_number'),
            'role' => $this->request->getPost('role') ?: 'sales',
            'status' => 'active'
        ];

        $userId = $this->userModel->insert($data);

        if (!$userId) {
            return $this->response->setStatusCode(500)->setJSON([
                'status' => 'error',
                'message' => 'Failed to create user'
            ]);
        }

        $user = $this->userModel->find($userId);
        unset($user['password_hash']);

        return $this->response->setStatusCode(201)->setJSON([
            'status' => 'success',
            'message' => 'User created successfully',
            'data' => ['user' => $user]
        ]);
    }

    public function me()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $token = str_replace('Bearer ', '', $authHeader);
        
        try {
            $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), env('JWT_ALGORITHM')));
            $user = $this->userModel->find($decoded->user_id);
            
            if (!$user) {
                return $this->response->setStatusCode(404)->setJSON([
                    'status' => 'error',
                    'message' => 'User not found'
                ]);
            }

            unset($user['password_hash']);

            return $this->response->setJSON([
                'status' => 'success',
                'data' => ['user' => $user]
            ]);
        } catch (\Exception $e) {
            return $this->response->setStatusCode(401)->setJSON([
                'status' => 'error',
                'message' => 'Invalid token'
            ]);
        }
    }

    public function logout()
    {
        // In a real application, you might want to blacklist the token
        return $this->response->setJSON([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ]);
    }
}