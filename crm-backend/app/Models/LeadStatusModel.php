<?php

namespace App\Models;

use CodeIgniter\Model;

class LeadStatusModel extends Model
{
    protected $table = 'lead_statuses';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    protected $allowedFields = [
        'name', 'slug', 'description', 'color', 'is_locked', 'is_default', 'sort_order', 'created_by'
    ];

    protected bool $allowEmptyInserts = false;
    protected bool $updateOnlyChanged = true;

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat = 'datetime';
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';

    // Validation
    protected $validationRules = [
        'name' => 'required|min_length[2]|max_length[50]',
        'slug' => 'permit_empty|is_unique[lead_statuses.slug,id,{id}]',
        'color' => 'required|regex_match[/^#[0-9A-Fa-f]{6}$/]'
    ];

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert = ['generateSlug'];
    protected $beforeUpdate = ['generateSlug'];

    protected function generateSlug(array $data)
    {
        if (isset($data['data']['name']) && empty($data['data']['slug'])) {
            $data['data']['slug'] = url_title($data['data']['name'], '-', true);
        }
        return $data;
    }

    public function getDefaultStatus()
    {
        return $this->where('is_default', true)->first();
    }

    public function getOrderedStatuses()
    {
        return $this->orderBy('sort_order', 'ASC')->findAll();
    }
}