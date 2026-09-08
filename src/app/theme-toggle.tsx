import { useEffect, useRef, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils.ts'
import { useTheme, type Theme } from './use-theme.ts'

const OPTIONS: { value: Theme; label: string; short: string; Icon: typeof Sun }[] = [
  { value: 'system', label: 'Seguir o sistema', short: 'sistema', Icon: Monitor },
  { value: 'light', label: 'Tema claro', short: 'claro', Icon: Sun },
  { value: 'dark', label: 'Tema escuro', short: 'escuro', Icon: Moon }
]

/**
 * Três estados em vez de um botão que alterna: sem a opção "sistema" não há
 * caminho de volta depois que a pessoa escolhe uma vez.
 *
 * Dropdown em vez dos três lado a lado para o cabeçalho não gastar largura com
 * uma escolha que raramente muda. `menuitemradio` porque continua sendo escolha
 * única — só que revelada sob demanda.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const current = OPTIONS.find(option => option.value === theme) ?? OPTIONS[0]

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Tema: ${current.short}`}
        title={current.label}
        className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      >
        <current.Icon aria-hidden className="size-3.5" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Tema"
          className="absolute right-0 top-full z-50 mt-1.5 min-w-44 rounded-lg border border-border bg-background p-1 shadow-md"
        >
          {OPTIONS.map(({ value, label, Icon }) => {
            const selected = theme === value
            return (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  setTheme(value)
                  setOpen(false)
                  buttonRef.current?.focus()
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors',
                  selected ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'
                )}
              >
                <Icon aria-hidden className="size-3.5 shrink-0" />
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
