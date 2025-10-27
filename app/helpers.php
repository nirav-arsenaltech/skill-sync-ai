<?php

use Illuminate\Support\Facades\Log;

if (!function_exists('extractResumeContent')) {
    function extractResumeContent(string $filePath): string
    {
        Log::info("Starting resume extraction", ['file' => $filePath]);

        if (!file_exists($filePath)) {
            Log::error("Resume file not found", ['file' => $filePath]);
            throw new \Exception("Resume file not found at {$filePath}");
        }

        $content = '';
        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        Log::info("Detected file extension", ['extension' => $ext]);

        try {
            switch ($ext) {
                case 'txt':
                case 'json':
                case 'xml':
                    Log::debug("Reading plain text-based file", ['type' => $ext]);
                    $content = file_get_contents($filePath);
                    break;

                case 'pdf':
                    Log::debug("Extracting text from PDF");
                    $content = \Spatie\PdfToText\Pdf::getText($filePath);
                    break;

                case 'docx':
                    Log::debug("Extracting text from DOCX");
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
                    Log::debug("Attempting DOC to TXT conversion via LibreOffice");
                    $outputDir = storage_path('app/tmp');
                    if (!file_exists($outputDir)) {
                        mkdir($outputDir, 0755, true);
                        Log::info("Created temp output directory", ['path' => $outputDir]);
                    }

                    $outputPath = $outputDir . '/' . pathinfo($filePath, PATHINFO_FILENAME) . '.txt';
                    $sofficePath = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN'
                        ? '"C:\\Program Files\\LibreOffice\\program\\soffice.exe"'
                        : '/usr/bin/soffice';

                    $cmd = $sofficePath . ' --headless --convert-to txt:Text --outdir ' . escapeshellarg($outputDir) . ' ' . escapeshellarg($filePath);
                    Log::debug("Executing LibreOffice command", ['command' => $cmd]);

                    exec($cmd, $output, $returnCode);

                    if ($returnCode === 0 && file_exists($outputPath)) {
                        Log::info("LibreOffice conversion successful", ['output' => $outputPath]);
                        $content = file_get_contents($outputPath);
                        unlink($outputPath);
                    } else {
                        Log::error("LibreOffice conversion failed", ['file' => $filePath, 'returnCode' => $returnCode, 'output' => $output]);
                        throw new \Exception("LibreOffice conversion failed for {$filePath}");
                    }
                    break;

                default:
                    Log::warning("Unsupported file type", ['file' => $filePath, 'ext' => $ext]);
                    throw new \Exception("Unsupported file type: {$ext}");
            }

            // Clean text encoding
            $content = mb_convert_encoding($content, 'UTF-8', mb_detect_encoding($content, 'UTF-8, ISO-8859-1, Windows-1252', true));
            $content = preg_replace('/[^\PC\s]/u', '', $content);

            Log::info("Resume content extraction completed successfully", [
                'file' => $filePath,
                'length' => strlen($content)
            ]);

            return $content;
        } catch (\Exception $e) {
            Log::error("Error extracting resume content", [
                'file' => $filePath,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
}
