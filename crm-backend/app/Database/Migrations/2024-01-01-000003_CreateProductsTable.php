<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateProductsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type' => 'SERIAL',
                'constraint' => 11,
                'auto_increment' => true,
            ],
            'uuid' => [
                'type' => 'UUID',
                'default' => 'uuid_generate_v4()',
                'unique' => true,
            ],
            'name' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
            ],
            'sku' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
                'null' => true,
                'unique' => true,
            ],
            'description' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'price' => [
                'type' => 'DECIMAL',
                'constraint' => '10,2',
                'null' => true,
            ],
            'cost' => [
                'type' => 'DECIMAL',
                'constraint' => '10,2',
                'null' => true,
            ],
            'brand_id' => [
                'type' => 'INT',
                'null' => true,
            ],
            'category' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
                'null' => true,
            ],
            'status' => [
                'type' => 'VARCHAR',
                'constraint' => 20,
                'default' => 'active',
            ],
            'created_by' => [
                'type' => 'INT',
                'null' => true,
            ],
            'created_at' => [
                'type' => 'TIMESTAMP',
                'default' => 'CURRENT_TIMESTAMP',
            ],
            'updated_at' => [
                'type' => 'TIMESTAMP',
                'default' => 'CURRENT_TIMESTAMP',
            ],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('uuid');
        $this->forge->addUniqueKey('sku');
        $this->forge->addForeignKey('brand_id', 'brands', 'id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('created_by', 'users', 'id', 'SET NULL', 'CASCADE');
        $this->forge->createTable('products');

        // Add check constraint
        $this->db->query("ALTER TABLE products ADD CONSTRAINT chk_products_status CHECK (status IN ('active', 'inactive'))");
    }

    public function down()
    {
        $this->forge->dropTable('products');
    }
}