<?php

namespace App\Models;

use CodeIgniter\Model;

class LeadSourceModel extends Model
{
    protected $table = 'lead_sources';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    protected $allowedFields = [
        'name', 'slug', 'description', 'cost_per_lead', 'status', 'created_by'
    ];

    protected bool $allowEmptyInserts = false;
    protected bool $updateOnlyChanged = true;

    protected array $casts = [
        'cost_per_lead' => 'float'
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat = 'datetime';
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';

    // Validation
    protected $validationRules = [
        'name' => 'required|min_length[2]|max_length[50]',
        'slug' => 'permit_empty|is_unique[lead_sources.slug,id,{id}]',
        'status' => 'in_list[active,inactive]'
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

    public function getActiveSources()
    {
        return $this->where('status', 'active')->findAll();
    }
}