<?php

namespace HayHayAI\Laravel\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'message'                    => ['required', 'string', 'max:4000'],
            'pageContext'                 => ['required', 'array'],
            'pageContext.page'            => ['required', 'array'],
            'pageContext.page.url'        => ['required', 'string'],
            'pageContext.page.title'      => ['required', 'string'],
            'pageContext.components'      => ['required', 'array'],
            'conversation'               => ['sometimes', 'array'],
            'conversation.*.role'        => ['required_with:conversation', 'string', 'in:user,assistant'],
            'conversation.*.content'     => ['required_with:conversation', 'string'],
        ];
    }
}
