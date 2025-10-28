<?php

use Illuminate\Support\Facades\Log;

if (!function_exists('extractResumeContent')) {
    function extractResumeContent(string $filePath): string
    {
        Log::info("Extracting resume", ['file' => $filePath]);

        if (!file_exists($filePath)) {
            Log::error("Resume file not found", ['file' => $filePath]);
            throw new \Exception("Resume file not found at {$filePath}");
        }

        $content = '';
        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        try {
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
                    if (!file_exists($outputDir)) mkdir($outputDir, 0755, true);

                    $outputPath = $outputDir . '/' . pathinfo($filePath, PATHINFO_FILENAME) . '.txt';
                    $sofficePath = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN'
                        ? '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"'
                        : '/usr/bin/soffice';

                    $cmd = $sofficePath . ' --headless --convert-to txt:Text --outdir ' . escapeshellarg($outputDir) . ' ' . escapeshellarg($filePath);
                    exec($cmd, $output, $returnCode);

                    if ($returnCode === 0 && file_exists($outputPath)) {
                        $content = file_get_contents($outputPath);
                        unlink($outputPath);
                    } else {
                        throw new \Exception("LibreOffice conversion failed for {$filePath}");
                    }
                    break;

                default:
                    throw new \Exception("Unsupported file type: {$ext}");
            }

            // Normalize encoding
            $content = mb_convert_encoding($content, 'UTF-8', mb_detect_encoding($content, 'UTF-8, ISO-8859-1, Windows-1252', true));
            $content = preg_replace('/[^\PC\s]/u', '', $content);

            Log::info("Resume content extracted", ['length' => strlen($content)]);
            return trim($content);
        } catch (\Exception $e) {
            Log::error("Error extracting content", [
                'file' => $filePath,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
