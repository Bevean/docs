import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils.ts'
import { useTheme, type Theme } from './use-theme.ts'

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'system', label: 'Seguir o sistema', Icon: Monitor },
  { value: 'light', label: 'Tema claro', Icon: Sun },
  { value: 'dark', label: 'Tema escuro', Icon: Moon }
]

/**
 * Três estados em vez de um botão que alterna: sem a opção "sistema" não há
 * caminho de volta depois que a pessoa escolhe uma vez.
 *
 * `radiogroup` porque é exatamente isso — escolha única entre opções visíveis,
 * navegável por seta.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="flex items-center gap-0.5 rounded-lg border border-border p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            tabIndex={selected ? 0 : -1}
            onClick={() => setTheme(value)}
            className={cn(
              'flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors',
              selected ? 'bg-muted text-foreground' : 'hover:text-foreground'
            )}
          >
            <Icon aria-hidden className="size-3.5" />
          </button>
        )
      })}
    </div>
  )
}
