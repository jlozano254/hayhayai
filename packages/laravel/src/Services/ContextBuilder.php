<?php

namespace HayHayAI\Laravel\Services;

/**
 * Builds the system + user prompt from the semantic page context.
 */
class ContextBuilder
{
    /**
     * @param  array<string, mixed>  $pageContext
     * @param  array<int, array{role: string, content: string}>  $conversation
     */
    public function buildSystemContext(array $pageContext): string
    {
        $page = $pageContext['page'] ?? [];
        $components = $pageContext['components'] ?? [];

        $lines = [];
        $lines[] = '--- Current Page Context ---';
        $lines[] = 'URL: '.($page['url'] ?? 'unknown');
        $lines[] = 'Title: '.($page['title'] ?? 'unknown');
        $lines[] = '';
        $lines[] = 'Annotated UI components on this page:';
        $lines[] = json_encode($components, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) ?: '[]';

        return implode("\n", $lines);
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $conversation
     * @return array<int, array{role: string, content: string}>
     */
    public function buildMessages(string $systemPrompt, string $pageContext, array $conversation, string $userMessage): array
    {
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt."\n\n".$pageContext],
        ];

        foreach ($conversation as $turn) {
            $messages[] = [
                'role'    => $turn['role'],
                'content' => $turn['content'],
            ];
        }

        $messages[] = ['role' => 'user', 'content' => $userMessage];

        return $messages;
    }
}
