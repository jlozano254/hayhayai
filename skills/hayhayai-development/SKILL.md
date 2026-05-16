---
name: hayhayai-development
description: "Integrate and develop with hayhayai — the semantic annotation + AI chat library. Activate when annotating pages with data-hh-* attributes, registering actions, configuring the Vue plugin, wiring the Laravel backend, customising blocks, or debugging chat flows. Also activate when the user mentions hayhayai, HayHay, AI chat panel, semantic annotations, or quick prompts."
license: MIT
metadata:
  author: jlozano254
---

# hayhayai Development

## What is hayhayai?

hayhayai is a **framework-agnostic semantic annotation + AI chat library**. It adds an AI assistant panel to any web UI without rewriting your components.

- Annotate your existing HTML with `data-hh-*` attributes
- The AI receives a semantic tree of the page with every message
- Quick-prompt buttons execute actions directly (no AI round-trip)
- Chat history persists across SPA navigation and page refreshes

## Packages

| Package | Registry | Purpose |
|---|---|---|
| `@jlozano254/hayhayai-core` | npm | Runtime, types, scanner, transport |
| `@jlozano254/hayhayai-vue` | npm | Vue 3 plugin, composable, chat UI |

## When to Activate

- Annotating pages with `data-hh-*` attributes
- Registering or debugging actions with `registerAction` / `executeAction`
- Configuring the `createHayHayPlugin()` in a Vue app
- Adding or customising block components (`market-card`, etc.)
- Wiring the Laravel `/hayhay/chat` endpoint
- Debugging chat flows, persistence, or quick prompts
- Adding follow-up messages or suggested actions after action results

---

## Vue Setup

```js
// app.js / main.ts
import { createHayHayPlugin, HayHayLauncher, HayHayChatPanel } from '@jlozano254/hayhayai-vue'

app.use(createHayHayPlugin({
    endpoint: '/hayhay/chat',
    persist: true,                  // localStorage persistence (default: true)
    quickPrompts: [
        {
            label: 'Search markets near me',
            icon: '📍',
            action: { name: 'search-nearby-markets', params: {} },
        },
        {
            label: 'I want to sell',
            icon: '🛍️',
            text: 'How do I start selling?',  // sends to AI
        },
    ],
    blockComponents: {
        'market-card': MarketCardComponent,   // custom Vue component for block type
    },
}))
```

Mount the launcher and panel once in your root layout:

```html
<HayHayLauncher />
<HayHayChatPanel />
```

---

## Composable: `useHayHay()`

```js
const {
    isOpen,          // Ref<boolean>  — panel visibility
    isLoading,       // Ref<boolean>  — waiting for action or AI
    messages,        // Ref<ChatMessage[]> — full conversation history
    open, close, toggle,
    send,            // (message: string) => Promise<AssistantReply | null>
    addUserMessage,  // (content: string) => void  — push user bubble without AI
    registerAction,  // (name, handler, options?) => void
    executeAction,   // (name, params?) => Promise<unknown>
    clearSession,    // () => void  — clears messages + localStorage
} = useHayHay()
```

---

## Registering Actions

Actions bypass the AI and run code directly. Register them in any component or setup function:

```js
const { registerAction } = useHayHay()

registerAction(
    'search-nearby-markets',
    async ({ lat, lng, radius_km }) => {
        const response = await fetch(`/api/nearby-markets?lat=${lat}&lng=${lng}`)
        const data = await response.json()

        return {
            hhBlocks: [
                {
                    type: 'item-list',
                    component: 'market-card',    // maps to blockComponents config
                    title: `Found ${data.items.length} markets near you`,
                    items: data.items,
                },
                {
                    type: 'text',
                    content: '💡 Tell me what you\'re looking for and I\'ll help you find it!',
                },
            ],
        }
    },
    { risk: 'low', description: 'Search for nearby markets' },
)
```

### Action return values

| Return | Effect |
|---|---|
| `{ hhBlocks: [...] }` | Renders blocks as an assistant message |
| `{ hhBlocks: [...], suggestedActions: [...] }` | Renders blocks + action buttons below |
| `{ silent: true }` | Suppresses any assistant message |
| _(nothing / undefined)_ | Shows generic "Action completed" status block |

### Requesting geolocation inside an action

```js
const pos = await new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
)
const { latitude, longitude } = pos.coords
```

---

## Semantic Annotations (`data-hh-*`)

Add these attributes to your existing HTML — hayhayai scans the DOM and builds a semantic tree sent to the AI with every message.

| Attribute | Purpose |
|---|---|
| `data-hh-component="name"` | Names a UI region (e.g. `"market-card"`) |
| `data-hh-id="value"` | Unique identifier for the element |
| `data-hh-role="value"` | Semantic role (e.g. `"market-listing"`) |
| `data-hh-field="name"` | Labels a field within a component |
| `data-hh-action="name"` | Marks an actionable element |
| `data-hh-list="name"` | Marks a list container |

```html
<div data-hh-component="market-card"
     data-hh-id="market-42"
     data-hh-role="market-listing">
    <h2 data-hh-field="name">Mercadito La Florida</h2>
    <p  data-hh-field="distance">1.3 km away</p>
</div>
```

---

## Block Types

The chat panel renders assistant replies as typed blocks:

| Type | Component | Key props |
|---|---|---|
| `text` | `TextBlock` | `content` |
| `list` / `parsed-list` | `ListBlock` | `items[]` |
| `status` | `StatusBlock` | `title`, `content` |
| `confirmation` | `ConfirmationBlock` | `message`, `action` |
| `error` | `ErrorBlock` | `content` |
| `item-list` | `ItemListBlock` | `component`, `title`, `items[]` |

Custom block components are registered in `blockComponents` config and rendered via `item-list` with a matching `component` key.

---

## Chat Persistence

localStorage persistence is enabled by default. Customise with:

```js
createHayHayPlugin({
    persist: {
        key: 'my-app-chat',     // default: 'hayhayai-messages'
        maxMessages: 60,        // default: 60
    },
})
```

Set `persist: false` to disable. `clearSession()` wipes both memory and localStorage.

---

## Laravel Backend

The `POST /hayhay/chat` endpoint receives:

```json
{
    "message": "Find markets near me",
    "pageContext": { /* semantic tree from DOM scan */ },
    "conversation": [
        { "role": "user", "content": "..." },
        { "role": "assistant", "content": "..." }
    ]
}
```

It returns:

```json
{
    "reply": {
        "message": "Here are some markets nearby...",
        "blocks": [
            { "type": "text", "content": "..." }
        ],
        "suggestedActions": []
    }
}
```

---

## Quick-Prompts Behaviour

- **Empty state**: large centered buttons with icon + label
- **After first message**: compact pill bar persists above the input footer
- **Action-based prompts**: clicking adds a user message bubble first, then executes the action
- **Text-based prompts**: prefills the textarea and submits as a regular AI message

---

## Common Patterns

### Push a user bubble without sending to AI (e.g. inside actions)

```js
const { addUserMessage, executeAction } = useHayHay()

addUserMessage('Search markets near me')
await executeAction('search-nearby-markets')
```

### Navigate and stay silent

```js
registerAction('go-to-markets', async () => {
    router.visit('/markets')
    return { silent: true }
})
```

### Show a follow-up tip after results

Return a `text` block alongside your main block:

```js
return {
    hhBlocks: [
        { type: 'item-list', component: 'market-card', title: '...', items },
        { type: 'text', content: '💡 Tell me what you\'re looking for!' },
    ],
}
```
