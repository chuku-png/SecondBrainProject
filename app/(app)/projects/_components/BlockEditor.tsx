'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'

export interface Block {
  id: string
  type: 'paragraph' | 'h1' | 'h2' | 'bullet' | 'numbered'
  content: string
}

function genId() {
  return Math.random().toString(36).slice(2, 9)
}

const PLACEHOLDER: Record<Block['type'], string> = {
  paragraph: 'Escribí algo...',
  h1: 'Encabezado 1',
  h2: 'Encabezado 2',
  bullet: 'Elemento de lista',
  numbered: 'Elemento numerado',
}

// ─── BlockRow ─────────────────────────────────────────────────────────────────

interface BlockRowProps {
  block: Block
  index: number
  onInput: (val: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

const BlockRow = forwardRef<HTMLTextAreaElement, BlockRowProps>(
  ({ block, index, onInput, onKeyDown }, ref) => {
    const innerRef = useRef<HTMLTextAreaElement>(null)
    useImperativeHandle(ref, () => innerRef.current!)

    useEffect(() => {
      const el = innerRef.current
      if (!el) return
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
    }, [block.content])

    const textClass = [
      'w-full bg-transparent border-none outline-none resize-none leading-relaxed',
      'placeholder:text-brand-border/60 font-mono',
      block.type === 'h1' ? 'text-2xl font-bold text-brand-text' :
      block.type === 'h2' ? 'text-lg font-bold text-brand-text' :
      'text-sm text-brand-text',
    ].join(' ')

    const prefix =
      block.type === 'bullet'   ? '•' :
      block.type === 'numbered' ? `${index + 1}.` :
      null

    return (
      <div className="flex items-start gap-2 px-1 py-0.5 rounded-lg hover:bg-gray-50 transition-colors group">
        {prefix && (
          <span className="text-brand-muted font-mono text-sm flex-shrink-0 mt-[3px] w-5 text-center select-none">
            {prefix}
          </span>
        )}
        {!prefix && (block.type === 'h1' || block.type === 'h2') && (
          <span className="w-5 flex-shrink-0" />
        )}
        <textarea
          ref={innerRef}
          value={block.content}
          onChange={e => onInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={PLACEHOLDER[block.type]}
          rows={1}
          className={textClass}
          style={{ overflow: 'hidden' }}
          dir="ltr"
        />
      </div>
    )
  }
)
BlockRow.displayName = 'BlockRow'

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function Toolbar({ onAdd }: { onAdd: (type: Block['type']) => void }) {
  const types: { type: Block['type']; label: string }[] = [
    { type: 'paragraph', label: 'Texto' },
    { type: 'h1',        label: 'H1' },
    { type: 'h2',        label: 'H2' },
    { type: 'bullet',    label: '• Lista' },
    { type: 'numbered',  label: '1. Numerado' },
  ]
  return (
    <div className="flex gap-1 flex-wrap mb-4 pb-3 border-b border-gray-100">
      {types.map(t => (
        <button
          key={t.type}
          type="button"
          onClick={() => onAdd(t.type)}
          className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold text-brand-muted hover:text-brand-text hover:bg-gray-100 transition-colors"
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ─── BlockEditor ──────────────────────────────────────────────────────────────

export default function BlockEditor({
  initialBlocks,
  onChange,
}: {
  initialBlocks: Block[]
  onChange: (blocks: Block[]) => void
}) {
  const [blocks, setBlocks] = useState<Block[]>(() =>
    initialBlocks.length > 0
      ? initialBlocks
      : [{ id: genId(), type: 'paragraph', content: '' }]
  )
  const refs = useRef<Map<string, HTMLTextAreaElement>>(new Map())

  function setRef(id: string, el: HTMLTextAreaElement | null) {
    if (el) refs.current.set(id, el)
    else refs.current.delete(id)
  }

  function focusBlock(id: string, toEnd = true) {
    setTimeout(() => {
      const el = refs.current.get(id)
      if (!el) return
      el.focus()
      if (toEnd) el.setSelectionRange(el.value.length, el.value.length)
    }, 0)
  }

  function commit(newBlocks: Block[]) {
    setBlocks(newBlocks)
    onChange(newBlocks)
  }

  function handleInput(id: string, value: string) {
    // Markdown shortcuts (triggered when last char is space)
    if (value.endsWith(' ') && value.length <= 4) {
      const trimmed = value.trimEnd()
      if (trimmed === '-' || trimmed === '*') {
        commit(blocks.map(b => b.id === id ? { ...b, type: 'bullet', content: '' } : b))
        return
      }
      if (trimmed === '1.') {
        commit(blocks.map(b => b.id === id ? { ...b, type: 'numbered', content: '' } : b))
        return
      }
      if (trimmed === '#') {
        commit(blocks.map(b => b.id === id ? { ...b, type: 'h1', content: '' } : b))
        return
      }
      if (trimmed === '##') {
        commit(blocks.map(b => b.id === id ? { ...b, type: 'h2', content: '' } : b))
        return
      }
    }
    commit(blocks.map(b => b.id === id ? { ...b, content: value } : b))
  }

  function handleKeyDown(id: string, e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const idx = blocks.findIndex(b => b.id === id)
    const block = blocks[idx]

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const newId = genId()
      const continueType: Block['type'] =
        block.type === 'bullet' ? 'bullet' :
        block.type === 'numbered' ? 'numbered' :
        'paragraph'
      const newBlock: Block = { id: newId, type: continueType, content: '' }
      commit([...blocks.slice(0, idx + 1), newBlock, ...blocks.slice(idx + 1)])
      focusBlock(newId)
    }

    if (e.key === 'Backspace' && block.content === '') {
      if (block.type !== 'paragraph') {
        e.preventDefault()
        commit(blocks.map(b => b.id === id ? { ...b, type: 'paragraph' } : b))
        return
      }
      if (blocks.length > 1) {
        e.preventDefault()
        const newBlocks = blocks.filter(b => b.id !== id)
        commit(newBlocks)
        const prev = blocks[idx - 1] ?? blocks[idx + 1]
        if (prev) focusBlock(prev.id)
      }
    }

    if (e.key === 'ArrowUp' && idx > 0 && e.currentTarget.selectionStart === 0) {
      e.preventDefault()
      focusBlock(blocks[idx - 1].id)
    }

    if (e.key === 'ArrowDown' && idx < blocks.length - 1) {
      const el = e.currentTarget
      if (el.selectionStart === el.value.length) {
        e.preventDefault()
        focusBlock(blocks[idx + 1].id, false)
      }
    }
  }

  function addBlock(type: Block['type']) {
    const newId = genId()
    const newBlock: Block = { id: newId, type, content: '' }
    commit([...blocks, newBlock])
    focusBlock(newId)
  }

  return (
    <div dir="ltr">
      <Toolbar onAdd={addBlock} />
      <div className="flex flex-col gap-0.5">
        {blocks.map((block, idx) => (
          <BlockRow
            key={block.id}
            ref={el => setRef(block.id, el)}
            block={block}
            index={idx}
            onInput={val => handleInput(block.id, val)}
            onKeyDown={e => handleKeyDown(block.id, e)}
          />
        ))}
        {/* Click en área vacía para añadir bloque */}
        <div
          className="h-16 cursor-text"
          onClick={() => {
            const last = blocks[blocks.length - 1]
            if (last.content !== '') {
              addBlock('paragraph')
            } else {
              focusBlock(last.id)
            }
          }}
        />
      </div>
    </div>
  )
}
