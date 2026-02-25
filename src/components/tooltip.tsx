'use client'

import { type ReactNode, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

type TooltipProps = {
  content: string
  children: ReactNode
}

export default function Tooltip({ content, children }: TooltipProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setCoords({
      top: rect.top,
      left: rect.left + rect.width / 2,
    })
  }, [])

  const showTooltip = useCallback(() => {
    updatePosition()
    setOpen(true)
  }, [updatePosition])

  const hide = useCallback(() => setOpen(false), [])

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) updatePosition()
      return !prev
    })
  }, [updatePosition])

  useEffect(() => {
    if (!open) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    function onPointerDown(e: PointerEvent) {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    function onScroll() {
      setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-describedby={open ? id : undefined}
        onClick={toggle}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') showTooltip()
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') hide()
        }}
        className="cursor-help underline decoration-dotted underline-offset-4 decoration-base-content/30"
      >
        {children}
      </button>
      {open &&
        mounted &&
        createPortal(
          <div
            id={id}
            role="tooltip"
            style={{ top: coords.top, left: coords.left }}
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full -mt-2 whitespace-nowrap rounded bg-neutral px-2.5 py-1.5 text-xs font-normal text-neutral-content shadow-lg"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral" />
          </div>,
          document.body,
        )}
    </>
  )
}
