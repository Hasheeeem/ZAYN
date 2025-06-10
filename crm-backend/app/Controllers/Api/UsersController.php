<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\UserModel;

class UsersController extends BaseController
{
    protected $userModel;

    public function __construct()
    {
        $this->userModel = new UserModel();
        helper('cors');
        service('cors')->handle();
    }

    public function index()
    {
        $users = $this->userModel->findAll();

        // Remove sensitive data
        foreach ($users as &$user) {
            unset($user['password_hash']);
        }

        return $this->response->setJSON([
            'status' => 'success',
            'data' => ['users' => $users]
        ]);
    }

    public function show($id = null)
    {
        $user = $this->userModel->find($id);

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
    }

    public function create()
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
            'role' => $this->request->getPost('role') ?: 'user',
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

    public function update($id = null)
    {
        $user = $this->userModel->find($id);

        if (!$user) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => 'error',
                'message' => 'User not found'
            ]);
        }

        $data = array_filter([
            'username' => $this->request->getPost('username'),
            'email' => $this->request->getPost('email'),
            'first_name' => $this->request->getPost('first_name'),
            'last_name' => $this->request->getPost('last_name'),
            'phone_number' => $this->request->getPost('phone_number'),
            'role' => $this->request->getPost('role'),
            'status' => $this->request->getPost('status')
        ], function($value) {
            return $value !== null && $value !== '';
        });

        // Handle password update separately
        if ($this->request->getPost('password')) {
            $data['password'] = $this->request->getPost('password');
        }

        if ($this->userModel->update($id, $data)) {
            $updatedUser = $this->userModel->find($id);
            unset($updatedUser['password_hash']);
            
            return $this->response->setJSON([
                'status' => 'success',
                'message' => 'User updated successfully',
                'data' => ['user' => $updatedUser]
            ]);
        }

        return $this->response->setStatusCode(500)->setJSON([
            'status' => 'error',
            'message' => 'Failed to update user'
        ]);
    }

    public function delete($id = null)
    {
        $user = $this->userModel->find($id);

        if (!$user) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => 'error',
                'message' => 'User not found'
            ]);
        }

        if ($this->userModel->delete($id)) {
            return $this->response->setJSON([
                'status' => 'success',
                'message' => 'User deleted successfully'
            ]);
        }

        return $this->response->setStatusCode(500)->setJSON([
            'status' => 'error',
            'message' => 'Failed to delete user'
        ]);
    }

    public function salespeople()
    {
        $salespeople = $this->userModel->getSalespeople();

        // Remove sensitive data
        foreach ($salespeople as &$person) {
            unset($person['password_hash']);
        }

        return $this->response->setJSON([
            'status' => 'success',
            'data' => ['salespeople' => $salespeople]
        ]);
    }
}