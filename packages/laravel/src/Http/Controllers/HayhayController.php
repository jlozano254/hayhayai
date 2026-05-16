<?php

namespace HayHayAI\Laravel\Http\Controllers;

use HayHayAI\Laravel\Http\Requests\ChatRequest;
use HayHayAI\Laravel\Services\ContextBuilder;
use HayHayAI\Laravel\Services\LlmService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Throwable;

class HayhayController extends Controller
{
    public function __construct(
        private readonly LlmService $llm,
        private readonly ContextBuilder $contextBuilder,
    ) {}

    public function chat(ChatRequest $request): JsonResponse
    {
        try {
            $systemPrompt  = config('hayhayai.system_prompt', '');
            $pageContext   = $this->contextBuilder->buildSystemContext($request->input('pageContext', []));
            $conversation  = $request->input('conversation', []);
            $userMessage   = $request->input('message');

            $messages = $this->contextBuilder->buildMessages(
                $systemPrompt,
                $pageContext,
                $conversation,
                $userMessage,
            );

            $reply = $this->llm->chat($messages);

            return response()->json(['reply' => $reply]);
        } catch (Throwable $e) {
            return response()->json([
                'reply' => [
                    'message'          => 'Sorry, I encountered an error. Please try again.',
                    'blocks'           => [['type' => 'error', 'content' => $e->getMessage()]],
                    'suggestedActions' => [],
                ],
            ], 500);
        }
    }

    public function config(): JsonResponse
    {
        return response()->json([
            'model'  => config('hayhayai.llm.model'),
            'prefix' => config('hayhayai.prefix'),
        ]);
    }
}
