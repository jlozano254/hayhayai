import type { HHNode, HHAnnotatedAction, HHAnnotatedInput } from '../types/index.js'

const RISK_VALUES = ['low', 'medium', 'high'] as const
type Risk = (typeof RISK_VALUES)[number]

function parseRisk(value: string | null): Risk {
  if (value && (RISK_VALUES as readonly string[]).includes(value)) {
    return value as Risk
  }

  return 'low'
}

function extractActions(el: Element): HHAnnotatedAction[] {
  const actions: HHAnnotatedAction[] = []
  const actionName = el.getAttribute('data-hh-action')

  if (actionName) {
    actions.push({
      name: actionName,
      target: el.getAttribute('data-hh-target'),
      risk: parseRisk(el.getAttribute('data-hh-risk')),
      confirm: el.getAttribute('data-hh-confirm') === 'required',
    })
  }

  return actions
}

function extractInputs(el: Element): HHAnnotatedInput[] {
  const inputName = el.getAttribute('data-hh-input')

  if (!inputName) {
    return []
  }

  return [
    {
      name: inputName,
      inputType: el.getAttribute('data-hh-input-type') ?? 'text',
      value: (el as HTMLInputElement).value ?? '',
    },
  ]
}

function extractMeta(el: Element): Record<string, string> {
  const meta: Record<string, string> = {}
  const reserved = new Set([
    'data-hh-component',
    'data-hh-id',
    'data-hh-role',
    'data-hh-action',
    'data-hh-target',
    'data-hh-risk',
    'data-hh-confirm',
    'data-hh-field',
    'data-hh-list',
    'data-hh-item',
    'data-hh-input',
    'data-hh-input-type',
  ])

  for (const attr of Array.from(el.attributes)) {
    if (attr.name.startsWith('data-hh-') && !reserved.has(attr.name)) {
      const key = attr.name.replace('data-hh-', '')
      meta[key] = attr.value
    }
  }

  return meta
}

function parseNode(el: Element): HHNode {
  const fields: Record<string, string> = {}
  const actions: HHAnnotatedAction[] = [...extractActions(el)]
  const inputs: HHAnnotatedInput[] = [...extractInputs(el)]
  const children: HHNode[] = []

  for (const child of Array.from(el.children)) {
    const fieldName = child.getAttribute('data-hh-field')

    if (fieldName) {
      fields[fieldName] = (child as HTMLElement).innerText?.trim() ?? child.textContent?.trim() ?? ''
    }

    const childAction = extractActions(child)
    if (childAction.length > 0) {
      actions.push(...childAction)
    }

    const childInput = extractInputs(child)
    if (childInput.length > 0) {
      inputs.push(...childInput)
    }

    if (child.hasAttribute('data-hh-component')) {
      children.push(parseNode(child))
    }
  }

  return {
    type: el.getAttribute('data-hh-component') ?? 'unknown',
    id: el.getAttribute('data-hh-id'),
    role: el.getAttribute('data-hh-role'),
    meta: extractMeta(el),
    fields,
    actions,
    inputs,
    children,
  }
}

/**
 * Scan the DOM for annotated elements and return an array of HHNodes.
 * Optionally pass a root element to scope the scan (defaults to document.body).
 */
export function scan(root: Element | Document = document): HHNode[] {
  const rootEl = root instanceof Document ? root.body : root
  const nodes: HHNode[] = []
  const topLevelComponents = rootEl.querySelectorAll('[data-hh-component]')

  const seen = new Set<Element>()

  for (const el of Array.from(topLevelComponents)) {
    if (el.closest('[data-hh-component]:not([data-hh-component="' + el.getAttribute('data-hh-component') + '"])')) {
      continue
    }

    if (!seen.has(el)) {
      seen.add(el)
      nodes.push(parseNode(el))
    }
  }

  return nodes
}
