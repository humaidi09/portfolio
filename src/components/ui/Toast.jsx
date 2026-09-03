import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

const CONFIG = {
  success: { Icon: CheckCircle2, accent: 'text-neon-cyan', bar: 'bg-neon-cyan' },
  error: { Icon: AlertCircle, accent: 'text-red-400', bar: 'bg-red-400' },
  info: { Icon: Info, accent: 'text-neon-violet', bar: 'bg-neon-violet' },
}

/**
 * Fixed, screen-reader-announced stack of toasts.
 * Purely presentational — state + timers live in ToastContext.
 */
export default function ToastViewport({ toasts, onDismiss }) {
  const reduce = useReducedMotion()

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex flex-col items-center gap-3 px-4 sm:inset-x-auto sm:right-6 sm:top-6 sm:items-end sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const { Icon, accent, bar } = CONFIG[t.type] ?? CONFIG.info
          return (
            <motion.div
              key={t.id}
              layout
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: 24, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              role="status"
              className="glass-strong pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl p-4 shadow-xl shadow-black/30"
            >
              <span className={`absolute inset-y-0 left-0 w-1 ${bar}`} />
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${accent}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{t.title}</p>
                {t.message && (
                  <p className="mt-0.5 text-sm leading-snug text-muted">{t.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded-md p-1 text-muted transition-colors hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
