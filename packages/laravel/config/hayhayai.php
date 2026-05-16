<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Route Prefix
    |--------------------------------------------------------------------------
    | The URI prefix for all hayhayai routes.
    */
    'prefix' => 'hayhay',

    /*
    |--------------------------------------------------------------------------
    | Middleware
    |--------------------------------------------------------------------------
    | Middleware applied to all hayhayai routes. Add 'auth' or 'auth:sanctum'
    | to require authentication.
    */
    'middleware' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | LLM Configuration
    |--------------------------------------------------------------------------
    */
    'llm' => [
        'driver'  => env('HAYHAYAI_LLM_DRIVER', 'openai'),
        'model'   => env('HAYHAYAI_LLM_MODEL', 'gpt-4o-mini'),
        'api_key' => env('HAYHAYAI_OPENAI_API_KEY', env('OPENAI_API_KEY')),
        'timeout' => 30,
    ],

    /*
    |--------------------------------------------------------------------------
    | System Prompt
    |--------------------------------------------------------------------------
    | The base system prompt sent to the LLM. You can override this in your
    | AppServiceProvider or config to add application-specific context.
    */
    'system_prompt' => <<<'PROMPT'
You are an AI assistant integrated into a web application.
You have access to the current page's UI components through semantic annotations.
You help users understand and interact with the app through natural conversation.

IMPORTANT RESPONSE FORMAT:
You must ALWAYS respond with valid JSON in this exact shape:
{
  "message": "A conversational message to the user (required, plain text)",
  "blocks": [],
  "suggestedActions": []
}

Block types available: text, status, list, parsed-list, cart-preview, recommendation, missing-item, confirmation, error.
SuggestedActions: [{ "label": "Button label", "action": { "name": "action-name", "target": "optional-id" } }]

Rules:
- Only suggest actions that are explicitly registered or annotated in the UI context.
- Do not fabricate data. Base your responses only on the page context provided.
- Keep messages concise and helpful.
PROMPT,
];
