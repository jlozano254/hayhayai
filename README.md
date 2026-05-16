# hayhayai

**Turn your existing interface into an AI-usable system.**

hayhayai adds a semantic annotation layer on top of existing web apps so an AI chat interface can understand page components and safely trigger approved actions — without brittle DOM scraping.

## Packages

| Package | Registry | Description |
|---|---|---|
| [`@jlozano254/hayhayai-core`](./packages/core) | npm | Framework-agnostic runtime: DOM scanner, action registry, transport |
| [`@jlozano254/hayhayai-vue`](./packages/vue) | npm | Vue 3 plugin, chat panel, launcher, composables |
| [`hayhayai/laravel`](./packages/laravel) | Packagist | Laravel service provider, chat endpoint, LLM orchestration |

## Quick start (Vue + Laravel)

### 1. Install the npm packages

```bash
npm install @jlozano254/hayhayai-core @jlozano254/hayhayai-vue
```

### 2. Install the Laravel package

```bash
composer require hayhayai/laravel
php artisan vendor:publish --tag=hayhayai
```

Add your OpenAI key to `.env`:

```env
HAYHAYAI_OPENAI_API_KEY=sk-...
```

### 3. Register the Vue plugin

```ts
// resources/js/app.js
import { createHayHayPlugin } from '@jlozano254/hayhayai-vue'

createApp(App)
  .use(createHayHayPlugin({ endpoint: '/hayhay/chat' }))
  .mount('#app')
```

### 4. Mount the UI

```vue
<HayHayLauncher />
<HayHayChatPanel />
```

### 5. Annotate your UI

```html
<article
  data-hh-component="product-card"
  data-hh-id="book-1"
  data-hh-role="product"
  data-hh-stock="in-stock"
>
  <h3 data-hh-field="title">Atomic Habits</h3>
  <button data-hh-action="add-to-cart" data-hh-target="book-1" data-hh-risk="low">
    Add to cart
  </button>
</article>
```

### 6. Register frontend actions

```ts
const { registerAction } = useHayHay()

registerAction('add-to-cart', async ({ target }) => {
  cartStore.addItem(target)
})
```

## Annotation spec (`data-hh-*`)

| Attribute | Description |
|---|---|
| `data-hh-component` | Marks a component root (required for detection) |
| `data-hh-id` | Unique identifier for the component |
| `data-hh-role` | Semantic role (e.g. `product`, `form`, `market`) |
| `data-hh-field` | A named data field within a component |
| `data-hh-action` | Registers an executable action on an element |
| `data-hh-target` | The target ID for the action |
| `data-hh-risk` | `low` / `medium` / `high` |
| `data-hh-confirm` | `required` — prompts user confirmation before executing |
| `data-hh-input` | Marks an input element by name |
| `data-hh-input-type` | Input type hint (e.g. `email`, `text`) |

## Development

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Copilot Skill

Install the **hayhayai-development** skill to get AI guidance on annotations, actions, blocks, and persistence directly in your editor:

```json
// skills-lock.json
{
    "version": 1,
    "skills": {
        "hayhayai-development": {
            "source": "jlozano254/hayhayai",
            "sourceType": "github"
        }
    }
}
```

Or if you use [Laravel Boost](https://laravelboost.com):

```bash
boost skill add jlozano254/hayhayai
```

The skill activates automatically whenever you work with `data-hh-*` annotations, `useHayHay()`, action registration, or block components.

## License

MIT
