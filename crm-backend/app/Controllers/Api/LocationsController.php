<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\LocationModel;

class LocationsController extends BaseController
{
    protected $locationModel;

    public function __construct()
    {
        $this->locationModel = new LocationModel();
        helper('cors');
        service('cors')->handle();
    }

    public function index()
    {
        $locations = $this->locationModel->getLocationHierarchy();

        return $this->response->setJSON([
            'status' => 'success',
            'data' => ['locations' => $locations]
        ]);
    }

    public function show($id = null)
    {
        $location = $this->locationModel->find($id);

        if (!$location) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => 'error',
                'message' => 'Location not found'
            ]);
        }

        return $this->response->setJSON([
            'status' => 'success',
            'data' => ['location' => $location]
        ]);
    }

    public function create()
    {
        $rules = [
            'name' => 'required|min_length[2]|max_length[100]',
            'currency' => 'required|exact_length[3]',
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
            'address' => $this->request->getPost('address'),
            'city' => $this->request->getPost('city'),
            'state' => $this->request->getPost('state'),
            'country' => $this->request->getPost('country'),
            'postal_code' => $this->request->getPost('postal_code'),
            'timezone' => $this->request->getPost('timezone'),
            'currency' => $this->request->getPost('currency'),
            'phone' => $this->request->getPost('phone'),
            'email' => $this->request->getPost('email'),
            'assigned_to' => $this->request->getPost('assigned_to'),
            'parent_id' => $this->request->getPost('parent_id'),
            'status' => $this->request->getPost('status') ?: 'active',
            'created_by' => $this->getCurrentUserId()
        ];

        $locationId = $this->locationModel->insert($data);

        if (!$locationId) {
            return $this->response->setStatusCode(500)->setJSON([
                'status' => 'error',
                'message' => 'Failed to create location'
            ]);
        }

        $location = $this->locationModel->find($locationId);

        return $this->response->setStatusCode(201)->setJSON([
            'status' => 'success',
            'message' => 'Location created successfully',
            'data' => ['location' => $location]
        ]);
    }

    public function update($id = null)
    {
        $location = $this->locationModel->find($id);

        if (!$location) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => 'error',
                'message' => 'Location not found'
            ]);
        }

        $data = array_filter([
            'name' => $this->request->getPost('name'),
            'address' => $this->request->getPost('address'),
            'city' => $this->request->getPost('city'),
            'state' => $this->request->getPost('state'),
            'country' => $this->request->getPost('country'),
            'postal_code' => $this->request->getPost('postal_code'),
            'timezone' => $this->request->getPost('timezone'),
            'currency' => $this->request->getPost('currency'),
            'phone' => $this->request->getPost('phone'),
            'email' => $this->request->getPost('email'),
            'assigned_to' => $this->request->getPost('assigned_to'),
            'parent_id' => $this->request->getPost('parent_id'),
            'status' => $this->request->getPost('status')
        ], function($value) {
            return $value !== null && $value !== '';
        });

        if ($this->locationModel->update($id, $data)) {
            $updatedLocation = $this->locationModel->find($id);
            
            return $this->response->setJSON([
                'status' => 'success',
                'message' => 'Location updated successfully',
                'data' => ['location' => $updatedLocation]
            ]);
        }

        return $this->response->setStatusCode(500)->setJSON([
            'status' => 'error',
            'message' => 'Failed to update location'
        ]);
    }

    public function delete($id = null)
    {
        $location = $this->locationModel->find($id);

        if (!$location) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => 'error',
                'message' => 'Location not found'
            ]);
        }

        if ($this->locationModel->delete($id)) {
            return $this->response->setJSON([
                'status' => 'success',
                'message' => 'Location deleted successfully'
            ]);
        }

        return $this->response->setStatusCode(500)->setJSON([
            'status' => 'error',
            'message' => 'Failed to delete location'
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