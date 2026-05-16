<?php

use HayHayAI\Laravel\Http\Controllers\HayhayController;
use Illuminate\Support\Facades\Route;

Route::prefix(config('hayhayai.prefix', 'hayhay'))
    ->middleware(config('hayhayai.middleware', ['web']))
    ->group(function () {
        Route::post('/chat', [HayhayController::class, 'chat'])->name('hayhayai.chat');
        Route::get('/config', [HayhayController::class, 'config'])->name('hayhayai.config');
    });
