<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\LeadModel;
use App\Models\LeadStatusModel;
use App\Models\LeadSourceModel;

class LeadsController extends BaseController
{
    protected $leadModel;
    protected $statusModel;
    protected $sourceModel;

    public function __construct()
    {
        $this->leadModel = new LeadModel();
        $this->statusModel = new LeadStatusModel();
        $this->sourceModel = new LeadSourceModel();
        helper('cors');
        service('cors')->handle();
    }

    public function index()
    {
        $page = $this->request->getGet('page') ?? 1;
        $limit = $this->request->getGet('limit') ?? 10;
        $search = $this->request->getGet('search');
        $status = $this->request->getGet('status');
        $source = $this->request->getGet('source');
        $assigned_to = $this->request->getGet('assigned_to');

        $builder = $this->leadModel->builder();
        
        // Add joins for related data
        $builder->select('leads.*, lead_statuses.name as status_name, lead_statuses.color as status_color,
                         lead_sources.name as source_name, users.first_name as assigned_first_name,
                         users.last_name as assigned_last_name')
                ->join('lead_statuses', 'leads.lead_status_id = lead_statuses.id', 'left')
                ->join('lead_sources', 'leads.lead_source_id = lead_sources.id', 'left')
                ->join('users', 'leads.assigned_to = users.id', 'left');

        // Apply filters
        if ($search) {
            $builder->groupStart()
                   ->like('leads.first_name', $search)
                   ->orLike('leads.last_name', $search)
                   ->orLike('leads.email', $search)
                   ->orLike('leads.company', $search)
                   ->orLike('leads.domain', $search)
                   ->groupEnd();
        }

        if ($status) {
            $builder->where('leads.lead_status_id', $status);
        }

        if ($source) {
            $builder->where('leads.lead_source_id', $source);
        }

        if ($assigned_to) {
            $builder->where('leads.assigned_to', $assigned_to);
        }

        // Get total count for pagination
        $total = $builder->countAllResults(false);

        // Apply pagination
        $offset = ($page - 1) * $limit;
        $leads = $builder->limit($limit, $offset)->get()->getResultArray();

        return $this->response->setJSON([
            'status' => 'success',
            'data' => [
                'leads' => $leads,
                'pagination' => [
                    'current_page' => (int)$page,
                    'per_page' => (int)$limit,
                    'total' => $total,
                    'total_pages' => ceil($total / $limit)
                ]
            ]
        ]);
    }

    public function show($id = null)
    {
        $lead = $this->leadModel->find($id);

        if (!$lead) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => 'error',
                'message' => 'Lead not found'
            ]);
        }

        return $this->response->setJSON([
            'status' => 'success',
            'data' => ['lead' => $lead]
        ]);
    }

    public function create()
    {
        $rules = [
            'first_name' => 'required|min_length[2]',
            'email' => 'permit_empty|valid_email',
            'phone' => 'permit_empty|min_length[10]'
        ];

        if (!$this->validate($rules)) {
            return $this->response->setStatusCode(400)->setJSON([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $this->validator->getErrors()
            ]);
        }

        $data = [
            'first_name' => $this->request->getPost('first_name'),
            'last_name' => $this->request->getPost('last_name'),
            'email' => $this->request->getPost('email'),
            'phone' => $this->request->getPost('phone'),
            'company' => $this->request->getPost('company'),
            'domain' => $this->request->getPost('domain'),
            'job_title' => $this->request->getPost('job_title'),
            'price' => $this->request->getPost('price') ?: 0,
            'clicks' => $this->request->getPost('clicks') ?: 0,
            'lead_status_id' => $this->request->getPost('lead_status_id'),
            'lead_source_id' => $this->request->getPost('lead_source_id'),
            'assigned_to' => $this->request->getPost('assigned_to'),
            'location_id' => $this->request->getPost('location_id'),
            'brand_id' => $this->request->getPost('brand_id'),
            'notes' => $this->request->getPost('notes'),
            'created_by' => $this->getCurrentUserId()
        ];

        $leadId = $this->leadModel->insert($data);

        if (!$leadId) {
            return $this->response->setStatusCode(500)->setJSON([
                'status' => 'error',
                'message' => 'Failed to create lead'
            ]);
        }

        $lead = $this->leadModel->find($leadId);

        return $this->response->setStatusCode(201)->setJSON([
            'status' => 'success',
            'message' => 'Lead created successfully',
            'data' => ['lead' => $lead]
        ]);
    }

    public function update($id = null)
    {
        $lead = $this->leadModel->find($id);

        if (!$lead) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => 'error',
                'message' => 'Lead not found'
            ]);
        }

        $data = array_filter([
            'first_name' => $this->request->getPost('first_name'),
            'last_name' => $this->request->getPost('last_name'),
            'email' => $this->request->getPost('email'),
            'phone' => $this->request->getPost('phone'),
            'company' => $this->request->getPost('company'),
            'domain' => $this->request->getPost('domain'),
            'job_title' => $this->request->getPost('job_title'),
            'price' => $this->request->getPost('price'),
            'clicks' => $this->request->getPost('clicks'),
            'lead_status_id' => $this->request->getPost('lead_status_id'),
            'lead_source_id' => $this->request->getPost('lead_source_id'),
            'assigned_to' => $this->request->getPost('assigned_to'),
            'location_id' => $this->request->getPost('location_id'),
            'brand_id' => $this->request->getPost('brand_id'),
            'notes' => $this->request->getPost('notes')
        ], function($value) {
            return $value !== null && $value !== '';
        });

        if ($this->leadModel->update($id, $data)) {
            $updatedLead = $this->leadModel->find($id);
            
            return $this->response->setJSON([
                'status' => 'success',
                'message' => 'Lead updated successfully',
                'data' => ['lead' => $updatedLead]
            ]);
        }

        return $this->response->setStatusCode(500)->setJSON([
            'status' => 'error',
            'message' => 'Failed to update lead'
        ]);
    }

    public function delete($id = null)
    {
        $lead = $this->leadModel->find($id);

        if (!$lead) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => 'error',
                'message' => 'Lead not found'
            ]);
        }

        if ($this->leadModel->delete($id)) {
            return $this->response->setJSON([
                'status' => 'success',
                'message' => 'Lead deleted successfully'
            ]);
        }

        return $this->response->setStatusCode(500)->setJSON([
            'status' => 'error',
            'message' => 'Failed to delete lead'
        ]);
    }

    private function getCurrentUserId()
    {
        // Extract user ID from JWT token
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