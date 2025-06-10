<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateLocationsTable extends Migration
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
            'address' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'city' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
                'null' => true,
            ],
            'state' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
                'null' => true,
            ],
            'country' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
                'null' => true,
            ],
            'postal_code' => [
                'type' => 'VARCHAR',
                'constraint' => 20,
                'null' => true,
            ],
            'timezone' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
                'null' => true,
            ],
            'currency' => [
                'type' => 'VARCHAR',
                'constraint' => 3,
                'default' => 'USD',
            ],
            'phone' => [
                'type' => 'VARCHAR',
                'constraint' => 20,
                'null' => true,
            ],
            'email' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
                'null' => true,
            ],
            'assigned_to' => [
                'type' => 'INT',
                'null' => true,
            ],
            'parent_id' => [
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
        $this->forge->addForeignKey('assigned_to', 'users', 'id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('created_by', 'users', 'id', 'SET NULL', 'CASCADE');
        $this->forge->addForeignKey('parent_id', 'locations', 'id', 'SET NULL', 'CASCADE');
        $this->forge->createTable('locations');

        // Add check constraint
        $this->db->query("ALTER TABLE locations ADD CONSTRAINT chk_locations_status CHECK (status IN ('active', 'inactive'))");
    }

    public function down()
    {
        $this->forge->dropTable('locations');
    }
}