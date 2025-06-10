<?php

namespace App\Models;

use CodeIgniter\Model;

class LeadModel extends Model
{
    protected $table = 'leads';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    protected $allowedFields = [
        'first_name', 'last_name', 'email', 'phone', 'company', 'domain',
        'job_title', 'price', 'clicks', 'lead_status_id', 'lead_source_id',
        'assigned_to', 'location_id', 'brand_id', 'notes', 'tags',
        'custom_fields', 'last_contacted_at', 'next_follow_up_at',
        'converted_at', 'conversion_value', 'created_by'
    ];

    protected bool $allowEmptyInserts = false;
    protected bool $updateOnlyChanged = true;

    protected array $casts = [
        'tags' => 'array',
        'custom_fields' => 'json',
        'price' => 'float',
        'conversion_value' => 'float'
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat = 'datetime';
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';

    // Validation
    protected $validationRules = [
        'first_name' => 'required|min_length[2]|max_length[50]',
        'email' => 'permit_empty|valid_email',
        'phone' => 'permit_empty|min_length[10]',
        'domain' => 'permit_empty|valid_url_strict'
    ];

    public function getLeadsWithRelations()
    {
        return $this->select('leads.*, lead_statuses.name as status_name, lead_statuses.color as status_color,
                             lead_sources.name as source_name, users.first_name as assigned_first_name,
                             users.last_name as assigned_last_name, brands.name as brand_name,
                             locations.name as location_name')
                   ->join('lead_statuses', 'leads.lead_status_id = lead_statuses.id', 'left')
                   ->join('lead_sources', 'leads.lead_source_id = lead_sources.id', 'left')
                   ->join('users', 'leads.assigned_to = users.id', 'left')
                   ->join('brands', 'leads.brand_id = brands.id', 'left')
                   ->join('locations', 'leads.location_id = locations.id', 'left')
                   ->findAll();
    }

    public function getLeadsByStatus($statusId)
    {
        return $this->where('lead_status_id', $statusId)->findAll();
    }

    public function getLeadsByAssignee($userId)
    {
        return $this->where('assigned_to', $userId)->findAll();
    }

    public function searchLeads($searchTerm)
    {
        return $this->groupStart()
                   ->like('first_name', $searchTerm)
                   ->orLike('last_name', $searchTerm)
                   ->orLike('email', $searchTerm)
                   ->orLike('company', $searchTerm)
                   ->orLike('domain', $searchTerm)
                   ->groupEnd()
                   ->findAll();
    }
}