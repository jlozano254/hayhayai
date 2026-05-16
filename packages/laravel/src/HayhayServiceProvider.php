<?php

namespace HayHayAI\Laravel;

use Illuminate\Support\ServiceProvider;
use HayHayAI\Laravel\Services\LlmService;
use HayHayAI\Laravel\Services\ContextBuilder;

class HayhayServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            __DIR__.'/../config/hayhayai.php',
            'hayhayai'
        );

        $this->app->singleton(LlmService::class);
        $this->app->singleton(ContextBuilder::class);
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__.'/../routes/hayhayai.php');

        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../config/hayhayai.php' => config_path('hayhayai.php'),
            ], 'hayhayai');
        }
    }
}
