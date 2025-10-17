<?php
namespace App\Http\Controllers;

use App\Models\CoverLetter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Job;
use App\Models\Resume;
use App\Models\Matches;

class DashboardController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        // Cards
        $totalResumes = Resume::where('user_id', $userId)->count();
        $totalJobs = Job::where('user_id', $userId)->count();
        $totalMatches = Matches::where('user_id', $userId)->count();
        $totalCoverLetters = CoverLetter::where('user_id', $userId)->count();

        // Recent jobs (latest 5)
        $recentJobs = Job::where('user_id', $userId)
            ->latest()
            ->take(5)
            ->get(['id', 'title', 'created_at'])
            ->map(fn($job) => [
                'id' => $job->id,
                'title' => $job->title,
                'date' => $job->created_at->format('d/m/Y'),
            ]);

        // Recent resumes (latest 5)
        $recentResumes = Resume::where('user_id', $userId)
            ->latest()
            ->take(5)
            ->get(['id', 'name', 'created_at'])
            ->map(fn($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'date' => $r->created_at->format('d/m/Y'),
            ]);

        $recentCoverLetters = CoverLetter::where('user_id', $userId)
            ->latest()
            ->take(5)
            ->get(['id', 'company_name', 'created_at'])
            ->map(fn($cl) => [
                'id' => $cl->id,
                'company_name' => $cl->company_name ?? '',
                'date' => $cl->created_at->format('d/m/Y'),
            ]);
        return Inertia::render('Dashboard/Index', [
            'cards' => [
                ['title' => 'Total Resumes', 'value' => $totalResumes ?: 0],
                ['title' => 'Total Jobs', 'value' => $totalJobs ?: 0],
                ['title' => 'Total Matches', 'value' => $totalMatches ?: 0],
                ['title' => 'Total Cover Letters', 'value' => $totalCoverLetters ?: 0],
            ],
            'recentJobs' => $recentJobs,
            'recentResumes' => $recentResumes,
            'recentCoverLetters' => $recentCoverLetters,
        ]);
    }


}
