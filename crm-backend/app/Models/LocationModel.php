<?php

namespace App\Models;

use CodeIgniter\Model;

class LocationModel extends Model
{
    protected $table = 'locations';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    protected $allowedFields = [
        'name', 'slug', 'address', 'city', 'state', 'country',
        'postal_code', 'timezone', 'currency', 'phone', 'email',
        'assigned_to', 'parent_id', 'status', 'created_by'
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
        'name' => 'required|min_length[2]|max_length[100]',
        'currency' => 'required|exact_length[3]',
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

    public function getActiveLocations()
    {
        return $this->where('status', 'active')->findAll();
    }

    public function getLocationHierarchy()
    {
        return $this->select('locations.*, parent.name as parent_name')
                   ->join('locations as parent', 'locations.parent_id = parent.id', 'left')
                   ->findAll();
    }
}