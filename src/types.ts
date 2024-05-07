import * as canvas from 'canvas'

export type MatrixValue = readonly [number, number, number, number, number, number]

export type VectorValue = readonly [number, number]

export type RenderingContext2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

export type NodeCanvasRenderingContext2D = RenderingContext2D | canvas.CanvasRenderingContext2D

export type Fetch = typeof fetch
