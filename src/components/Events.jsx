import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, ChevronLeft, ChevronRight, Images, MapPin, X } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import Reveal from './ui/Reveal'
import { api } from '../lib/api'
import { useCollection } from '../hooks/useCollection'

// Events come entirely from the DB (managed in /admin). No static fallback —
// the section hides itself until at least one event has been added. Each event
// can carry several photos, browsed in a lightbox.
export default function Events() {
  const { items: events } = useCollection(api.listEvents, [])
  const [active, setActive] = useState(null) // { event, index } for the open photo

  if (!events.length) return null

  return (
    <section id="events" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading
        index="05"
        eyebrow="// events"
        title="Events & moments"
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((ev, i) => (
          <Reveal key={ev.id || ev.title} delay={(i % 3) * 0.06}>
            <EventCard event={ev} onOpen={() => imagesOf(ev).length && setActive({ event: ev, index: 0 })} />
          </Reveal>
        ))}
      </div>

      <Lightbox
        active={active}
        onClose={() => setActive(null)}
        onNav={(d) =>
          setActive((a) => {
            if (!a) return a
            const imgs = imagesOf(a.event)
            return { ...a, index: (a.index + d + imgs.length) % imgs.length }
          })
        }
      />
    </section>
  )
}

// Back-compat: older records used a single `image` string; new ones use `images`.
function imagesOf(event) {
  if (Array.isArray(event.images)) return event.images.filter(Boolean)
  return event.image ? [event.image] : []
}

function EventCard({ event, onOpen }) {
  const images = imagesOf(event)
  const cover = images[0]

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl glass transition-colors hover:border-hair-strong">
      {/* Cover photo (or a graph-paper placeholder when none is set) */}
      {cover ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`View photos from ${event.title}`}
          className="relative aspect-[4/3] overflow-hidden"
        >
          <img
            src={cover}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {images.length > 1 && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[11px] font-medium text-white backdrop-blur">
              <Images className="h-3 w-3" />
              {images.length}
            </span>
          )}
        </button>
      ) : (
        <div className="relative grid aspect-[4/3] place-items-center bg-surface">
          <div aria-hidden="true" className="absolute inset-0 bg-grid-lines opacity-40" />
          <CalendarDays className="relative h-8 w-8 text-neonCyan/70" />
        </div>
      )}

      {/* Text */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-ink">{event.title}</h3>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
          {event.date && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3 w-3 text-neonCyan" />
              {event.date}
            </span>
          )}
          {event.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-neonPurple" />
              {event.location}
            </span>
          )}
        </div>
        {event.description && (
          <p className="mt-3 text-sm leading-relaxed text-muted">{event.description}</p>
        )}
      </div>
    </article>
  )
}

/** Full-size photo viewer with prev/next across an event's photos. */
function Lightbox({ active, onClose, onNav }) {
  const open = Boolean(active)
  const images = active ? imagesOf(active.event) : []
  const src = open ? images[active.index] : null

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onNav(1)
      else if (e.key === 'ArrowLeft') onNav(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, onNav])

  const navBtn =
    'grid h-11 w-11 place-items-center rounded-full border border-hair bg-void/60 text-ink backdrop-blur transition-colors hover:border-neonCyan/40 hover:text-neonCyan'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

          {images.length > 1 && (
            <>
              <button type="button" onClick={() => onNav(-1)} aria-label="Previous photo" className={`absolute left-3 z-10 sm:left-6 ${navBtn}`}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => onNav(1)} aria-label="Next photo" className={`absolute right-3 z-10 sm:right-6 ${navBtn}`}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <motion.figure
            key={active.index}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-[5] flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl glass-strong"
          >
            <img src={src} alt={active.event.title} className="max-h-[74vh] w-full object-contain bg-black/40" />
            <figcaption className="flex items-center justify-between gap-4 border-t border-hair p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{active.event.title}</p>
                {(active.event.date || active.event.location) && (
                  <p className="truncate font-mono text-xs text-muted">
                    {[active.event.date, active.event.location].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {images.length > 1 && (
                  <span className="font-mono text-xs text-muted tabular-nums">
                    {active.index + 1} / {images.length}
                  </span>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-hair bg-fill text-muted transition-colors hover:text-ink"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
