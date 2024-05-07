/* eslint-disable  */
import path, { resolve } from 'node:path'
import {
  promises as fs,
  createReadStream
} from 'node:fs'
import { Stream } from 'node:stream'
import { DOMParser } from '@xmldom/xmldom'
import * as canvas from 'canvas'
import { Canvg, presets } from '../../src'

const streamToBlob = async (stream: Stream, mimeType: string): Promise<Blob> => {
  if (mimeType != null && typeof mimeType !== 'string') {
    throw new Error('Invalid mimetype, expected string.')
  }
  return new Promise((resolve, reject) => {
    const chunks = []
    stream
      .on('data', chunk => chunks.push(chunk))
      .once('end', () => {
        const blob = mimeType != null
          ? new Blob(chunks, { type: mimeType })
          : new Blob(chunks)
        resolve(blob)
      })
      .once('error', reject)
  })
}

const preset = presets.node({
  DOMParser,
  canvas,
  fetch: async (input) => {
    if (typeof input === 'string' && !input.startsWith('http')) {
      const stream = createReadStream(
        resolve(__dirname, '..', 'svgs', input)
      )
      const blob = await streamToBlob(stream, 'image/svg+xml');
      const response = new Response(blob, {
        headers: {
          'Content-Type': 'image/svg+xml'
        }
      })

      return Promise.resolve(response)
    }

    return fetch(input)
  }
})

export async function render(
  file: string,
  width?: number,
  height?: number,
  preserveAspectRatio?: string
) {
  const svg = await fs.readFile(
    path.join(__dirname, '..', 'svgs', file),
    'utf8'
  )
  const c = preset.createCanvas(1280, 720) as canvas.Canvas
  const ctx = c.getContext('2d')
  const v = Canvg.fromString(ctx, svg, preset)

  if (width && height && preserveAspectRatio) {
    v.resize(width, height, preserveAspectRatio)
  }

  await v.render()

  return c.toBuffer()
}

const maybeRunIndex = process.argv.indexOf(__filename)

if (~maybeRunIndex && maybeRunIndex === process.argv.length - 3) {
  void (async () => {
    const output = process.argv.pop()
    const input = process.argv.pop()
    const image = await render(input)

    await fs.writeFile(output, image)
  })()
}
