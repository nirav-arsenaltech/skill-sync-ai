<?php

use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\CoverLetterController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\InterviewPrepController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\OnlineExamController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResumeController;
use App\Models\Resume;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

require __DIR__.'/auth.php';

// Route::get('/', function () {
//     return Auth::check() ? redirect()->route('dashboard') : redirect()->route('login');
// });

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/pricing', [HomeController::class, 'pricing'])->name('pricing');
/*
|--------------------------------------------------------------------------|
| Authenticated Routes                                                     |
|--------------------------------------------------------------------------|
*/

Route::get('/resumes/view/{filename}', function (string $filename) {
    abort_unless(Auth::check(), 403);

    $resume = Resume::where('user_id', Auth::id())
        ->get(['file_path'])
        ->first(function (Resume $resume) use ($filename): bool {
            return basename($resume->file_path) === $filename;
        });

    abort_unless($resume, 404);

    return redirect()->away(storageFileUrl($resume->file_path));
});

Route::middleware(['auth'])->group(function () {
    Route::get('/billing/checkout/{plan}', [BillingController::class, 'checkout'])->name('billing.checkout');
    Route::get('/billing/portal', [BillingController::class, 'portal'])->name('billing.portal');
    Route::get('/billing/portal/return', [BillingController::class, 'portalReturn'])->name('billing.portal.return');
    Route::get('/billing/success', [BillingController::class, 'success'])->name('billing.success');
    Route::get('/billing/cancel', [BillingController::class, 'cancel'])->name('billing.cancel');
    Route::post('/billing/sync', [BillingController::class, 'sync'])->name('billing.sync');
    Route::post('/billing/subscription/cancel', [BillingController::class, 'cancelSubscription'])->name('billing.subscription.cancel');

    // Verified routes
    Route::middleware('verified')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::resource('jobs', JobController::class);
        Route::get('/logs', '\Rap2hpoutre\LaravelLogViewer\LogViewerController@index')->middleware(['auth']);
        Route::prefix('admin')
            ->name('admin.')
            ->middleware('can:access-admin')
            ->group(function () {
                Route::resource('users', UserManagementController::class)->except('show');
            });
    });

    //  interview prep route:
    Route::resource('interview-preps', InterviewPrepController::class);
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

    Route::resource('online-exams', OnlineExamController::class);

    // Analytics routes
    Route::prefix('analytics')->group(function () {
        Route::get('/', [AnalyticsController::class, 'index'])->name('analytics.index');
        Route::post('/scan', [AnalyticsController::class, 'scan'])->name('analytics.scan');
        Route::delete('/{match}', [AnalyticsController::class, 'destroy'])->name('analytics.destroy');
        Route::get('/match-history/{id}', [AnalyticsController::class, 'showMatchHistory'])->name('analytics.match-history');
    });
});
