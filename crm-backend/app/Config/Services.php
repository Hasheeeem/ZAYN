<?php

namespace Config;

use CodeIgniter\Config\BaseService;

class Services extends BaseService
{
    public static function cors($getShared = true)
    {
        if ($getShared) {
            return static::getSharedInstance('cors');
        }

        return new \App\Libraries\Cors();
    }
}