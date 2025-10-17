<?php

namespace App\Http\Controllers;


use App\AppNeuronMyAgent;
use App\Models\CoverLetter;
use App\Models\Matches;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Job;
use App\Models\Resume;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class CoverLetterController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();

        // Fetch user's cover letters with relations
        $coverLetters = CoverLetter::with(['resume', 'job'])
            ->where('user_id', $userId)
            ->latest()
            ->paginate(10);

        $jobs = Job::where('user_id', $userId)->latest()->get(['id', 'title', 'description']);
        $resumes = Resume::where('user_id', $userId)->latest()->get(['id', 'name', 'file_path']);

        return Inertia::render('CoverLetters/Index', [
            'coverLetters' => $coverLetters,
            'jobs' => $jobs,
            'resumes' => $resumes,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function create()
    {
        $userId = Auth::id();

        $jobs = Job::where('user_id', $userId)->latest()->get(['id', 'title']);
        $resumes = Resume::where('user_id', $userId)->latest()->get(['id', 'name', 'file_path']);

        return Inertia::render('CoverLetters/Create', [
            'jobs' => $jobs,
            'resumes' => $resumes,
        ]);
    }

    public function store(Request $request)
    {
        $userId = Auth::id();

        $validated = $request->validate([
            'job_id' => "required",
            'resume_id' => 'required',
            'company_name' => 'required|string|max:255',
        ]);

        // --- Get Job data ---
        $job = Job::where('id', $validated['job_id'])->where('user_id', $userId)->first();
        if (!$job) {
            return back()->with('error', 'Job not found.');
        }

        $jobTitle = $job->title;
        $jobDescription = $job->description ?? '';
        $companyName = $validated['company_name'];

        // --- Get Resume data ---
        $resume = Resume::where('id', $validated['resume_id'])->where('user_id', $userId)->first();
        if (!$resume) {
            return back()->with('error', 'Resume not found.');
        }

        $filePath = storage_path('app/public/' . $resume->file_path);
        $content = '';
        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        try {
            if (!file_exists($filePath)) {
                throw new \Exception("Resume file not found at {$filePath}");
            }

            switch ($ext) {
                case 'txt':
                case 'json':
                case 'xml':
                    $content = file_get_contents($filePath);
                    break;

                case 'pdf':
                    $content = \Spatie\PdfToText\Pdf::getText($filePath);
                    break;

                case 'docx':
                    $phpWord = \PhpOffice\PhpWord\IOFactory::load($filePath, 'Word2007');
                    foreach ($phpWord->getSections() as $section) {
                        foreach ($section->getElements() as $e) {
                            if (method_exists($e, 'getText')) {
                                $content .= $e->getText() . "\n";
                            }
                        }
                    }
                    break;

                case 'doc':
                    $outputDir = storage_path('app/tmp');
                    if (!file_exists($outputDir))
                        mkdir($outputDir, 0755, true);

                    $outputPath = $outputDir . '/' . pathinfo($filePath, PATHINFO_FILENAME) . '.txt';
                    $sofficePath = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN'
                        ? '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"'
                        : '/usr/bin/soffice';

                    if (!file_exists(trim($sofficePath, '"'))) {
                        throw new \Exception('LibreOffice not found.');
                    }

                    $cmd = $sofficePath . ' --headless --convert-to txt:Text --outdir ' . escapeshellarg($outputDir) . ' ' . escapeshellarg($filePath);
                    exec($cmd, $output, $returnCode);

                    if ($returnCode === 0 && file_exists($outputPath)) {
                        $content = file_get_contents($outputPath);
                        unlink($outputPath);
                    } else {
                        throw new \Exception("LibreOffice conversion failed for resume ID {$resume->id}");
                    }
                    break;

                default:
                    throw new \Exception("Unsupported file type: {$ext}");
            }

            $content = mb_convert_encoding($content, 'UTF-8', mb_detect_encoding($content, 'UTF-8, ISO-8859-1, Windows-1252', true));
            $content = preg_replace('/[^\PC\s]/u', '', $content);
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to read resume file.');
        }

        // --- AI Generation ---
        try {
            $agent = new AppNeuronMyAgent();
            $aiResult = $agent->createCoverLetterData($job->title, $job->description ?? '', [
                ['id' => $resume->id, 'content' => $content]
            ], $validated['company_name']);
        } catch (\Exception $e) {
            Log::error("AI error: " . $e->getMessage());
            return back()->with('error', 'AI generation failed.');
        }
        // --- Parse and Save ---
        try {
            $data = json_decode($aiResult, true);

            // Validate structure and key presence
            if (!$data || !isset($data['cover_letter_html'])) {
                return back()->with('error', 'AI returned invalid data.');
            }

            // --- Extract all fields with defaults ---
            $applicantName = $data['applicant_name'] ?? 'Applicant';
            $email = $data['email'] ?? '';
            $phone = $data['phone'] ?? '';
            $linkedin = $data['linkedin'] ?? '';
            $coverLetterHtml = $data['cover_letter_html'] ?? '';

            // --- File setup ---
            $pdfFileName = 'cover_letter_' . time() . '.pdf';
            $pdfFilePath = storage_path('app/public/cover_letters/' . $pdfFileName);

            if (!file_exists(dirname($pdfFilePath))) {
                mkdir(dirname($pdfFilePath), 0755, true);
            }
            // --- Prepare absolute URLs for images for barryvdh PDF ---
            $emailIcon = asset('images/email.png');
            $phoneIcon = asset('images/phone.png');
            $linkedinIcon = asset('images/linkedin.png');

            // --- Build HTML layout ---
            $html = view('pdf.cover-letter-template', [
                'name' => $applicantName,
                'email' => $email,
                'phone' => $phone,
                'linkedin' => $linkedin,
                'coverLetterHtml' => $coverLetterHtml,
                'emailIcon' => $emailIcon,
                'phoneIcon' => $phoneIcon,
                'linkedinIcon' => $linkedinIcon,
            ])->render();

            // --- Generate PDF ---
            $pdf = Pdf::loadHTML($html)
                ->setPaper('a4')
                ->setOption('isRemoteEnabled', true)
                ->setOption('margin-top', '10mm')
                ->setOption('margin-bottom', '10mm')
                ->setOption('margin-left', '10mm')
                ->setOption('margin-right', '10mm');

            $pdf->save($pdfFilePath);

            // --- Save DB record ---
            CoverLetter::create([
                'user_id' => $userId,
                'resume_id' => $resume->id,
                'job_description_id' => $job->id,
                'company_name' => $validated['company_name'],
                'ai_result' => $data,
                'file_path' => 'cover_letters/' . $pdfFileName,
            ]);

        } catch (\Exception $e) {
            Log::error('Error saving AI results or generating PDF: ' . $e->getMessage(), [
                'ai_result' => $aiResult,
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Failed to save cover letter. Check logs.');
        }

        return redirect()->route('cover-letters.index')->with('success', 'Cover letter generated successfully!');
    }

    public function show($id)
    {
        $coverLetter = CoverLetter::findOrFail($id);

        $data = is_array($coverLetter->ai_result)
            ? $coverLetter->ai_result
            : json_decode($coverLetter->ai_result, true);

        // PDF paths (for barryvdh PDF generation)
        $emailIconPDF = public_path('images/email.png');
        $phoneIconPDF = public_path('images/phone.png');
        $linkedinIconPDF = public_path('images/linkedin.png');

        // Web paths (for preview in React)
        $emailIconWeb = asset('images/email.png');
        $phoneIconWeb = asset('images/phone.png');
        $linkedinIconWeb = asset('images/linkedin.png');

        $html = view('pdf.cover-letter-template', [
            'name' => $data['applicant_name'] ?? 'Applicant',
            'email' => $data['email'] ?? '',
            'phone' => $data['phone'] ?? '',
            'linkedin' => $data['linkedin'] ?? '',
            'coverLetterHtml' => $data['cover_letter_html'] ?? '',
            // use PDF icons here for generating PDF
            'emailIcon' => $emailIconPDF,
            'phoneIcon' => $phoneIconPDF,
            'linkedinIcon' => $linkedinIconPDF,
        ])->render();

        return Inertia::render('CoverLetters/Show', [
            'coverLetter' => [
                'id' => $coverLetter->id,
                'company_name' => $coverLetter->company_name,
                // for React preview, use web-accessible icons
                'html' => str_replace(
                    [$emailIconPDF, $phoneIconPDF, $linkedinIconPDF],
                    [$emailIconWeb, $phoneIconWeb, $linkedinIconWeb],
                    $html
                ),
            ],
        ]);
    }


    public function destroy($id)
    {
        $CoverLetter = CoverLetter::find($id);
        if (!$CoverLetter) {
            return back()->with('error', 'Cover Letter not found.');
        }
        $CoverLetter->delete();

        return redirect()->route('cover-letters.index')->with('flash', ['success' => 'Cover Letter  Deleted successfully!']);
    }
}
