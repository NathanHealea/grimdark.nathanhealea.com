'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Avatar from '@/components/avatar'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB

type ImageUploadProps = {
  currentImageUrl: string | null
  displayName: string
  onFileSelect: (file: File | null) => void
  error?: string
}

export default function ImageUpload({ currentImageUrl, displayName, onFileSelect, error }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const validateAndSelect = useCallback(
    (file: File) => {
      setValidationError(null)

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setValidationError('Only JPEG, PNG, and WebP images are allowed.')
        return
      }

      if (file.size > MAX_SIZE_BYTES) {
        setValidationError('Image must be under 2 MB.')
        return
      }

      if (preview) URL.revokeObjectURL(preview)
      setPreview(URL.createObjectURL(file))
      onFileSelect(file)
    },
    [preview, onFileSelect],
  )

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) validateAndSelect(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) validateAndSelect(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
  }

  function handleRemove() {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setValidationError(null)
    onFileSelect(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const displayError = validationError ?? error

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`relative cursor-pointer rounded-full transition-all ${dragOver ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Avatar src={preview ?? currentImageUrl} displayName={displayName} size="lg" />
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity hover:opacity-100">
          <span className="text-xs font-medium text-white">Change</span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />

      {preview && (
        <button type="button" className="btn btn-error btn-outline btn-xs" onClick={handleRemove}>
          Remove new photo
        </button>
      )}

      {displayError && <p className="text-destructive text-sm">{displayError}</p>}
    </div>
  )
}
