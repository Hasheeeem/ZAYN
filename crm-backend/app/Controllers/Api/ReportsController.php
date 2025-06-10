<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\LeadModel;
use App\Models\UserModel;

class ReportsController extends BaseController
{
    protected $leadModel;
    protected $userModel;

    public function __construct()
    {
        $this->leadModel = new LeadModel();
        $this->userModel = new UserModel();
        helper('cors');
        service('cors')->handle();
    }

    public function dashboard()
    {
        $totalLeads = $this->leadModel->countAll();
        $newLeads = $this->leadModel->where('created_at >=', date('Y-m-d', strtotime('-7 days')))->countAllResults();
        $convertedLeads = $this->leadModel->where('status', 'converted')->countAllResults();
        $conversionRate = $totalLeads > 0 ? round(($convertedLeads / $totalLeads) * 100, 2) : 0;

        // Lead status distribution
        $statusDistribution = $this->leadModel
            ->select('status, COUNT(*) as count')
            ->groupBy('status')
            ->findAll();

        // Lead source distribution
        $sourceDistribution = $this->leadModel
            ->select('source, COUNT(*) as count')
            ->groupBy('source')
            ->findAll();

        // Recent activities (last 10 leads)
        $recentActivities = $this->leadModel
            ->orderBy('created_at', 'DESC')
            ->limit(10)
            ->findAll();

        return $this->response->setJSON([
            'status' => 'success',
            'data' => [
                'metrics' => [
                    'total_leads' => $totalLeads,
                    'new_leads' => $newLeads,
                    'converted_leads' => $convertedLeads,
                    'conversion_rate' => $conversionRate
                ],
                'status_distribution' => $statusDistribution,
                'source_distribution' => $sourceDistribution,
                'recent_activities' => $recentActivities
            ]
        ]);
    }

    public function leads()
    {
        $startDate = $this->request->getGet('start_date') ?: date('Y-m-01');
        $endDate = $this->request->getGet('end_date') ?: date('Y-m-t');
        $status = $this->request->getGet('status');
        $source = $this->request->getGet('source');
        $assignedTo = $this->request->getGet('assigned_to');

        $builder = $this->leadModel->builder();
        $builder->where('created_at >=', $startDate)
                ->where('created_at <=', $endDate . ' 23:59:59');

        if ($status) {
            $builder->where('status', $status);
        }

        if ($source) {
            $builder->where('source', $source);
        }

        if ($assignedTo) {
            $builder->where('assigned_to', $assignedTo);
        }

        $leads = $builder->findAll();

        // Generate daily lead counts for the date range
        $dailyCounts = [];
        $currentDate = new \DateTime($startDate);
        $endDateTime = new \DateTime($endDate);

        while ($currentDate <= $endDateTime) {
            $dateStr = $currentDate->format('Y-m-d');
            $count = 0;
            
            foreach ($leads as $lead) {
                if (date('Y-m-d', strtotime($lead['created_at'])) === $dateStr) {
                    $count++;
                }
            }
            
            $dailyCounts[] = [
                'date' => $dateStr,
                'count' => $count
            ];
            
            $currentDate->add(new \DateInterval('P1D'));
        }

        return $this->response->setJSON([
            'status' => 'success',
            'data' => [
                'leads' => $leads,
                'daily_counts' => $dailyCounts,
                'total_count' => count($leads)
            ]
        ]);
    }

    public function performance()
    {
        $salespeople = $this->userModel->getSalespeople();
        $performance = [];

        foreach ($salespeople as $person) {
            $totalLeads = $this->leadModel->where('assigned_to', $person['id'])->countAllResults();
            $convertedLeads = $this->leadModel
                ->where('assigned_to', $person['id'])
                ->where('status', 'converted')
                ->countAllResults();
            
            $conversionRate = $totalLeads > 0 ? round(($convertedLeads / $totalLeads) * 100, 2) : 0;

            $performance[] = [
                'id' => $person['id'],
                'name' => $person['first_name'] . ' ' . $person['last_name'],
                'email' => $person['email'],
                'total_leads' => $totalLeads,
                'converted_leads' => $convertedLeads,
                'conversion_rate' => $conversionRate
            ];
        }

        // Sort by conversion rate descending
        usort($performance, function($a, $b) {
            return $b['conversion_rate'] <=> $a['conversion_rate'];
        });

        return $this->response->setJSON([
            'status' => 'success',
            'data' => ['performance' => $performance]
        ]);
    }
}