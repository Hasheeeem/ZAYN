<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateLeadStatusesTable extends Migration
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
                'constraint' => 50,
            ],
            'slug' => [
                'type' => 'VARCHAR',
                'constraint' => 50,
                'null' => true,
                'unique' => true,
            ],
            'description' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'color' => [
                'type' => 'VARCHAR',
                'constraint' => 7,
                'default' => '#6366f1',
            ],
            'is_locked' => [
                'type' => 'BOOLEAN',
                'default' => false,
            ],
            'is_default' => [
                'type' => 'BOOLEAN',
                'default' => false,
            ],
            'sort_order' => [
                'type' => 'INT',
                'default' => 0,
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
        $this->forge->addForeignKey('created_by', 'users', 'id', 'SET NULL', 'CASCADE');
        $this->forge->createTable('lead_statuses');
    }

    public function down()
    {
        $this->forge->dropTable('lead_statuses');
    }
}