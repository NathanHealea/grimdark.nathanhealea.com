'use client'

import { ListBulletIcon, NumberedListIcon } from '@heroicons/react/24/outline'
import { useRef, useState, type TextareaHTMLAttributes } from 'react'

type MarkdownEditorProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> & {
  defaultValue?: string
  error?: string
}

export default function MarkdownEditor({ defaultValue = '', error, className, ...textareaProps }: MarkdownEditorProps) {
  const [value, setValue] = useState(defaultValue)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function insertMarkdown(type: 'bold' | 'italic' | 'bullet' | 'numbered') {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.slice(start, end)

    let newText: string
    let cursorOffset: number

    switch (type) {
      case 'bold':
        newText = `**${selected || 'bold text'}**`
        cursorOffset = selected ? newText.length : 2
        break
      case 'italic':
        newText = `*${selected || 'italic text'}*`
        cursorOffset = selected ? newText.length : 1
        break
      case 'bullet': {
        const prefix = start > 0 && value[start - 1] !== '\n' ? '\n' : ''
        newText = `${prefix}- ${selected || 'list item'}`
        cursorOffset = newText.length
        break
      }
      case 'numbered': {
        const prefix = start > 0 && value[start - 1] !== '\n' ? '\n' : ''
        newText = `${prefix}1. ${selected || 'list item'}`
        cursorOffset = newText.length
        break
      }
    }

    const updated = value.slice(0, start) + newText + value.slice(end)
    setValue(updated)

    requestAnimationFrame(() => {
      textarea.focus()
      const pos = start + cursorOffset
      textarea.setSelectionRange(pos, pos)
    })
  }

  return (
    <div className={className}>
      <div className="join">
        <button type="button" className="btn join-item font-bold" onClick={() => insertMarkdown('bold')} title="Bold">
          B
        </button>
        <button type="button" className="btn join-item italic" onClick={() => insertMarkdown('italic')} title="Italic">
          I
        </button>
        <button type="button" className="btn join-item" onClick={() => insertMarkdown('bullet')} title="Bullet list">
          <ListBulletIcon className="size-6" />
        </button>
        <button
          type="button"
          className="btn join-item"
          onClick={() => insertMarkdown('numbered')}
          title="Numbered list"
        >
          <NumberedListIcon className="size-6" />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        {...textareaProps}
        className={`textarea textarea-bordered w-full ${error ? 'textarea-error' : ''}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <p className="mt-1 text-xs text-base-content/50">
        Supports <strong>**bold**</strong>, <em>*italic*</em>, bullet lists, and numbered lists.
      </p>
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}
