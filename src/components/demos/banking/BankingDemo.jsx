import { useMemo, useState } from 'react'
import { ArrowLeftRight, ArrowDownToLine, ArrowUpFromLine, Landmark, Plus, RotateCcw, ShieldCheck } from 'lucide-react'
import { Badge, Button, Callout, Field, Panel, Select, Stat, TextInput, Toolbar } from '../ui/kit'
import {
  ENTRY,
  ENTRY_LABEL,
  Money,
  STATUS,
  balanceOf,
  deposit,
  foldLedger,
  isCredit,
  listAccounts,
  openAccount,
  sampleBank,
  statusMessage,
  totalDeposits,
  transfer,
  withdraw,
} from '../../../lib/demos/banking'

/**
 * Banking System — live port. Open accounts and post deposits / withdrawals /
 * transfers against an append-only ledger; every balance shown is *derived* by
 * folding that account's history (see lib/demos/banking.js), and every amount is
 * an exact integer count of minor units — never a float. Opens on the repo's
 * two-account example (examples/demo_bank.txt) so real balances show at once:
 * Ada 1,250.75 and Grace 599.25.
 */

// The three movements a customer can post, with the icon + default note the CLI uses.
const MODES = [
  { key: 'deposit', label: 'Deposit', icon: ArrowDownToLine, note: 'cash deposit' },
  { key: 'withdraw', label: 'Withdraw', icon: ArrowUpFromLine, note: 'cash withdrawal' },
  { key: 'transfer', label: 'Transfer', icon: ArrowLeftRight, note: 'transfer' },
]

export default function BankingDemo() {
  const [bank, setBank] = useState(sampleBank)
  const [selectedId, setSelectedId] = useState(1001) // account driving the Stat + ledger + as the "from" account
  const [mode, setMode] = useState('deposit')
  const [toId, setToId] = useState(1002) // transfer destination
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState(null)

  // Open-account form.
  const [openName, setOpenName] = useState('')
  const [openBalance, setOpenBalance] = useState('0')
  const [openError, setOpenError] = useState(null)

  // Derived figures — recomputed from the single source of truth (the ledgers).
  const accounts = useMemo(() => listAccounts(bank), [bank])
  const selected = useMemo(() => accounts.find((a) => a.id === selectedId) ?? accounts[0] ?? null, [accounts, selectedId])
  const ledgerRows = useMemo(() => (selected ? foldLedger(selected.ledger) : []), [selected])
  const selectedBalance = selected ? balanceOf(selected) : 0n
  const total = useMemo(() => totalDeposits(bank), [bank])

  // Destinations for a transfer: every account except the source.
  const others = accounts.filter((a) => a.id !== selectedId)
  const effectiveTo = others.some((a) => a.id === toId) ? toId : others[0]?.id ?? null

  // Live preview: prove the amount parses to an exact integer count of minor units.
  const parsedAmount = amount.trim() === '' ? null : Money.parse(amount.trim())

  // The classic float trap, computed with the real Money type: 0.10 + 0.20 = 0.30 exactly.
  const exactDemo = Money.tryAdd(Money.of(0, 10), Money.of(0, 20))

  /* --- actions -------------------------------------------------------- */
  const post = () => {
    setError(null)
    const units = Money.parse(amount.trim())
    if (units === null) {
      setError('Enter an amount like 100 or 49.99.')
      return
    }
    const chosen = MODES.find((m) => m.key === mode)
    const memo = note.trim() || chosen.note

    let res
    if (mode === 'deposit') res = deposit(bank, selectedId, units, memo)
    else if (mode === 'withdraw') res = withdraw(bank, selectedId, units, memo)
    else {
      if (effectiveTo === null) {
        setError('Open a second account to transfer to.')
        return
      }
      res = transfer(bank, selectedId, effectiveTo, units, memo)
    }

    if (res.status !== STATUS.Ok) {
      setError(statusMessage(res.status)) // validation error shown via Callout tone="bad"
      return
    }
    setBank(res.bank)
    setAmount('')
    setNote('')
  }

  const openNew = () => {
    setOpenError(null)
    const trimmed = openBalance.trim()
    const units = trimmed === '' ? 0n : Money.parse(trimmed)
    if (units === null) {
      setOpenError('Enter an opening balance like 100, 49.99, or 0.')
      return
    }
    const res = openAccount(bank, openName, units)
    if (res.status !== STATUS.Ok) {
      setOpenError(statusMessage(res.status))
      return
    }
    setBank(res.bank)
    setSelectedId(res.accountId) // jump to the freshly opened account
    setOpenName('')
    setOpenBalance('0')
  }

  const reset = () => {
    const fresh = sampleBank()
    setBank(fresh)
    setSelectedId(listAccounts(fresh)[0].id)
    setMode('deposit')
    setToId(1002)
    setAmount('')
    setNote('')
    setError(null)
    setOpenName('')
    setOpenBalance('0')
    setOpenError(null)
  }

  const activeMode = MODES.find((m) => m.key === mode)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* -------------------------------------------------- primary column */}
      <div className="order-2 space-y-6 lg:order-1">
        {/* Accounts: open-account form + selectable list with balances */}
        <Panel eyebrow="// accounts" title="Accounts" actions={<Badge tone="neutral">{accounts.length} open</Badge>}>
          <div className="grid gap-3 sm:grid-cols-[1fr_150px_auto] sm:items-end">
            <Field label="Account holder">
              <TextInput
                placeholder="e.g. Alan Turing"
                value={openName}
                onChange={(e) => setOpenName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && openNew()}
              />
            </Field>
            <Field label="Opening balance" hint="0 for none">
              <TextInput
                inputMode="decimal"
                placeholder="0.00"
                value={openBalance}
                onChange={(e) => setOpenBalance(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && openNew()}
              />
            </Field>
            <Button variant="ghost" onClick={openNew}>
              <Plus className="h-4 w-4" />
              Open
            </Button>
          </div>
          {openError && (
            <Callout tone="bad" className="mt-3">
              {openError}
            </Callout>
          )}

          <div className="mt-4 space-y-2">
            {accounts.map((a) => {
              const active = selected && a.id === selected.id
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedId(a.id)}
                  aria-pressed={active}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    active ? 'border-neonCyan/50 bg-neonCyan/[0.06]' : 'border-hair bg-void/20 hover:border-neonCyan/30'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] text-muted">#{a.id}</div>
                    <div className="truncate text-sm font-medium text-ink">{a.owner}</div>
                  </div>
                  <div className="shrink-0 text-right font-mono text-sm tabular-nums text-ink">{Money.format(balanceOf(a))}</div>
                </button>
              )
            })}
          </div>
        </Panel>

        {/* Post a transaction */}
        <Panel eyebrow="// post a transaction" title="Move money">
          <Toolbar className="mb-4">
            {MODES.map((m) => {
              const on = mode === m.key
              return (
                <Button
                  key={m.key}
                  variant="ghost"
                  size="sm"
                  aria-pressed={on}
                  onClick={() => {
                    setMode(m.key)
                    setError(null)
                  }}
                  className={on ? 'border-neonCyan/50 text-neonCyan' : ''}
                >
                  <m.icon className="h-4 w-4" />
                  {m.label}
                </Button>
              )
            })}
          </Toolbar>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={mode === 'transfer' ? 'From account' : 'Account'}>
              <Select value={selectedId} onChange={(e) => setSelectedId(Number(e.target.value))}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.id} — {a.owner}
                  </option>
                ))}
              </Select>
            </Field>

            {mode === 'transfer' && (
              <Field label="To account">
                <Select value={effectiveTo ?? ''} onChange={(e) => setToId(Number(e.target.value))} disabled={others.length === 0}>
                  {others.length === 0 && <option value="">No other account</option>}
                  {others.map((a) => (
                    <option key={a.id} value={a.id}>
                      #{a.id} — {a.owner}
                    </option>
                  ))}
                </Select>
              </Field>
            )}

            <Field label="Amount" hint="e.g. 100 or 49.99">
              <TextInput
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && post()}
              />
            </Field>

            <Field label="Note" hint="optional">
              <TextInput
                placeholder={activeMode.note}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && post()}
              />
            </Field>
          </div>

          {/* Faithful bit: the amount is parsed to exact integer minor units. */}
          <div className="mt-2.5 font-mono text-xs">
            {parsedAmount === null ? (
              <span className="text-muted">Amounts are parsed to exact integer minor units — never a float.</span>
            ) : (
              <span className="text-muted">
                = <span className="text-ink">{Money.format(parsedAmount)}</span> ·{' '}
                <span className="text-neonCyan">{parsedAmount.toString()}</span> minor units
              </span>
            )}
          </div>

          {error && (
            <Callout tone="bad" className="mt-3">
              {error}
            </Callout>
          )}

          <div className="mt-4">
            <Button variant="ghost" onClick={post}>
              <activeMode.icon className="h-4 w-4" />
              Post {activeMode.label.toLowerCase()}
            </Button>
          </div>
        </Panel>

        {/* Append-only ledger for the selected account — a dark, console-style
            statement that stays dark in both themes (code-surface). */}
        <Panel
          eyebrow="// append-only ledger"
          title={selected ? `Statement · #${selected.id} ${selected.owner}` : 'Ledger'}
          actions={<Badge tone="accent">{ledgerRows.length} entries</Badge>}
          bodyClass="p-0"
        >
          <div className="code-surface overflow-x-auto rounded-b-2xl bg-surface">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <caption className="sr-only">Every movement on this account, with the running balance it proves.</caption>
              <thead>
                <tr className="border-b border-hair font-mono text-[10px] uppercase tracking-wider text-muted">
                  <th scope="col" className="px-4 py-2.5 font-medium">#</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Type</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Details</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-medium">Amount</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {ledgerRows.map((r) => {
                  const credit = isCredit(r.type)
                  return (
                    <tr key={r.seq}>
                      <td className="px-4 py-2.5 font-mono text-xs tabular-nums text-muted">{r.seq}</td>
                      <td className="px-3 py-2.5">
                        <Badge tone="neutral">{ENTRY_LABEL[r.type]}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-muted">
                        <span className="text-ink">{r.note}</span>
                        {r.counterparty !== 0 && (
                          <span className="ml-1.5 whitespace-nowrap font-mono text-xs">
                            {r.type === ENTRY.TransferOut ? '→' : '←'} #{r.counterparty}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-sm tabular-nums">
                        <span className={credit ? 'text-emerald-300' : 'text-red-300'}>
                          {credit ? '+' : '−'}
                          {Money.format(r.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm font-semibold tabular-nums text-ink">
                        {Money.format(r.balanceAfter)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <div>
          <Button variant="subtle" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Reset to example
          </Button>
        </div>
      </div>

      {/* --------------------------------------------------- results sidebar */}
      <div className="order-1 space-y-4 lg:order-2">
        <Stat
          label="Selected balance"
          value={Money.format(selectedBalance)}
          sub={selected ? `#${selected.id} · ${selected.owner}` : 'no account selected'}
          accent
        />
        <Stat label="Total assets" value={Money.format(total)} sub={`across ${accounts.length} account${accounts.length === 1 ? '' : 's'}`} />

        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-neonCyan" />
          <Badge tone="good">Balance proven from ledger</Badge>
        </div>

        <Callout tone="info" title="Why money is an integer">
          Every amount is a whole number of minor units (paisa), so arithmetic is exact by construction:
          <div className="mt-2 rounded-lg bg-void/40 px-3 py-2 font-mono text-xs text-ink">
            0.10 + 0.20 = <span className="font-semibold text-neonCyan">{Money.format(exactDemo)}</span>{' '}
            <span className="text-muted">({exactDemo.toString()} units)</span>
          </div>
          A <code className="font-mono text-neonCyan/90">double</code> would give 0.30000000000000004; over thousands of
          transactions those errors become real money.
        </Callout>

        <Callout tone="info" title="How the balance is proven">
          The balance is not stored — it is folded from the account's append-only ledger and must equal the running total at
          every step. Withdrawals and transfers beyond the balance are refused outright; no overdraft.
        </Callout>

        <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-muted">
          <Landmark className="h-3.5 w-3.5" />
          C++17 core · integer money · checked arithmetic
        </div>
      </div>
    </div>
  )
}
