// Region shapes for the body map.
//
// Geometry lives in the map SVG's viewBox (0 0 200 400). A shape is
// selectable only when its regionId exists in the region registry
// (src/domain/regions); every other shape is shown but disabled.
//
// Sides follow anatomy, not the screen: in the front view the patient's
// right side is on the left of the screen, and vice versa in the back view.

export type BodySide = 'left' | 'right'

export type BodyView = 'front' | 'back'

export type ShapeGeometry =
  | { kind: 'circle'; cx: number; cy: number; r: number }
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | {
      kind: 'rect'
      x: number
      y: number
      width: number
      height: number
      rx: number
    }

export interface BodyShape {
  id: string
  view: BodyView
  side: BodySide | 'center'
  regionId: string
  label: string
  geometry: ShapeGeometry
}

function circle(cx: number, cy: number, r: number): ShapeGeometry {
  return { kind: 'circle', cx, cy, r }
}

function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  rx: number,
): ShapeGeometry {
  return { kind: 'rect', x, y, width, height, rx }
}

function shape(
  id: string,
  view: BodyView,
  side: BodyShape['side'],
  regionId: string,
  label: string,
  geometry: ShapeGeometry,
): BodyShape {
  return { id, view, side, regionId, label, geometry }
}

const front: BodyShape[] = [
  shape('front-right-shoulder', 'front', 'right', 'shoulder', 'Right shoulder', circle(50, 68, 13)),
  shape('front-left-shoulder', 'front', 'left', 'shoulder', 'Left shoulder', circle(150, 68, 13)),
  shape('front-right-elbow', 'front', 'right', 'elbow', 'Right elbow', circle(45, 137, 11)),
  shape('front-left-elbow', 'front', 'left', 'elbow', 'Left elbow', circle(155, 137, 11)),
  shape('front-neck', 'front', 'center', 'neck', 'Neck', rect(87, 42, 26, 16, 8)),
  shape('front-right-hip', 'front', 'right', 'hip', 'Right hip', circle(79, 200, 12)),
  shape('front-left-hip', 'front', 'left', 'hip', 'Left hip', circle(121, 200, 12)),
  shape('front-right-knee', 'front', 'right', 'knee', 'Right knee', circle(79, 300, 12)),
  shape('front-left-knee', 'front', 'left', 'knee', 'Left knee', circle(121, 300, 12)),
  shape('front-right-ankle', 'front', 'right', 'ankle', 'Right ankle', circle(79, 385, 11)),
  shape('front-left-ankle', 'front', 'left', 'ankle', 'Left ankle', circle(121, 385, 11)),
]

const back: BodyShape[] = [
  shape('back-left-shoulder', 'back', 'left', 'shoulder', 'Left shoulder', circle(50, 68, 13)),
  shape('back-right-shoulder', 'back', 'right', 'shoulder', 'Right shoulder', circle(150, 68, 13)),
  shape('back-left-elbow', 'back', 'left', 'elbow', 'Left elbow', circle(45, 137, 11)),
  shape('back-right-elbow', 'back', 'right', 'elbow', 'Right elbow', circle(155, 137, 11)),
  shape('back-neck', 'back', 'center', 'neck', 'Neck', rect(87, 42, 26, 16, 8)),
  shape('back-lumbar', 'back', 'center', 'lumbar', 'Lumbar spine', rect(84, 152, 32, 28, 10)),
  shape('back-left-hip', 'back', 'left', 'hip', 'Left hip', circle(79, 200, 12)),
  shape('back-right-hip', 'back', 'right', 'hip', 'Right hip', circle(121, 200, 12)),
  shape('back-left-knee', 'back', 'left', 'knee', 'Left knee', circle(79, 300, 12)),
  shape('back-right-knee', 'back', 'right', 'knee', 'Right knee', circle(121, 300, 12)),
  shape('back-left-ankle', 'back', 'left', 'ankle', 'Left ankle', circle(79, 385, 11)),
  shape('back-right-ankle', 'back', 'right', 'ankle', 'Right ankle', circle(121, 385, 11)),
]

export const bodyShapes: readonly BodyShape[] = [...front, ...back]

export function shapesForView(view: BodyView): BodyShape[] {
  return bodyShapes.filter((shape) => shape.view === view)
}
