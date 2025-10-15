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
    protected function chatHistory(): ChatHistoryInterface
    {
        return new InMemoryChatHistory(
            contextWindow: 50000
        );
    }


}
