<?php

namespace App\Http\Controllers;

use App\AppNeuronMyAgent;
use App\Models\Matched;
use App\Models\Matches;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Job;
use App\Models\Resume;
use Illuminate\Support\Facades\Auth;

class AnalyticsController extends Controller
{
    // Show Analytics page
    public function index()
    {
        $userId = Auth::id();

        $jobs = Job::where('user_id', $userId)->latest()->get(['id', 'title', 'description']);
        $resumes = Resume::where('user_id', $userId)->latest()->get(['id', 'name', 'file_path']);

        $matchedHistory = Matches::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get([
                'id',
                'resume_id',
                'job_description_id',
                'match_percentage',
                'semantic_score',
                'keyword_score',
                'keyword_gap',
                'ai_result',
                'created_at',
            ])
            ->map(function ($match) {
                $resume = $match->resume;

                // Decode JSON if stored as JSON, fallback to string
                if ($match->ai_result && is_string($match->ai_result)) {
                    $decoded = json_decode($match->ai_result, true);
                    $match->ai_result = $decoded ?: ['ai_text' => $match->ai_result];
                }

                // Add resume name for table display
                $match->resume_name = $resume->name ?? 'N/A';

                return $match;
            });

        return Inertia::render('Analytics/Index', [
            'jobs' => $jobs,
            'resumes' => $resumes,
            'matchedHistory' => $matchedHistory,
        ]);
    }



    public function scan(Request $request)
    {
        $userId = Auth::id();

        $validated = $request->validate([
            'job_id' => "required|exists:job_descriptions,id,user_id,{$userId}",
            'resume_ids' => 'required|array|min:1',
            'resume_ids.*' => "exists:resumes,id,user_id,{$userId}",
        ]);

        // Get Job data
        $job = Job::where('id', $validated['job_id'])->where('user_id', $userId)->first();
        if (!$job)
            return back()->with('error', 'Job not found');

        $jobTitle = $job->title;
        $jobDescription = $job->description ?? '';

        // Collect resume data
        $resumesData = [];
        foreach ($validated['resume_ids'] as $resumeId) {
            $resume = Resume::where('id', $resumeId)->where('user_id', $userId)->first();
            if (!$resume)
                continue;

            $filePath = storage_path('app/public/' . $resume->file_path);
            $content = '';

            if (file_exists($filePath)) {
                $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
                try {
                    if (in_array($ext, ['txt', 'json', 'xml'])) {
                        $content = file_get_contents($filePath);
                    } elseif ($ext === 'pdf') {
                        $content = \Spatie\PdfToText\Pdf::getText($filePath);
                    } elseif (in_array($ext, ['doc', 'docx'])) {
                        $phpWord = \PhpOffice\PhpWord\IOFactory::load($filePath);
                        foreach ($phpWord->getSections() as $section) {
                            foreach ($section->getElements() as $e) {
                                if (method_exists($e, 'getText'))
                                    $content .= $e->getText() . "\n";
                            }
                        }
                    }
                } catch (\Exception $e) {
                    Log::error("Error reading resume file ID {$resume->id}: " . $e->getMessage());
                }
            }

            $resumesData[] = [
                'id' => $resume->id,
                'name' => $resume->name,
                'content' => $content,
            ];
        }


        // Send to AI
        try {
            $agent = new AppNeuronMyAgent();
            $aiResult = $agent->analyzeJobAndResumes($jobTitle, $jobDescription, $resumesData);
        } catch (\Exception $e) {
            Log::error("Error in AI analysis: " . $e->getMessage());
            return back()->with('error', 'AI scan failed. Check logs for details.');
        }

        try {
            // Strip code fences if any
            $cleanedAiResult = trim($aiResult);
            $cleanedAiResult = preg_replace('/^```(json)?\s*/i', '', $cleanedAiResult);
            $cleanedAiResult = preg_replace('/\s*```$/', '', $cleanedAiResult);

            $parsedResults = json_decode($cleanedAiResult, true);

            if (!is_array($parsedResults)) {
                throw new \Exception('Invalid AI result format.');
            }

            foreach ($resumesData as $index => $resume) {
                $resumeResult = $parsedResults[$index] ?? null;
                if (!$resumeResult) {
                    continue;
                }

                Matches::create([
                    'user_id' => $userId,
                    'resume_id' => $resume['id'],
                    'job_description_id' => $job->id,
                    'match_percentage' => $resumeResult['match_percentage'] ?? 0,
                    'semantic_score' => $resumeResult['semantic_score'] ?? 0,
                    'keyword_score' => $resumeResult['keyword_score'] ?? 0,
                    'keyword_gap' => $resumeResult['keyword_gap'] ?? 0,
                    'ai_result' => json_encode([
                        'resume_name' => $resume['name'],
                        'ai_text' => $resumeResult['ai_text'] ?? '',
                        'key_skills' => $resumeResult['key_skills'] ?? [],
                        'missing_skills' => $resumeResult['missing_skills'] ?? [],
                        'strengths' => $resumeResult['strengths'] ?? '',
                        'weaknesses' => $resumeResult['weaknesses'] ?? '',
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

            }

        } catch (\Exception $e) {
            Log::error('Error saving AI results: ' . $e->getMessage(), ['ai_result' => $aiResult]);
            return back()->with('error', 'Failed to save AI scan results. Check logs.');
        }

        return redirect()->route('analytics.index')->with('flash', ['success' => 'Scan completed successfully!']);
    }
}
