<?php

declare(strict_types=1);

namespace App;

use NeuronAI\Agent;
use NeuronAI\SystemPrompt;
use NeuronAI\Providers\AIProviderInterface;
use NeuronAI\Chat\Messages\UserMessage;
use NeuronAI\Providers\Gemini\Gemini;
use Illuminate\Support\Facades\Log;
use NeuronAI\Chat\History\ChatHistoryInterface;
use NeuronAI\Chat\History\InMemoryChatHistory;

class AppNeuronMyAgent extends Agent
{
    /**
     * Configure Gemini provider using Laravel config
     */
    protected function provider(): AIProviderInterface
    {
        // Get config values
        $apiKey = config('neuron.gemini.api_key');
        $model = config('neuron.gemini.model');

        if (!$apiKey || !$model) {
            Log::error('Gemini API Key or Model is missing. Check your .env and config!');
            throw new \Exception('Gemini API Key or Model is missing.');
        }

        return new Gemini(
            key: $apiKey,
            model: $model
        );
    }


    /**
     * Analyze job and resumes using Neuron AI
     *
     * @param string $jobTitle
     * @param string $jobDescription
     * @param array<int, array{name:string, content:string}> $resumes
     * @return string
     */
    public function analyzeJobAndResumes(string $jobTitle, string $jobDescription, array $resumes, array $resumeFileTypes): string
    {

        // Prepare resume texts
        $resumeTexts = collect($resumes)->map(function ($resume) use ($resumeFileTypes) {
            $fileType = $resumeFileTypes[$resume['id']] ?? 'UNKNOWN';
            return "Resume Name: {$resume['name']}
                    Resume File Type: {$fileType}
                    Content:
                    {$resume['content']}";
        })->implode("\n\n");

        // Enhanced system prompt with new capabilities
        $systemPrompt = new SystemPrompt(
            background: [
                "You are a highly experienced HR AI assistant.",
                "Your task is to analyze resumes against a job description in detail.",
                "You must compute: match percentages, semantic relevance, keyword alignment, skill gaps, strengths, weaknesses, and ATS best practices.",
                "Group related skills under broader categories and treat synonymous skills as partial matches where appropriate.",
                "Return a valid JSON array (no markdown, no explanation, no text outside JSON).",
                "Use numeric values 0–100 for all scoring metrics.",
                "All keys and string values must be double-quoted. Always return valid, parseable JSON."
            ]
        );

        $fullPrompt = <<<PROMPT
        {$systemPrompt}

        Job Description:
        Title: {$jobTitle}
        Details:
        {$jobDescription}

        Resumes:
        {$resumeTexts}

        Instructions for AI:
        - For each resume, analyze thoroughly against the job description.
        - Compute the following metrics:
            1. "overall_match_percentage" (0-100): Weighted average of semantic and keyword relevance.
            2. "semantic_score" (0-100): How well the candidate’s intent, role, and experience align.
            3. "keyword_score" (0-100): Number of direct keyword/tool matches between JD and resume.
            4. "keyword_gap" (0-100): Percentage of JD keywords not found in resume.
        - Extract skills from both JD and resume. Count frequency (resume_count, job_count), compute gap and match status.
        - Recognize synonyms and implied experience where appropriate.
        - Evaluate ATS best practices for each resume including:
            - Resume File Type
            - Email Address
            - Phone Number
            - LinkedIn Profile
            - Job Title Match
            - Education Match
            - Experience Match
            - ats_score (0-100)

        - For Resume File Type, Email, Phone, LinkedIn, Job Title, Education, Experience: 
        - Always use the actual file type provided for each resume in "Resume File Type".
        - Example: "Your resume is a PDF, which can easily be scanned by ATS systems."
        return **short, actionable textual guidance** like:
            - "Your resume is a PDF, which is easily scanned by ATS systems."
            - "Your email john@doe.com is on your resume, good job!"
            - "The job title UX Designer was not found in your resume. Consider including it."
        - Only ats_score should be numeric (0-100)
        - Return a structured array with the following fields for each resume:

        [
            {
            "resume_name": "<Resume Name>",
                "summary": "<Brief 1-2 sentence summary of the candidate's profile>",
                "overall_match_percentage": <0-100>,
                "scores": {
                    "semantic_score": <0-100>,
                    "keyword_score": <0-100>,
                    "keyword_gap": <0-100>
                },
                "skills_analysis": [
                    {
                        "skill": "<Skill Name>",
                        "resume_count": <number>,
                        "job_count": <number>,
                        "gap": <number>,
                        "matched": <true/false>
                    }
                ],
                "ats_best_practice": {
                    "resume_file_type": "<text guidance>",
                    "email_address": "<text guidance>",
                    "phone_number": "<text guidance>",
                    "linkedin_profile": "<text guidance>",
                    "job_title_match": "<text guidance>",
                    "education_match": "<text guidance>",
                    "experience_match": "<text guidance>",
                    "ats_score": <0-100>
                },
                "strengths": "<Short paragraph summarizing candidate's strengths>",
                "weaknesses": "<Short paragraph summarizing candidate's weaknesses>",
                "ai_text": "<Detailed full analysis in natural language>"
            }
        ]

        - All fields are required. Use 0 if numeric value is missing.
        - Output must be valid JSON. No markdown formatting.
        PROMPT;

        $userMessage = new UserMessage($fullPrompt);

        try {
            $response = $this->chat([$userMessage]);
            $aiContent = $response->getContent();

            // Validate JSON
            json_decode($aiContent, true, 512, JSON_THROW_ON_ERROR);

            return $aiContent;
        } catch (\Exception $e) {
            Log::error("Error during AI analysis: " . $e->getMessage());
            return "AI analysis failed. Check logs for details.";
        }
    }
    public function createCoverLetterData(string $jobTitle, string $jobDescription, array $resumes, string $companyName): string
    {
        $resumeTexts = collect($resumes)->map(function ($resume) {
            return "Resume ID: {$resume['id']}\n\n{$resume['content']}";
        })->implode("\n\n----------------------------------------\n\n");
        $userName= auth()->user()->name ;

        $systemPrompt = <<<PROMPT
        You are an advanced AI writing assistant that crafts **concise, elegant, single-page professional cover letters**.

        Your goal:
        - Generate a polished, ATS-friendly cover letter based on the applicant’s resume and job description.
        - Output must fit within a single A4 page (~250–300 words maximum).
        - Maintain excellent readability and professional tone.
        - Do NOT include applicant email, phone, LinkedIn in letter body; these are added in PDF header.
        - Include applicant's full name only in closing line after "Sincerely,".

        PROMPT;

        $fullPrompt = <<<PROMPT
        {$systemPrompt}

        -------------------------------
        **JOB INFORMATION**
        -------------------------------
        Title: {$jobTitle}
        Description:
        {$jobDescription}

        -------------------------------
        **COMPANY INFORMATION**
        -------------------------------
        Company Name: {$companyName}

        -------------------------------
        **RESUME CONTENT**
        -------------------------------
        {$resumeTexts}

        -------------------------------
        **INSTRUCTIONS**
        -------------------------------
        1. Generate a **complete, single-page professional cover letter** that includes:
        - A proper greeting (“Dear Hiring Manager,” or use company name if provided).
        - Clear reference to the job title and company.
        - A summary of relevant achievements and skills (2–3 short paragraphs maximum).
        - A short closing with call-to-action (e.g., “I look forward to discussing how my skills can contribute to your team.”).
        - Polite, confident closing line (“Sincerely,” + applicant name).

        2. **Do NOT include applicant name, email, phone, LinkedIn, and any dates inside the cover letter content.**

        3. Keep total content length under **300 words**, formatted for a single A4 page.

        4. Return a valid JSON object using exactly these keys:
        {
            "applicant_name": "Full name from resume or fallback to logged-in user",
            "email": "applicant@example.com",
            "phone": "+1 (555) 555-5555" (if available),
            "linkedin": "https://linkedin.com/in/example" (if available),
            "cover_letter_html": "<the full HTML version of the formatted cover letter body — no name, email, phone, LinkedIn and any dates>"
        }

        PROMPT;

        try {
            $userMessage = new UserMessage($fullPrompt);
            $response = $this->chat([$userMessage]);
            $aiContent = $response->getContent();

            $cleaned = trim($aiContent);
            $cleaned = preg_replace('/^```(json)?\s*/i', '', $cleaned);
            $cleaned = preg_replace('/\s*```$/', '', $cleaned);
            $cleaned = trim($cleaned);

            $decoded = json_decode($cleaned, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                if (preg_match('/\{(?:[^{}]|(?R))*\}/s', $cleaned, $match)) {
                    $maybeJson = $match[0];
                    $decoded = json_decode($maybeJson, true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        $decoded = null;
                    } else {
                        Log::info('Successfully decoded JSON after extraction.');
                    }
                }
            }

            if (!is_array($decoded)) {
                // best-effort extraction using regex
                $raw = $cleaned;
                // attempt to find email
                preg_match('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', $raw, $mEmail);
                $email = $mEmail[0] ?? '';

                // attempt to find linkedin url
                preg_match('/https?:\/\/(www\.)?linkedin\.com[^\s"]+/i', $raw, $mLn);
                if (!isset($mLn[0])) {
                    // fallback find linkedin path without http
                    preg_match('/linkedin\.com\/[^\s"]+/i', $raw, $mLn);
                }
                $linkedin = $mLn[0] ?? '';

                // attempt to find phone (simple)
                preg_match('/(\+?\d[\d\-\s\(\)]{6,}\d)/', $raw, $mPhone);
                $phone = $mPhone[0] ?? '';

                // attempt to find name: use first line of resume content or "Applicant"
                $firstLine = '';
                if (!empty($resumes) && !empty($resumes[0]['content'])) {
                    $lines = preg_split('/\r\n|\r|\n/', trim($resumes[0]['content']));
                    $firstLine = trim($lines[0] ?? '');
                }
                // If the first line looks like an email or phone, ignore
                if (filter_var($firstLine, FILTER_VALIDATE_EMAIL) || preg_match('/^\+?\d/', $firstLine)) {
                    $firstLine = '';
                }

                // take whole cleaned raw as letter body wrapped as paragraphs
                $coverHtml = '<p>' . nl2br(e(trim($raw))) . '</p>';

                $decoded = [
                    'applicant_name' => $firstLine ?: $userName ?: 'Applicant',
                    'email' => $email,
                    'phone' => $phone,
                    'linkedin' => $linkedin,
                    'cover_letter_html' => $coverHtml,
                ];
            } else {
                // ensure fields exist and sanitize
                $decoded = [
                    'applicant_name' => trim($decoded['applicant_name'] ?? '') ?: $userName ?: 'Applicant',
                    'email' => trim($decoded['email'] ?? ''),
                    'phone' => trim($decoded['phone'] ?? ''),
                    'linkedin' => trim($decoded['linkedin'] ?? ''),
                    'cover_letter_html' => $decoded['cover_letter_html'] ?? '',
                ];
            }

            return json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        } catch (\Throwable $e) {
            Log::error('AI generation failed: ' . $e->getMessage());
            // fallback minimal JSON
            $fallback = [
                'applicant_name' => $userName ?: 'Applicant',
                'email' => '',
                'phone' => '',
                'linkedin' => '',
                'cover_letter_html' => '<p>Unable to generate cover letter at this time..</p>',
            ];
            return json_encode($fallback, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        }
    }
    public function createInterviewPrep(string $jobTitle, string $jobDescription, array $resumes): string
    {
        $resumeTexts = collect($resumes)->map(function ($resume) {
            return "Resume ID: {$resume['id']}\n\n{$resume['content']}";
        })->implode("\n\n----------------------------------------\n\n");

        $systemPrompt = <<<PROMPT
            You are an expert AI career coach. Your task is to generate **interview questions, answers, and a summary** for a candidate.

            Instructions:
            - Use the candidate's resume and the job description.
            - Generate 10-15 relevant interview questions.
            - Provide clear, concise answers tailored to the candidate's skills and experience.
            - Write a short **summary** highlighting the candidate's key strengths, skills, and areas to focus on in the interview.
            - Format the output as JSON:

            {
            "summary": "Short summary text here",
            "questions_answers": [
                {
                "question": "Question text here",
                "answer": "Answer text here"
                }
            ]
            }

            - Make sure the answers reference skills or experiences from the resume where appropriate.
            PROMPT;


        $fullPrompt = <<<PROMPT

        {$systemPrompt}

        Job Title: {$jobTitle}
        Job Description: {$jobDescription}

        Candidate Resume(s):
        {$resumeTexts}

        Generate interview Q&A in JSON format only.
        PROMPT;

        try {
            $userMessage = new UserMessage($fullPrompt);
            $response = $this->chat([$userMessage]);
            $aiContent = $response->getContent();
            $cleaned = trim($aiContent);
            $cleaned = preg_replace('/^```(json)?\s*/i', '', $cleaned);
            $cleaned = preg_replace('/\s*```$/', '', $cleaned);

            $decoded = json_decode($cleaned, true);
            return json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        } catch (\Throwable $e) {
            Log::error('AI generation failed: ' . $e->getMessage());
            return json_encode([], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        }
    }

    protected function chatHistory(): ChatHistoryInterface
    {
        return new InMemoryChatHistory(
            contextWindow: 50000
        );
    }


}
