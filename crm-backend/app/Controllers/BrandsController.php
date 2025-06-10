<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\BrandModel;

class BrandsController extends BaseController
{
    protected $brandModel;

    public function __construct()
    {
        $this->brandModel = new BrandModel();
        helper('cors');
        service('cors')->handle();
    }

    public function index()
    {
        $brands = $this->brandModel->findAll();

        return $this->response->setJSON([
            'status' => 'success',
            'data' => ['brands' => $brands]
        ]);
    }

    public function show($id = null)
    {
        $brand = $this->brandModel->find($id);

        if (!$brand) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => 'error',
                'message' => 'Brand not found'
            ]);
        }

        return $this->response->setJSON([
            'status' => 'success',
            'data' => ['brand' => $brand]
        ]);
    }

    public function create()
    {
        $rules = [
            'name' => 'required|min_length[2]|max_length[100]',
            'status' => 'in_list[active,inactive]'
        ];

        if (!$this->validate($rules)) {
            return $this->response->setStatusCode(400)->setJSON([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $this->validator->getErrors()
            ]);
        }

        $data = [
            'name' => $this->request->getPost('name'),
            'description' => $this->request->getPost('description'),
            'logo_url' => $this->request->getPost('logo_url'),
            'website_url' => $this->request->getPost('website_url'),
            'default_salesperson_id' => $this->request->getPost('default_salesperson_id'),
            'status' => $this->request->getPost('status') ?: 'active',
            'created_by' => $this->getCurrentUserId()
        ];

        $brandId = $this->brandModel->insert($data);

        if (!$brandId) {
            return $this->response->setStatusCode(500)->setJSON([
                'status' => 'error',
                'message' => 'Failed to create brand'
            ]);
        }

        $brand = $this->brandModel->find($brandId);

        return $this->response->setStatusCode(201)->setJSON([
            'status' => 'success',
            'message' => 'Brand created successfully',
            'data' => ['brand' => $brand]
        ]);
    }

    public function update($id = null)
    {
        $brand = $this->brandModel->find($id);

        if (!$brand) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => 'error',
                'message' => 'Brand not found'
            ]);
        }

        $data = array_filter([
            'name' => $this->request->getPost('name'),
            'description' => $this->request->getPost('description'),
            'logo_url' => $this->request->getPost('logo_url'),
            'website_url' => $this->request->getPost('website_url'),
            'default_salesperson_id' => $this->request->getPost('default_salesperson_id'),
            'status' => $this->request->getPost('status')
        ], function($value) {
            return $value !== null && $value !== '';
        });

        if ($this->brandModel->update($id, $data)) {
            $updatedBrand = $this->brandModel->find($id);
            
            return $this->response->setJSON([
                'status' => 'success',
                'message' => 'Brand updated successfully',
                'data' => ['brand' => $updatedBrand]
            ]);
        }

        return $this->response->setStatusCode(500)->setJSON([
            'status' => 'error',
            'message' => 'Failed to update brand'
        ]);
    }

    public function delete($id = null)
    {
        $brand = $this->brandModel->find($id);

        if (!$brand) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => 'error',
                'message' => 'Brand not found'
            ]);
        }

        if ($this->brandModel->delete($id)) {
            return $this->response->setJSON([
                'status' => 'success',
                'message' => 'Brand deleted successfully'
            ]);
        }

        return $this->response->setStatusCode(500)->setJSON([
            'status' => 'error',
            'message' => 'Failed to delete brand'
        ]);
    }

    private function getCurrentUserId()
    {
        $authHeader = $this->request->getHeaderLine('Authorization');
        $token = str_replace('Bearer ', '', $authHeader);
        
        try {
            $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key(env('JWT_SECRET'), env('JWT_ALGORITHM')));
            return $decoded->user_id;
        } catch (\Exception $e) {
            return null;
        }
    }
}