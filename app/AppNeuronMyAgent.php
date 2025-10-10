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
    public function analyzeJobAndResumes(string $jobTitle, string $jobDescription, array $resumes): string
    {

        // Prepare resume texts
        $resumeTexts = collect($resumes)->map(function ($resume) {
            return "Resume Name: {$resume['name']}\nContent:\n{$resume['content']}";
        })->implode("\n\n");

        // Strong system prompt
        $systemPrompt = new SystemPrompt(
            background: [
                "You are a highly experienced HR AI assistant.",
                "Analyze resumes against a job description and provide a consistent JSON output.",
                "Always use the exact structure below, only the values change.",
                "Numeric fields must always be present (0-100).",
                "Do not include any explanations outside the JSON.",
                "Output must be valid JSON and parseable."
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
        - For each resume, output a JSON object in **exactly this format**:
        {
        "resume_name": "<Resume Name>",
        "summary": "<Brief candidate summary>",
        "key_skills": ["skill1", "skill2", ...],
        "missing_skills": ["skill1", ...],
        "strengths": "<text>",
        "weaknesses": "<text>",
        "match_percentage": <number 0-100>,
        "semantic_score": <number 0-100>,
        "keyword_score": <number 0-100>,
        "keyword_gap": <number 0-100>,
        "ai_text": "<Full detailed AI analysis as text>"
        }

        - Output an **array of objects**, one per resume.
        - Always maintain the same keys and structure.
        - Numeric fields must not be null; use 0 if value not found.
        - Use double quotes for all JSON keys and string values.
        - Do not include extra text, explanations, or formatting outside JSON.
        PROMPT;

        $userMessage = new UserMessage($fullPrompt);

        try {
            $response = $this->chat([$userMessage]);
            $aiContent = $response->getContent();

            // Validate JSON
            json_decode($aiContent, true);

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
