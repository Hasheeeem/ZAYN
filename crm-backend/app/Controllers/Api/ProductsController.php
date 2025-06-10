<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\ProductModel;

class ProductsController extends BaseController
{
    protected $productModel;

    public function __construct()
    {
        $this->productModel = new ProductModel();
        helper('cors');
        service('cors')->handle();
    }

    public function index()
    {
        $products = $this->productModel->getProductsWithBrands();

        return $this->response->setJSON([
            'status' => 'success',
            'data' => ['products' => $products]
        ]);
    }

    public function show($id = null)
    {
        $product = $this->productModel->find($id);

        if (!$product) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => 'error',
                'message' => 'Product not found'
            ]);
        }

        return $this->response->setJSON([
            'status' => 'success',
            'data' => ['product' => $product]
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
            'sku' => $this->request->getPost('sku'),
            'description' => $this->request->getPost('description'),
            'price' => $this->request->getPost('price'),
            'cost' => $this->request->getPost('cost'),
            'brand_id' => $this->request->getPost('brand_id'),
            'category' => $this->request->getPost('category'),
            'status' => $this->request->getPost('status') ?: 'active',
            'created_by' => $this->getCurrentUserId()
        ];

        $productId = $this->productModel->insert($data);

        if (!$productId) {
            return $this->response->setStatusCode(500)->setJSON([
                'status' => 'error',
                'message' => 'Failed to create product'
            ]);
        }

        $product = $this->productModel->find($productId);

        return $this->response->setStatusCode(201)->setJSON([
            'status' => 'success',
            'message' => 'Product created successfully',
            'data' => ['product' => $product]
        ]);
    }

    public function update($id = null)
    {
        $product = $this->productModel->find($id);

        if (!$product) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => 'error',
                'message' => 'Product not found'
            ]);
        }

        $data = array_filter([
            'name' => $this->request->getPost('name'),
            'sku' => $this->request->getPost('sku'),
            'description' => $this->request->getPost('description'),
            'price' => $this->request->getPost('price'),
            'cost' => $this->request->getPost('cost'),
            'brand_id' => $this->request->getPost('brand_id'),
            'category' => $this->request->getPost('category'),
            'status' => $this->request->getPost('status')
        ], function($value) {
            return $value !== null && $value !== '';
        });

        if ($this->productModel->update($id, $data)) {
            $updatedProduct = $this->productModel->find($id);
            
            return $this->response->setJSON([
                'status' => 'success',
                'message' => 'Product updated successfully',
                'data' => ['product' => $updatedProduct]
            ]);
        }

        return $this->response->setStatusCode(500)->setJSON([
            'status' => 'error',
            'message' => 'Failed to update product'
        ]);
    }

    public function delete($id = null)
    {
        $product = $this->productModel->find($id);

        if (!$product) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => 'error',
                'message' => 'Product not found'
            ]);
        }

        if ($this->productModel->delete($id)) {
            return $this->response->setJSON([
                'status' => 'success',
                'message' => 'Product deleted successfully'
            ]);
        }

        return $this->response->setStatusCode(500)->setJSON([
            'status' => 'error',
            'message' => 'Failed to delete product'
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