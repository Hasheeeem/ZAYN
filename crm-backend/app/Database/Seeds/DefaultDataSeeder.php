<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class DefaultDataSeeder extends Seeder
{
    public function run()
    {
        // Insert default admin user
        $this->db->table('users')->insert([
            'username' => 'admin',
            'email' => 'admin@lead.com',
            'password_hash' => password_hash('password', PASSWORD_DEFAULT),
            'first_name' => 'Admin',
            'last_name' => 'User',
            'role' => 'admin',
            'status' => 'active',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        // Insert default lead statuses
        $statuses = [
            ['name' => 'New', 'slug' => 'new', 'description' => 'Newly created lead', 'color' => '#10b981', 'sort_order' => 1, 'is_default' => true],
            ['name' => 'Contacted', 'slug' => 'contacted', 'description' => 'Lead has been contacted', 'color' => '#f59e0b', 'sort_order' => 2],
            ['name' => 'Qualified', 'slug' => 'qualified', 'description' => 'Lead is qualified', 'color' => '#3b82f6', 'sort_order' => 3],
            ['name' => 'Converted', 'slug' => 'converted', 'description' => 'Lead has been converted', 'color' => '#059669', 'sort_order' => 4],
            ['name' => 'Lost', 'slug' => 'lost', 'description' => 'Lead is lost', 'color' => '#dc2626', 'sort_order' => 5]
        ];

        foreach ($statuses as $status) {
            $status['created_at'] = date('Y-m-d H:i:s');
            $status['updated_at'] = date('Y-m-d H:i:s');
            $this->db->table('lead_statuses')->insert($status);
        }

        // Insert default lead sources
        $sources = [
            ['name' => 'Website', 'slug' => 'website', 'description' => 'Leads from website forms'],
            ['name' => 'Referral', 'slug' => 'referral', 'description' => 'Leads from referrals'],
            ['name' => 'Social Media', 'slug' => 'social-media', 'description' => 'Leads from social media'],
            ['name' => 'Email Campaign', 'slug' => 'email-campaign', 'description' => 'Leads from email campaigns'],
            ['name' => 'Cold Call', 'slug' => 'cold-call', 'description' => 'Leads from cold calling'],
            ['name' => 'Trade Show', 'slug' => 'trade-show', 'description' => 'Leads from trade shows'],
            ['name' => 'Advertisement', 'slug' => 'advertisement', 'description' => 'Leads from advertisements'],
            ['name' => 'Partner', 'slug' => 'partner', 'description' => 'Leads from partners'],
            ['name' => 'Other', 'slug' => 'other', 'description' => 'Other lead sources']
        ];

        foreach ($sources as $source) {
            $source['created_at'] = date('Y-m-d H:i:s');
            $source['updated_at'] = date('Y-m-d H:i:s');
            $this->db->table('lead_sources')->insert($source);
        }

        // Insert system settings
        $settings = [
            ['setting_key' => 'app_name', 'setting_value' => 'Zayn CRM', 'setting_type' => 'string', 'description' => 'Application name', 'is_public' => true],
            ['setting_key' => 'app_version', 'setting_value' => '1.0.0', 'setting_type' => 'string', 'description' => 'Application version', 'is_public' => true],
            ['setting_key' => 'default_currency', 'setting_value' => 'USD', 'setting_type' => 'string', 'description' => 'Default currency', 'is_public' => false],
            ['setting_key' => 'default_timezone', 'setting_value' => 'UTC', 'setting_type' => 'string', 'description' => 'Default timezone', 'is_public' => false],
            ['setting_key' => 'leads_per_page', 'setting_value' => '10', 'setting_type' => 'integer', 'description' => 'Default leads per page', 'is_public' => false],
            ['setting_key' => 'auto_assign_leads', 'setting_value' => 'false', 'setting_type' => 'boolean', 'description' => 'Auto assign leads to users', 'is_public' => false]
        ];

        foreach ($settings as $setting) {
            $setting['created_at'] = date('Y-m-d H:i:s');
            $setting['updated_at'] = date('Y-m-d H:i:s');
            $this->db->table('system_settings')->insert($setting);
        }
    }
}