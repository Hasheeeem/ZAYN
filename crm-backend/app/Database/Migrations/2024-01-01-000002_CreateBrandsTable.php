<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateBrandsTable extends Migration
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
            'slug' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
                'null' => true,
                'unique' => true,
            ],
            'description' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'logo_url' => [
                'type' => 'VARCHAR',
                'constraint' => 255,
                'null' => true,
            ],
            'website_url' => [
                'type' => 'VARCHAR',
                'constraint' => 255,
                'null' => true,
            ],
            'default_salesperson_id' => [
                'type' => 'INT',
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
        $this->forge->addUniqueKey('slug');
        $this->forge->addForeignKey('default_salesperson_id', 'users', 'id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('created_by', 'users', 'id', 'SET NULL', 'CASCADE');
        $this->forge->createTable('brands');

        // Add check constraint
        $this->db->query("ALTER TABLE brands ADD CONSTRAINT chk_brands_status CHECK (status IN ('active', 'inactive'))");
    }

    public function down()
    {
        $this->forge->dropTable('brands');
    }
}