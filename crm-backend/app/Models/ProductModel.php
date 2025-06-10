<?php

namespace App\Models;

use CodeIgniter\Model;

class ProductModel extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    protected $allowedFields = [
        'name', 'sku', 'description', 'price', 'cost', 'brand_id', 'category', 'status', 'created_by'
    ];

    protected bool $allowEmptyInserts = false;
    protected bool $updateOnlyChanged = true;

    protected array $casts = [
        'price' => 'float',
        'cost' => 'float'
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat = 'datetime';
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';

    // Validation
    protected $validationRules = [
        'name' => 'required|min_length[2]|max_length[100]',
        'sku' => 'permit_empty|is_unique[products.sku,id,{id}]',
        'status' => 'in_list[active,inactive]'
    ];

    public function getActiveProducts()
    {
        return $this->where('status', 'active')->findAll();
    }

    public function getProductsWithBrands()
    {
        return $this->select('products.*, brands.name as brand_name')
                   ->join('brands', 'products.brand_id = brands.id', 'left')
                   ->findAll();
    }
}