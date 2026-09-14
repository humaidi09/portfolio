// Self-contained SHA-256 (FIPS 180-4), a faithful JS port of the project's
// src/sha256.cpp. No dependencies: the same message schedule, the same 64 round
// constants, the same big-endian padding. Returns the 64-character lowercase
// hex digest of a string, so it drops straight into the key-stretching loop in
// auth.js the way sha256Hex() does in the C++.
//
// JS has no uint32, so every add is masked back to 32 bits with `>>> 0` and
// every rotate is written out longhand — that is the only concession the port
// makes to the language. Verified against the published FIPS vectors (see the
// node check in the build notes): sha256Hex('abc') ===
// ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad.

// Round constants: first 32 bits of the fractional parts of the cube roots of
// the first 64 primes (identical table to kK[] in the C++).
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
])

// UTF-8 encoder reused across calls. The derivation feeds hex/ASCII strings, so
// UTF-8 bytes are identical to the C++ raw-byte view of std::string; any
// non-ASCII password is handled correctly too.
const ENCODER = new TextEncoder()

// The 64-word message schedule, reused between calls. sha256Hex is synchronous
// and non-reentrant, so a single scratch buffer avoids allocating 60,000+ typed
// arrays over a full 120k-round derivation.
const W = new Uint32Array(64)

const rotr = (x, n) => ((x >>> n) | (x << (32 - n))) >>> 0

/**
 * SHA-256 of a string. Encodes to UTF-8 bytes, pads per FIPS 180-4 (append
 * 0x80, zero-fill to 56 mod 64, then the 64-bit big-endian bit length), then
 * runs the compression function block by block. Returns lowercase hex.
 */
export function sha256Hex(message) {
  const data = ENCODER.encode(message)

  // Padded length: original bytes + 0x80 marker + zeros + 8 length bytes,
  // rounded up to a whole number of 64-byte blocks.
  const bitLength = data.length * 8
  const withOne = data.length + 1
  const blocks = Math.ceil((withOne + 8) / 64)
  const total = blocks * 64
  const msg = new Uint8Array(total)
  msg.set(data)
  msg[data.length] = 0x80
  // Big-endian 64-bit bit count in the final 8 bytes. bitLength stays exact in
  // a JS number well past any password we would ever hash, so the high word is
  // computed with float division rather than a 32-bit shift.
  const hi = Math.floor(bitLength / 0x100000000)
  const lo = bitLength >>> 0
  msg[total - 8] = (hi >>> 24) & 0xff
  msg[total - 7] = (hi >>> 16) & 0xff
  msg[total - 6] = (hi >>> 8) & 0xff
  msg[total - 5] = hi & 0xff
  msg[total - 4] = (lo >>> 24) & 0xff
  msg[total - 3] = (lo >>> 16) & 0xff
  msg[total - 2] = (lo >>> 8) & 0xff
  msg[total - 1] = lo & 0xff

  // Initial hash values: fractional parts of the square roots of the first
  // eight primes.
  let h0 = 0x6a09e667
  let h1 = 0xbb67ae85
  let h2 = 0x3c6ef372
  let h3 = 0xa54ff53a
  let h4 = 0x510e527f
  let h5 = 0x9b05688c
  let h6 = 0x1f83d9ab
  let h7 = 0x5be0cd19

  for (let offset = 0; offset < total; offset += 64) {
    // First 16 words straight from the block, big-endian.
    for (let i = 0; i < 16; i++) {
      const j = offset + i * 4
      W[i] = ((msg[j] << 24) | (msg[j + 1] << 16) | (msg[j + 2] << 8) | msg[j + 3]) >>> 0
    }
    // Remaining 48 from the schedule recurrence.
    for (let i = 16; i < 64; i++) {
      const w15 = W[i - 15]
      const w2 = W[i - 2]
      const s0 = (rotr(w15, 7) ^ rotr(w15, 18) ^ (w15 >>> 3)) >>> 0
      const s1 = (rotr(w2, 17) ^ rotr(w2, 19) ^ (w2 >>> 10)) >>> 0
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, hh = h7

    for (let i = 0; i < 64; i++) {
      const S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0
      const choose = ((e & f) ^ (~e & g)) >>> 0
      const temp1 = (hh + S1 + choose + K[i] + W[i]) >>> 0
      const S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0
      const majority = ((a & b) ^ (a & c) ^ (b & c)) >>> 0
      const temp2 = (S0 + majority) >>> 0

      hh = g
      g = f
      f = e
      e = (d + temp1) >>> 0
      d = c
      c = b
      b = a
      a = (temp1 + temp2) >>> 0
    }

    h0 = (h0 + a) >>> 0
    h1 = (h1 + b) >>> 0
    h2 = (h2 + c) >>> 0
    h3 = (h3 + d) >>> 0
    h4 = (h4 + e) >>> 0
    h5 = (h5 + f) >>> 0
    h6 = (h6 + g) >>> 0
    h7 = (h7 + hh) >>> 0
  }

  return (
    hex32(h0) + hex32(h1) + hex32(h2) + hex32(h3) +
    hex32(h4) + hex32(h5) + hex32(h6) + hex32(h7)
  )
}

/** One 32-bit word as 8 lowercase hex digits. */
function hex32(x) {
  return (x >>> 0).toString(16).padStart(8, '0')
}
