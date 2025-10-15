<?php
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResumeController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

require __DIR__ . '/auth.php';

Route::get('/', function () {
    return Auth::check() ? redirect()->route('dashboard') : redirect()->route('login');
});

/*
|--------------------------------------------------------------------------|
| Authenticated Routes                                                     |
|--------------------------------------------------------------------------|
*/
Route::middleware(['auth'])->group(function () {
    // Verified routes
    Route::middleware('verified')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::resource('jobs', JobController::class);
});

    // Resume routes
    Route::resource('resumes', ResumeController::class);
    // Profile routes
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });

    // Analytics routes
    Route::prefix('analytics')->group(function () {
        Route::get('/', [AnalyticsController::class, 'index'])->name('analytics.index');
        Route::post('/scan', [AnalyticsController::class, 'scan'])->name('analytics.scan');
        Route::delete('/{match}', [AnalyticsController::class, 'destroy'])->name('analytics.destroy');
        Route::get('/match-history/{id}', [AnalyticsController::class, 'showMatchHistory'])->name('analytics.match-history');
    });
});