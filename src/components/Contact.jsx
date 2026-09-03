import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, AtSign, Check, Copy, Loader2, MessageSquare, Phone, RotateCcw, Send, User } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import Reveal from './ui/Reveal'
import { GithubIcon, LinkedinIcon, WhatsappIcon } from './ui/BrandIcons'
import { useToast } from '../context/ToastContext'
import { personalInfo } from '../data/portfolioData'
import { api } from '../lib/api'

// Social links rendered as icon buttons; `key` maps to a personalInfo field.
// Only verified handles. To add Facebook / Instagram / X, add the URL to
// personalInfo and a matching entry here (icons: FacebookIcon, etc.).
const SOCIALS = [
  { key: 'github', label: 'GitHub', Icon: GithubIcon },
  { key: 'linkedin', label: 'LinkedIn', Icon: LinkedinIcon },
  { key: 'whatsapp', label: 'WhatsApp', Icon: WhatsappIcon },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Pure validators → error string or ''. */
function validate({ name, email, message }) {
  return {
    name: !name.trim() ? 'Please tell me your name.' : name.trim().length < 2 ? 'That looks a little short.' : '',
    email: !email.trim() ? 'An email lets me reply.' : !EMAIL_RE.test(email.trim()) ? "That doesn't look like an email." : '',
    message: !message.trim() ? 'Say hello — what’s on your mind?' : message.trim().length < 10 ? 'A little more detail, please (10+ chars).' : '',
  }
}

function Field({ id, label, icon: Icon, error, touched, valid, children }) {
  const state = touched && error ? 'error' : touched && valid ? 'ok' : 'idle'
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-1.5 font-mono text-xs text-muted">
        <Icon className="h-3.5 w-3.5" />
        {label}
        {state === 'ok' && <Check className="ml-auto h-3.5 w-3.5 text-neonCyan" />}
      </label>
      {children}
      <div className="mt-1 min-h-[1.1rem]">
        {state === 'error' && (
          <motion.p
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-[11px] text-red-400"
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  )
}

export default function Contact() {
  const { toast } = useToast()
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [touched, setTouched] = useState({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState('') // sender's name once delivered; '' = form still showing
  const [submitError, setSubmitError] = useState('')
  const [copied, setCopied] = useState(false)

  const errors = useMemo(() => validate(values), [values])
  const isValid = !errors.name && !errors.email && !errors.message

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }))
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }))

  const inputCls = (k) =>
    `w-full rounded-xl border bg-fill px-4 py-3 text-sm text-ink placeholder:text-muted/60 outline-none transition-colors focus:bg-fill-2 ${
      touched[k] && errors[k]
        ? 'border-red-500/50 focus:border-red-500/70'
        : touched[k] && !errors[k]
          ? 'border-neonCyan/40 focus:border-neonCyan/60'
          : 'border-hair focus:border-hair-strong'
    }`

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(personalInfo.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({ type: 'success', title: 'Copied!', message: 'Email address is on your clipboard.' })
    } catch {
      toast({ type: 'error', title: 'Copy failed', message: personalInfo.email })
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, message: true })
    setSubmitError('')
    if (!isValid) {
      toast({ type: 'error', title: 'Almost there', message: 'Please fix the highlighted fields.' })
      return
    }

    const name = values.name.trim()

    // Store the message in the backend so it shows up in the admin inbox.
    setSending(true)
    try {
      await api.sendMessage({
        name,
        email: values.email.trim(),
        message: values.message.trim(),
      })
      setValues({ name: '', email: '', message: '' })
      setTouched({})
      setSent(name)
      toast({ type: 'success', title: 'Message sent!', message: 'Thanks — I’ll reply as soon as I can.' })
    } catch (err) {
      const msg = err.message || 'Network error — check your connection, or email me directly.'
      setSubmitError(msg)
      toast({ type: 'error', title: 'Could not send', message: msg })
    } finally {
      setSending(false)
    }
  }

  const socialBtn =
    'grid h-11 w-11 place-items-center rounded-xl border border-hair bg-fill text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-neonCyan/40 hover:text-neonCyan hover:shadow-[0_0_22px_-6px_rgba(242,180,61,0.5)]'

  return (
    <section id="contact" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 md:py-20">
      <SectionHeading
        index="06"
        eyebrow="// contact"
        title="Let's build something"
        kicker="Have a role, a project, or just a good problem to chat about? My inbox is always open — pick whichever way is easiest."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
        {/* ---- Direct channels ---- */}
        <Reveal>
          <div className="flex h-full flex-col gap-4">
            {/* Email — copy to clipboard */}
            <div className="group flex items-center gap-4 rounded-2xl glass p-5 transition-colors hover:border-hair-strong">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-hair bg-fill text-neonCyan">
                <AtSign className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-muted">Email</p>
                <p className="truncate font-medium text-ink">{personalInfo.email}</p>
              </div>
              <button
                type="button"
                onClick={copyEmail}
                aria-label="Copy email address"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-hair bg-fill text-muted transition-colors hover:border-neonCyan/40 hover:text-neonCyan"
              >
                {copied ? <Check className="h-4 w-4 text-neonCyan" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            {/* Phone — click to call */}
            <a
              href={`tel:${personalInfo.phone}`}
              className="group flex items-center gap-4 rounded-2xl glass p-5 transition-colors hover:border-hair-strong"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-hair bg-fill text-neonPurple">
                <Phone className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-muted">Phone — tap to call</p>
                <p className="truncate font-medium text-ink">{personalInfo.phone}</p>
              </div>
              <Send className="h-4 w-4 shrink-0 -rotate-45 text-muted transition-colors group-hover:text-neonPurple" />
            </a>

            {/* Socials + availability */}
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-1">
              {SOCIALS.map(({ key, label, Icon }) => (
                <a
                  key={key}
                  href={personalInfo[key]}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className={socialBtn}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
              <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-neonCyan/30 bg-neonCyan/10 px-3 py-1.5 font-mono text-xs text-neonCyan">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neonCyan/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-neonCyan" />
                </span>
                Available
              </span>
            </div>
          </div>
        </Reveal>

        {/* ---- Message form ---- */}
        <Reveal delay={0.08} className="h-full">
          {sent ? (
            <SuccessCard name={sent} onReset={() => setSent('')} />
          ) : (
            <form onSubmit={onSubmit} noValidate className="glass-strong rounded-2xl p-6 sm:p-8">
              <div className="grid gap-1 sm:grid-cols-2 sm:gap-x-5">
                <Field id="c-name" label="Your name" icon={User} error={errors.name} touched={touched.name} valid={!errors.name}>
                  <input
                    id="c-name"
                    type="text"
                    value={values.name}
                    onChange={set('name')}
                    onBlur={blur('name')}
                    placeholder="Ada Lovelace"
                    className={inputCls('name')}
                  />
                </Field>
                <Field id="c-email" label="Email" icon={AtSign} error={errors.email} touched={touched.email} valid={!errors.email}>
                  <input
                    id="c-email"
                    type="email"
                    value={values.email}
                    onChange={set('email')}
                    onBlur={blur('email')}
                    placeholder="you@example.com"
                    className={inputCls('email')}
                  />
                </Field>
              </div>

              <Field id="c-message" label="Message" icon={MessageSquare} error={errors.message} touched={touched.message} valid={!errors.message}>
                <textarea
                  id="c-message"
                  rows={5}
                  value={values.message}
                  onChange={set('message')}
                  onBlur={blur('message')}
                  placeholder="Hi Hussain, I'd love to talk about…"
                  className={`${inputCls('message')} resize-none`}
                />
              </Field>

              {submitError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-red-300"
                >
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {submitError}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neonCyan px-5 py-3.5 font-semibold text-void transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 glow-cyan sm:w-auto"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    Send message
                  </>
                )}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}

/** Post-submit confirmation shown in place of the form (real-backend path). */
function SuccessCard({ name, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong flex h-full min-h-[22rem] flex-col items-center justify-center rounded-2xl p-8 text-center sm:p-10"
    >
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.05 }}
        className="grid h-16 w-16 place-items-center rounded-full border border-neonCyan/40 bg-neonCyan/10 text-neonCyan shadow-[0_0_30px_-6px_rgba(242,180,61,0.6)]"
      >
        <Check className="h-8 w-8" />
      </motion.span>
      <h3 className="mt-6 font-display text-2xl font-bold text-ink">Message sent!</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
        Thanks for reaching out{name ? `, ${name}` : ''} — your message landed in my inbox. I&rsquo;ll get
        back to you as soon as I can.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-hair bg-fill px-5 py-2.5 font-semibold text-ink transition-colors hover:border-hair-strong hover:bg-fill-strong"
      >
        <RotateCcw className="h-4 w-4" />
        Send another
      </button>
    </motion.div>
  )
}
