import { useMemo, useState } from 'react'
import { Ban, Check, Minus, Plus, RotateCcw, Utensils } from 'lucide-react'
import { Badge, Button, Callout, Divider, IconButton, Panel, Select, Stat } from '../ui/kit'
import {
  BILL_CONFIG,
  CATEGORIES,
  DISCOUNTS,
  INITIAL_ORDER,
  MENU,
  MENU_BY_CODE,
  OrderStatus,
  computeBill,
  formatMoney,
  isEditable,
  itemCount,
  nextStates,
  orderSubtotal,
  ratePercent,
} from '../../../lib/demos/restaurant'

/**
 * Restaurant Management — live port. Build an order off the menu, move it
 * through its state machine, and read a bill that applies discount → service
 * charge → tax in that fixed, rounded order (see lib/demos/restaurant.js).
 * Opens on the write-up's worked example: a $36.50 order that bills to $38.81.
 */

const lineFromCode = (code, qty) => {
  const it = MENU_BY_CODE.get(code)
  return { code, name: it.name, unitCents: it.cents, qty }
}
const INITIAL = () => INITIAL_ORDER.map((l) => lineFromCode(l.code, l.qty))

// Display metadata for each status: a label and the kit Badge tone.
const STATUS_META = {
  [OrderStatus.OPEN]: { label: 'Open', tone: 'accent' },
  [OrderStatus.PLACED]: { label: 'Placed', tone: 'warn' },
  [OrderStatus.SERVED]: { label: 'Served', tone: 'accent' },
  [OrderStatus.PAID]: { label: 'Paid', tone: 'good' },
  [OrderStatus.CANCELLED]: { label: 'Cancelled', tone: 'bad' },
}
// The label + button style for each transition, keyed by its target status.
const MOVE = {
  [OrderStatus.PLACED]: { label: 'Place order', variant: 'primary', Icon: Check },
  [OrderStatus.SERVED]: { label: 'Mark served', variant: 'primary', Icon: Check },
  [OrderStatus.PAID]: { label: 'Take payment', variant: 'primary', Icon: Check },
  [OrderStatus.CANCELLED]: { label: 'Cancel', variant: 'danger', Icon: Ban },
}
// The happy-path flow, drawn as a stepper so the lifecycle reads at a glance.
const FLOW = [OrderStatus.OPEN, OrderStatus.PLACED, OrderStatus.SERVED, OrderStatus.PAID]

export default function RestaurantDemo() {
  const [lines, setLines] = useState(INITIAL)
  const [status, setStatus] = useState(OrderStatus.OPEN)
  const [discountKey, setDiscountKey] = useState('loyalty10')

  const editable = isEditable(status)
  const subtotal = useMemo(() => orderSubtotal(lines), [lines])
  const bill = useMemo(
    () => computeBill(subtotal, { discount: DISCOUNTS[discountKey].discount }),
    [subtotal, discountKey],
  )
  const count = itemCount(lines)

  /* --- editing (only while OPEN) ------------------------------------- */
  const addItem = (code) =>
    setLines((prev) => {
      const at = prev.findIndex((l) => l.code === code)
      if (at === -1) return [...prev, lineFromCode(code, 1)]
      return prev.map((l, i) => (i === at ? { ...l, qty: l.qty + 1 } : l))
    })
  const setQty = (code, qty) =>
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.code !== code) : prev.map((l) => (l.code === code ? { ...l, qty } : l)),
    )
  const removeItem = (code) => setLines((prev) => prev.filter((l) => l.code !== code))

  /* --- lifecycle ----------------------------------------------------- */
  const go = (target) => setStatus(target)
  const reset = () => {
    setLines(INITIAL())
    setStatus(OrderStatus.OPEN)
    setDiscountKey('loyalty10')
  }

  const flowIndex = FLOW.indexOf(status)
  const cancelled = status === OrderStatus.CANCELLED

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* ------------------------------------------------- order builder */}
      <div className="order-2 space-y-6 lg:order-1">
        {/* Menu */}
        <Panel
          eyebrow="// the terminal table"
          title="Menu"
          actions={!editable && <span className="font-mono text-xs text-muted">locked — order {STATUS_META[status].label.toLowerCase()}</span>}
          bodyClass="space-y-5"
        >
          {CATEGORIES.map((cat) => {
            const items = MENU.filter((i) => i.category === cat)
            if (!items.length) return null
            return (
              <div key={cat}>
                <h3 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted">{cat}</h3>
                <ul className="space-y-1.5">
                  {items.map((it) => (
                    <li
                      key={it.code}
                      className="flex items-center justify-between gap-3 rounded-lg border border-transparent px-1 py-1 hover:border-hair hover:bg-void/20"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm text-ink">{it.name}</span>
                      <span className="font-mono text-sm tabular-nums text-muted">{formatMoney(it.cents)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addItem(it.code)}
                        disabled={!editable}
                        aria-label={`Add ${it.name} to the order`}
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </Panel>

        {/* Current order */}
        <Panel
          eyebrow="// order #1 · table 5"
          title="Current order"
          actions={<Badge tone={STATUS_META[status].tone}>{STATUS_META[status].label}</Badge>}
          bodyClass="space-y-2"
        >
          {lines.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Utensils className="h-6 w-6 text-muted" />
              <p className="text-sm text-muted">No items yet — add something from the menu.</p>
            </div>
          ) : (
            <>
              {lines.map((l) => (
                <div
                  key={l.code}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-hair bg-void/20 p-3 sm:border-transparent sm:bg-transparent sm:p-1"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink">{l.name}</p>
                    <p className="font-mono text-xs text-muted">{formatMoney(l.unitCents)} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <IconButton label={`Decrease ${l.name}`} onClick={() => setQty(l.code, l.qty - 1)} disabled={!editable}>
                        <Minus className="h-4 w-4" />
                      </IconButton>
                      <span className="w-6 text-center font-mono text-sm tabular-nums text-ink">{l.qty}</span>
                      <IconButton label={`Increase ${l.name}`} onClick={() => setQty(l.code, l.qty + 1)} disabled={!editable}>
                        <Plus className="h-4 w-4" />
                      </IconButton>
                    </div>
                    <span className="w-16 text-right font-mono text-sm font-semibold tabular-nums text-ink">
                      {formatMoney(l.unitCents * l.qty)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 font-mono text-xs text-muted">
                <span>{count} item{count === 1 ? '' : 's'}</span>
                <span>subtotal {formatMoney(subtotal)}</span>
              </div>
            </>
          )}
        </Panel>

        {/* Lifecycle / state machine */}
        <Panel eyebrow="// lifecycle" title="Order status" bodyClass="space-y-4">
          {/* Happy-path stepper */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {FLOW.map((s, i) => {
              const done = !cancelled && i < flowIndex
              const current = !cancelled && i === flowIndex
              return (
                <div key={s} className="flex items-center gap-1.5">
                  <span
                    className={`whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[11px] ${
                      current
                        ? 'border-neonCyan/50 bg-neonCyan/10 text-neonCyan'
                        : done
                          ? 'border-hair bg-fill text-ink'
                          : 'border-hair text-muted'
                    }`}
                  >
                    {STATUS_META[s].label}
                  </span>
                  {i < FLOW.length - 1 && <span aria-hidden="true" className="text-muted">→</span>}
                </div>
              )
            })}
            {cancelled && (
              <span className="ml-2 rounded-full border border-red-400/40 bg-red-400/10 px-2.5 py-1 font-mono text-[11px] text-red-300">
                Cancelled
              </span>
            )}
          </div>

          {/* Legal moves — only the transitions the state machine allows */}
          {nextStates(status).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {nextStates(status).map((target) => {
                const m = MOVE[target]
                const blocked = target === OrderStatus.PLACED && count === 0
                return (
                  <Button
                    key={target}
                    variant={m.variant}
                    size="sm"
                    onClick={() => go(target)}
                    disabled={blocked}
                    title={blocked ? 'Add an item before placing the order' : undefined}
                  >
                    <m.Icon className="h-4 w-4" />
                    {m.label}
                  </Button>
                )
              })}
            </div>
          ) : (
            <Callout tone={status === OrderStatus.PAID ? 'good' : 'warn'} title={`Order ${STATUS_META[status].label.toLowerCase()}`}>
              {status === OrderStatus.PAID
                ? 'Settled and paid — a terminal state. The bill on the right is what was charged.'
                : 'This order was cancelled — a terminal state. Nothing was charged.'}
            </Callout>
          )}

          <Button variant="subtle" size="sm" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            New order (reset to example)
          </Button>
        </Panel>
      </div>

      {/* --------------------------------------------------- bill sidebar */}
      <div className="order-1 space-y-4 lg:order-2 lg:sticky lg:top-28 lg:self-start">
        <Stat label="Total due" value={formatMoney(bill.total)} sub={`${count} item${count === 1 ? '' : 's'} · table 5`} accent />

        <Select aria-label="Discount" value={discountKey} onChange={(e) => setDiscountKey(e.target.value)}>
          {Object.entries(DISCOUNTS).map(([key, d]) => (
            <option key={key} value={key}>
              {d.label}
            </option>
          ))}
        </Select>

        <Panel eyebrow="// bill" bodyClass="p-0">
          <dl className="divide-y divide-hair font-mono text-sm">
            <BillRow label="Subtotal" value={formatMoney(bill.subtotal)} />
            <BillRow label={`Discount · ${DISCOUNTS[discountKey].label}`} value={`−${formatMoney(bill.discount)}`} muted={bill.discount === 0} />
            <BillRow label={`Service charge · ${ratePercent(BILL_CONFIG.serviceCharge)}`} value={`+${formatMoney(bill.serviceCharge)}`} />
            <BillRow label={`Tax · ${ratePercent(BILL_CONFIG.tax)}`} value={`+${formatMoney(bill.tax)}`} />
          </dl>
          <Divider />
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-mono text-sm font-semibold text-ink">Total</span>
            <span className="font-mono text-lg font-bold tabular-nums text-neonCyan">{formatMoney(bill.total)}</span>
          </div>
        </Panel>

        <Callout tone="info" title="How the bill is built">
          Discount, then service charge, then tax — in that fixed order, each rounded to the cent before the
          next, so the printed lines always add up to the total. Money is held as exact integer cents, never a
          float.
        </Callout>
      </div>
    </div>
  )
}

/** One label/amount row in the itemised bill. */
function BillRow({ label, value, muted = false }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <dt className="text-muted">{label}</dt>
      <dd className={`tabular-nums ${muted ? 'text-muted' : 'text-ink'}`}>{value}</dd>
    </div>
  )
}
