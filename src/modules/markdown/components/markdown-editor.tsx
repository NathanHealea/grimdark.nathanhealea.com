'use client'

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
        </button>
        <button
          type="button"
          className="btn join-item"
          onClick={() => insertMarkdown('numbered')}
          title="Numbered list"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.242 5.992h12m-12 6.003H20.24m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H5.24m-1.92 2.577a1.125 1.125 0 1 1 1.591 1.59l-1.83 1.83h2.16M2.99 15.745h1.125a1.125 1.125 0 0 1 0 2.25H3.74m0-.002h.375a1.125 1.125 0 0 1 0 2.25H2.99"
            />
          </svg>
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
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  )
}
