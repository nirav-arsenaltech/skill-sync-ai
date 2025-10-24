<?php
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\CoverLetterController;
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

Route::get('/resumes/view/{filename}', function ($filename) {
    $file = storage_path('app/public/resumes/' . $filename);
    abort_unless(file_exists($file), 404);
    return response()->file($file);
});

Route::middleware(['auth'])->group(function () {
    // Verified routes
    Route::middleware('verified')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::resource('jobs', JobController::class);
        Route::get('/logs', '\Rap2hpoutre\LaravelLogViewer\LogViewerController@index')->middleware(['auth']);
});

    // Resume routes
    Route::resource('resumes', ResumeController::class);
    Route::resource('cover-letters', CoverLetterController::class);
    Route::post('cover-letters/{coverLetter}/update', [CoverLetterController::class, 'update'])->name('cover-letters.update');
    Route::post('cover-letters/{coverLetter}/preview', [CoverLetterController::class, 'preview'])->name('cover-letters.preview');
    Route::get('/cover-letters/{id}', [CoverLetterController::class, 'show'])->name('coverLetters.show');
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