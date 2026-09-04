import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, MapPin, X } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import Reveal from './ui/Reveal'
import { api } from '../lib/api'
import { useCollection } from '../hooks/useCollection'

// Events come entirely from the DB (managed in /admin). No static fallback —
// the section hides itself until at least one event has been added.
export default function Events() {
  const { items: events } = useCollection(api.listEvents, [])
  const [active, setActive] = useState(null) // event whose photo is open in the lightbox

  if (!events.length) return null

  return (
    <section id="events" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 md:py-20">
      <SectionHeading
        index="05"
        eyebrow="// events"
        title="Events & moments"
        kicker="Contests, workshops, and the community events I've been part of — a few snapshots from along the way."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((ev, i) => (
          <Reveal key={ev.id || ev.title} delay={(i % 3) * 0.06}>
            <EventCard event={ev} onOpen={() => ev.image && setActive(ev)} />
          </Reveal>
        ))}
      </div>

      <Lightbox event={active} onClose={() => setActive(null)} />
    </section>
  )
}

function EventCard({ event, onOpen }) {
  const hasImage = Boolean(event.image)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl glass transition-colors hover:border-hair-strong">
      {/* Photo (or a graph-paper placeholder when none is set) */}
      {hasImage ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`View photo from ${event.title}`}
          className="relative aspect-[4/3] overflow-hidden"
        >
          <img
            src={event.image}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
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

/** Full-size photo viewer, opened by tapping an event image. */
function Lightbox({ event, onClose }) {
  useEffect(() => {
    if (!event) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [event, onClose])

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.figure
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl glass-strong"
          >
            <img src={event.image} alt={event.title} className="max-h-[74vh] w-full object-contain bg-black/40" />
            <figcaption className="flex items-center justify-between gap-4 border-t border-hair p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{event.title}</p>
                {(event.date || event.location) && (
                  <p className="truncate font-mono text-xs text-muted">
                    {[event.date, event.location].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-hair bg-fill text-muted transition-colors hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
