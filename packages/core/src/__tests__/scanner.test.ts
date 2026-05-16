import { describe, it, expect } from 'vitest'
import { scan } from '../scanner/index.js'

function makeDOM(html: string): Element {
  const div = document.createElement('div')
  div.innerHTML = html
  return div
}

describe('scanner', () => {
  it('extracts a simple annotated component', () => {
    const root = makeDOM(`
      <article
        data-hh-component="product-card"
        data-hh-id="book-1"
        data-hh-role="product"
        data-hh-stock="in-stock"
        data-hh-price="18.99"
      >
        <h3 data-hh-field="title">Atomic Habits</h3>
        <p data-hh-field="author">James Clear</p>
        <button data-hh-action="add-to-cart" data-hh-target="book-1" data-hh-risk="low">Add</button>
      </article>
    `)

    const nodes = scan(root)

    expect(nodes).toHaveLength(1)
    const node = nodes[0]!
    expect(node.type).toBe('product-card')
    expect(node.id).toBe('book-1')
    expect(node.role).toBe('product')
    expect(node.meta['stock']).toBe('in-stock')
    expect(node.meta['price']).toBe('18.99')
    expect(node.fields['title']).toBe('Atomic Habits')
    expect(node.fields['author']).toBe('James Clear')
    expect(node.actions).toHaveLength(1)
    expect(node.actions[0]!.name).toBe('add-to-cart')
    expect(node.actions[0]!.target).toBe('book-1')
    expect(node.actions[0]!.risk).toBe('low')
    expect(node.actions[0]!.confirm).toBe(false)
  })

  it('extracts high-risk confirm action', () => {
    const root = makeDOM(`
      <div data-hh-component="checkout-form">
        <button data-hh-action="checkout" data-hh-risk="high" data-hh-confirm="required">Checkout</button>
      </div>
    `)

    const nodes = scan(root)
    const action = nodes[0]!.actions[0]!

    expect(action.name).toBe('checkout')
    expect(action.risk).toBe('high')
    expect(action.confirm).toBe(true)
  })

  it('extracts input annotations', () => {
    const root = makeDOM(`
      <form data-hh-component="registration-form">
        <input data-hh-input="email" data-hh-input-type="email" value="test@example.com" />
      </form>
    `)

    const nodes = scan(root)
    expect(nodes[0]!.inputs).toHaveLength(1)
    expect(nodes[0]!.inputs[0]!.name).toBe('email')
    expect(nodes[0]!.inputs[0]!.inputType).toBe('email')
  })

  it('returns empty array when no annotations present', () => {
    const root = makeDOM('<div><p>No annotations here</p></div>')
    expect(scan(root)).toHaveLength(0)
  })
})
