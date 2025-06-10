<?php

namespace App\Controllers;

use CodeIgniter\Controller;
use Config\Database;

class DatabaseTest extends Controller
{
    public function index()
    {
        try {
            $db = Database::connect();
            $query = $db->query('SELECT NOW()');
            $result = $query->getRow();

            return $this->response->setJSON([
                'status' => 'connected',
                'timestamp' => $result->now ?? null
            ]);
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'status' => 'error',
                'message' => $e->getMessage()
            ])->setStatusCode(500);
        }
    }
}
