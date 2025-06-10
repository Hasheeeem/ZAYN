<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\LeadSourceModel;

class LeadSourcesController extends BaseController
{
    protected $sourceModel;

    public function __construct()
    {
        $this->sourceModel = new LeadSourceModel();
        helper('cors');
        service('cors')->handle();
    }

    public function index()
    {
        $sources = $this->sourceModel->findAll();

        return $this->response->setJSON([
            'status' => 'success',
            'data' => ['sources' => $sources]
        ]);
    }

    public function show($id = null)
    {
        $source = $this->sourceModel->find($id);

        if (!$source) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => 'error',
                'message' => 'Source not found'
            ]);
        }

        return $this->response->setJSON([
            'status' => 'success',
            'data' => ['source' => $source]
        ]);
    }

    public function create()
    {
        $rules = [
            'name' => 'required|min_length[2]|max_length[50]',
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
            'cost_per_lead' => $this->request->getPost('cost_per_lead'),
            'status' => $this->request->getPost('status') ?: 'active',
            'created_by' => $this->getCurrentUserId()
        ];

        $sourceId = $this->sourceModel->insert($data);

        if (!$sourceId) {
            return $this->response->setStatusCode(500)->setJSON([
                'status' => 'error',
                'message' => 'Failed to create source'
            ]);
        }

        $source = $this->sourceModel->find($sourceId);

        return $this->response->setStatusCode(201)->setJSON([
            'status' => 'success',
            'message' => 'Source created successfully',
            'data' => ['source' => $source]
        ]);
    }

    public function update($id = null)
    {
        $source = $this->sourceModel->find($id);

        if (!$source) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => 'error',
                'message' => 'Source not found'
            ]);
        }

        $data = array_filter([
            'name' => $this->request->getPost('name'),
            'description' => $this->request->getPost('description'),
            'cost_per_lead' => $this->request->getPost('cost_per_lead'),
            'status' => $this->request->getPost('status')
        ], function($value) {
            return $value !== null && $value !== '';
        });

        if ($this->sourceModel->update($id, $data)) {
            $updatedSource = $this->sourceModel->find($id);
            
            return $this->response->setJSON([
                'status' => 'success',
                'message' => 'Source updated successfully',
                'data' => ['source' => $updatedSource]
            ]);
        }

        return $this->response->setStatusCode(500)->setJSON([
            'status' => 'error',
            'message' => 'Failed to update source'
        ]);
    }

    public function delete($id = null)
    {
        $source = $this->sourceModel->find($id);

        if (!$source) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => 'error',
                'message' => 'Source not found'
            ]);
        }

        if ($this->sourceModel->delete($id)) {
            return $this->response->setJSON([
                'status' => 'success',
                'message' => 'Source deleted successfully'
            ]);
        }

        return $this->response->setStatusCode(500)->setJSON([
            'status' => 'error',
            'message' => 'Failed to delete source'
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