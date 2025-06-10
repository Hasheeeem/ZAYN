<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

// API Routes
$routes->group('api', ['namespace' => 'App\Controllers\Api'], function($routes) {
    // Authentication
    $routes->post('auth/login', 'AuthController::login');
    $routes->post('auth/register', 'AuthController::register');
    $routes->get('auth/me', 'AuthController::me', ['filter' => 'auth']);
    $routes->post('auth/logout', 'AuthController::logout', ['filter' => 'auth']);

    // Protected routes
    $routes->group('', ['filter' => 'auth'], function($routes) {
        // Leads
        $routes->resource('leads', ['controller' => 'LeadsController']);
        
        // Users
        $routes->resource('users', ['controller' => 'UsersController']);
        
        // Management Settings
        $routes->resource('brands', ['controller' => 'BrandsController']);
        $routes->resource('products', ['controller' => 'ProductsController']);
        $routes->resource('locations', ['controller' => 'LocationsController']);
        $routes->resource('lead-statuses', ['controller' => 'LeadStatusesController']);
        $routes->resource('lead-sources', ['controller' => 'LeadSourcesController']);
        $routes->resource('ownership-rules', ['controller' => 'OwnershipRulesController']);
        
        // Reports
        $routes->get('reports/dashboard', 'ReportsController::dashboard');
        $routes->get('reports/leads', 'ReportsController::leads');
        $routes->get('reports/performance', 'ReportsController::performance');
    });
});