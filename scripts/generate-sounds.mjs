import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'sounds')
const SAMPLE_RATE = 44100

function writeWav(filename, samples) {
  const numChannels = 1
  const bitsPerSample = 16
  const byteRate = (SAMPLE_RATE * numChannels * bitsPerSample) / 8
  const blockAlign = (numChannels * bitsPerSample) / 8
  const dataSize = samples.length * 2
  const buffer = Buffer.alloc(44 + dataSize)

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(numChannels, 22)
  buffer.writeUInt32LE(SAMPLE_RATE, 24)
  buffer.writeUInt32LE(byteRate, 28)
  buffer.writeUInt16LE(blockAlign, 32)
  buffer.writeUInt16LE(bitsPerSample, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  for (let i = 0; i < samples.length; i++) {
    const clipped = Math.max(-1, Math.min(1, samples[i]))
    buffer.writeInt16LE(Math.round(clipped * 32767), 44 + i * 2)
  }

  writeFileSync(join(OUT_DIR, filename), buffer)
  console.log(`Wrote ${filename} (${(dataSize / 1024).toFixed(1)} KB)`)
}

function adsr(t, dur, { attack = 0.01, decay = 0.05, sustain = 0.7, release = 0.2 } = {}) {
  if (t < attack) return t / attack
  if (t < attack + decay) {
    const p = (t - attack) / decay
    return 1 - (1 - sustain) * p
  }
  const releaseStart = dur - release
  if (t < releaseStart) return sustain
  if (t < dur) return sustain * (1 - (t - releaseStart) / release)
  return 0
}

// Bright triadic "ding!" — C5, E5, G5 played as a quick arpeggio + sustained chord
function buildYes() {
  const totalDur = 0.9
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * totalDur))
  const notes = [
    { freq: 523.25, start: 0.0, dur: 0.85 }, // C5
    { freq: 659.25, start: 0.08, dur: 0.77 }, // E5
    { freq: 783.99, start: 0.16, dur: 0.69 }, // G5
    { freq: 1046.5, start: 0.24, dur: 0.6 }, // C6 sparkle
  ]
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE
    let sample = 0
    for (const { freq, start, dur } of notes) {
      if (t < start || t > start + dur) continue
      const local = t - start
      const env = adsr(local, dur, { attack: 0.005, decay: 0.08, sustain: 0.55, release: 0.4 })
      // Sine + slight 2nd-harmonic for bell-like timbre
      sample +=
        env *
        (0.7 * Math.sin(2 * Math.PI * freq * local) +
          0.18 * Math.sin(2 * Math.PI * freq * 2 * local) +
          0.08 * Math.sin(2 * Math.PI * freq * 3 * local))
    }
    samples[i] = sample * 0.32
  }
  return samples
}

// Game-show wrong "buzzz" — descending buzzy two-tone with sawtooth bite
function buildNo() {
  const totalDur = 0.7
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * totalDur))
  const segments = [
    { freq: 220, start: 0.0, dur: 0.32 }, // A3
    { freq: 165, start: 0.32, dur: 0.38 }, // E3
  ]
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE
    let sample = 0
    for (const { freq, start, dur } of segments) {
      if (t < start || t > start + dur) continue
      const local = t - start
      const env = adsr(local, dur, { attack: 0.005, decay: 0.05, sustain: 0.85, release: 0.08 })
      // Sawtooth approximation via summed sines + slight detune for buzz
      const phase = 2 * Math.PI * freq * local
      const detune = 2 * Math.PI * (freq * 1.005) * local
      const saw =
        0.5 * Math.sin(phase) +
        0.25 * Math.sin(2 * phase) +
        0.17 * Math.sin(3 * phase) +
        0.12 * Math.sin(4 * phase) +
        0.08 * Math.sin(5 * phase) +
        0.2 * Math.sin(detune)
      // Amplitude tremolo for buzzer character
      const tremolo = 0.85 + 0.15 * Math.sin(2 * Math.PI * 18 * local)
      sample += env * saw * tremolo
    }
    samples[i] = sample * 0.28
  }
  return samples
}

// Sad-trombone "wah-wah-waaah" — three descending brassy notes with pitch dip
function buildPrankReveal() {
  const totalDur = 1.4
  const samples = new Float32Array(Math.floor(SAMPLE_RATE * totalDur))
  const notes = [
    { startFreq: 392.0, endFreq: 370.0, start: 0.0, dur: 0.32 }, // G4 → F#4
    { startFreq: 349.23, endFreq: 329.63, start: 0.32, dur: 0.32 }, // F4 → E4
    { startFreq: 293.66, endFreq: 220.0, start: 0.64, dur: 0.74 }, // D4 → A3 (long droop)
  ]
  for (let i = 0; i < samples.length; i++) {
    const t = i / SAMPLE_RATE
    let sample = 0
    for (const { startFreq, endFreq, start, dur } of notes) {
      if (t < start || t > start + dur) continue
      const local = t - start
      const p = local / dur
      // Linear pitch glide for the wah droop
      const freq = startFreq + (endFreq - startFreq) * p
      const env = adsr(local, dur, { attack: 0.02, decay: 0.08, sustain: 0.8, release: 0.18 })
      // Brassy timbre via stacked odd+even harmonics
      const phase = 2 * Math.PI * freq * local
      const brass =
        0.5 * Math.sin(phase) +
        0.3 * Math.sin(2 * phase) +
        0.18 * Math.sin(3 * phase) +
        0.1 * Math.sin(4 * phase) +
        0.06 * Math.sin(5 * phase)
      // Slow vibrato for the trombone "wah" quality
      const vibrato = 0.9 + 0.1 * Math.sin(2 * Math.PI * 5 * local)
      sample += env * brass * vibrato
    }
    samples[i] = sample * 0.3
  }
  return samples
}

writeWav('yes-buzzer.wav', buildYes())
writeWav('no-buzzer.wav', buildNo())
writeWav('prank-reveal.wav', buildPrankReveal())
