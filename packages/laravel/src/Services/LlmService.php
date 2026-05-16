<?php

namespace HayHayAI\Laravel\Services;

use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class LlmService
{
    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array{message: string, blocks: array<mixed>, suggestedActions: array<mixed>}
     */
    public function chat(array $messages): array
    {
        $driver = config('hayhayai.llm.driver', 'openai');

        return match ($driver) {
            'openai' => $this->callOpenAi($messages),
            default  => throw new RuntimeException("hayhayai: unsupported LLM driver [{$driver}]"),
        };
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array{message: string, blocks: array<mixed>, suggestedActions: array<mixed>}
     */
    private function callOpenAi(array $messages): array
    {
        $apiKey = config('hayhayai.llm.api_key');
        $model  = config('hayhayai.llm.model', 'gpt-4o-mini');
        $timeout = (int) config('hayhayai.llm.timeout', 30);

        if (empty($apiKey)) {
            throw new RuntimeException('hayhayai: HAYHAYAI_OPENAI_API_KEY or OPENAI_API_KEY is not set.');
        }

        $response = Http::withToken($apiKey)
            ->timeout($timeout)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model'           => $model,
                'messages'        => $messages,
                'response_format' => ['type' => 'json_object'],
                'temperature'     => 0.4,
            ]);

        if ($response->failed()) {
            throw new RuntimeException('hayhayai: OpenAI API request failed: '.$response->body());
        }

        $content = $response->json('choices.0.message.content', '{}');
        $parsed  = json_decode($content, true);

        if (! is_array($parsed) || ! isset($parsed['message'])) {
            throw new RuntimeException('hayhayai: LLM returned an invalid response shape.');
        }

        return [
            'message'          => (string) $parsed['message'],
            'blocks'           => $parsed['blocks'] ?? [],
            'suggestedActions' => $parsed['suggestedActions'] ?? [],
        ];
    }
}
