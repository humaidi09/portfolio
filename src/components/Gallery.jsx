import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import Reveal from './ui/Reveal'
import { api } from '../lib/api'
import { useCollection } from '../hooks/useCollection'

// A pure photo wall, managed in /admin. Everything comes from the DB — the
// section hides itself until at least one photo has been uploaded.
export default function Gallery() {
  const { items: photos } = useCollection(api.listGallery, [])
  const [active, setActive] = useState(-1) // index of the open photo, or -1

  if (!photos.length) return null

  return (
    <section id="gallery" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading
        index="07"
        eyebrow="// gallery"
        title="Gallery"
      />

      {/* Masonry-style columns so portrait and landscape shots both sit well. */}
      <div className="mt-12 gap-4 [column-fill:_balance] sm:columns-2 lg:columns-3">
        {photos.map((photo, i) => (
          <Reveal key={photo.id} delay={(i % 3) * 0.06}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={photo.caption ? `View: ${photo.caption}` : 'View photo'}
              className="group relative mb-4 block w-full overflow-hidden rounded-2xl glass transition-colors hover:border-hair-strong"
            >
              <img
                src={photo.image}
                alt={photo.caption || 'Gallery photo'}
                loading="lazy"
                className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              {photo.caption && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 line-clamp-2 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 pt-10 text-left text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {photo.caption}
                </span>
              )}
            </button>
          </Reveal>
        ))}
      </div>

      <Lightbox
        photos={photos}
        index={active}
        onClose={() => setActive(-1)}
        onNav={(d) => setActive((n) => (n + d + photos.length) % photos.length)}
      />
    </section>
  )
}

/** Caption in the lightbox: clamps a long caption to 3 lines with a see-more
    toggle. Short captions render plainly with no button. */
function Caption({ text }) {
  const [expanded, setExpanded] = useState(false)
  const long = text.length > 140

  return (
    <figcaption className="border-t border-hair p-4 text-center text-sm text-ink">
      <p className={!expanded && long ? 'line-clamp-3' : ''}>{text}</p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 font-mono text-xs font-medium text-neonCyan hover:underline"
        >
          {expanded ? 'See less' : 'See more'}
        </button>
      )}
    </figcaption>
  )
}

/** Full-size viewer with prev/next, keyboard nav, and body scroll lock. */
function Lightbox({ photos, index, onClose, onNav }) {
  const open = index >= 0
  const photo = open ? photos[index] : null

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
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-hair bg-void/60 text-muted backdrop-blur transition-colors hover:text-ink sm:right-6 sm:top-6"
          >
            <X className="h-5 w-5" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => onNav(-1)}
                aria-label="Previous photo"
                className={`absolute left-3 z-10 sm:left-6 ${navBtn}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => onNav(1)}
                aria-label="Next photo"
                className={`absolute right-3 z-10 sm:right-6 ${navBtn}`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <motion.figure
            key={photo.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-[5] flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl glass-strong"
          >
            <img src={photo.image} alt={photo.caption || 'Gallery photo'} className="max-h-[80vh] w-full object-contain bg-black/40" />
            {photo.caption && <Caption text={photo.caption} />}
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
