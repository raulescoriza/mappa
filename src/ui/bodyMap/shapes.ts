// Region shapes for the body map, transcribed from docs/design/body-front.svg.
//
// Geometry lives in the map SVG's viewBox (0 0 200 440). The silhouette is the
// body outline plus the head; available regions are clipped to the body outline
// so their tints never spill outside the silhouette.
//
// A shape is interactive only when its regionId exists in the region registry
// (src/domain/regions). Every other shape is shown but disabled with a
// "coming soon" label. Sides follow anatomy, not the screen: in the front view
// the patient's right side is on the viewer's left.

export type BodySide = 'left' | 'right'

export type BodyView = 'front' | 'back'

export type RegionId =
  | 'neck'
  | 'shoulder'
  | 'elbow'
  | 'wrist-hand'
  | 'lumbar'
  | 'hip'
  | 'knee'
  | 'ankle'

export const BODY_VIEWBOX = '0 0 200 440'

export interface BodyPoint {
  cx: number
  cy: number
}

// The body outline and the head. The body path doubles as the clip used to
// keep available-region tints inside the silhouette.
export const silhouette = {
  body: 'M91,74 C87.8,75.7 92.2,81.3 90,84 C87.8,86.7 82.3,87.8 78,90 C73.7,92.2 67.8,94.0 64,97 C60.2,100.0 57.0,103.5 55,108 C53.0,112.5 52.8,116.2 52,124 C51.2,131.8 50.5,145.7 50,155 C49.5,164.3 49.7,170.8 49,180 C48.3,189.2 46.8,199.7 46,210 C45.2,220.3 44.5,233.7 44,242 C43.5,250.3 42.5,254.0 43,260 C43.5,266.0 45.0,275.3 47,278 C49.0,280.7 53.2,279.3 55,276 C56.8,272.7 57.3,263.7 58,258 C58.7,252.3 58.3,250.0 59,242 C59.7,234.0 61.0,220.0 62,210 C63.0,200.0 64.2,191.2 65,182 C65.8,172.8 66.2,163.3 67,155 C67.8,146.7 69.2,131.2 70,132 C70.8,132.8 71.2,149.5 72,160 C72.8,170.5 75.2,184.2 75,195 C74.8,205.8 71.8,214.2 71,225 C70.2,235.8 69.7,247.5 70,260 C70.3,272.5 71.8,288.0 73,300 C74.2,312.0 76.7,321.2 77,332 C77.3,342.8 74.5,352.8 75,365 C75.5,377.2 79.8,395.5 80,405 C80.2,414.5 76.0,417.8 76,422 C76.0,426.2 76.7,428.7 80,430 C83.3,431.3 93.5,433.0 96,430 C98.5,427.0 95.3,422.0 95,412 C94.7,402.0 94.3,383.0 94,370 C93.7,357.0 92.7,346.5 93,334 C93.3,321.5 94.8,308.0 96,295 C97.2,282.0 98.7,256.0 100,256 C101.3,256.0 102.8,282.0 104,295 C105.2,308.0 106.7,321.5 107,334 C107.3,346.5 106.3,357.0 106,370 C105.7,383.0 105.3,402.0 105,412 C104.7,422.0 101.5,427.0 104,430 C106.5,433.0 116.7,431.3 120,430 C123.3,428.7 124.0,426.2 124,422 C124.0,417.8 119.8,414.5 120,405 C120.2,395.5 124.5,377.2 125,365 C125.5,352.8 122.7,342.8 123,332 C123.3,321.2 125.8,312.0 127,300 C128.2,288.0 129.7,272.5 130,260 C130.3,247.5 129.8,235.8 129,225 C128.2,214.2 125.2,205.8 125,195 C124.8,184.2 127.2,170.5 128,160 C128.8,149.5 129.2,132.8 130,132 C130.8,131.2 132.2,146.7 133,155 C133.8,163.3 134.2,172.8 135,182 C135.8,191.2 137.0,200.0 138,210 C139.0,220.0 140.3,234.0 141,242 C141.7,250.0 141.3,252.3 142,258 C142.7,263.7 143.2,272.7 145,276 C146.8,279.3 151.0,280.7 153,278 C155.0,275.3 156.5,266.0 157,260 C157.5,254.0 156.5,250.3 156,242 C155.5,233.7 154.8,220.3 154,210 C153.2,199.7 151.7,189.2 151,180 C150.3,170.8 150.5,164.3 150,155 C149.5,145.7 148.8,131.8 148,124 C147.2,116.2 147.0,112.5 145,108 C143.0,103.5 139.8,100.0 136,97 C132.2,94.0 126.3,92.2 122,90 C117.7,87.8 112.2,86.7 110,84 C107.8,81.3 112.2,75.7 109,74 C105.8,72.3 94.2,72.3 91,74 Z',
  head: { cx: 100, cy: 52, rx: 18, ry: 25 },
  markers: [
    { text: 'R', x: 4, y: 11 },
    { text: 'L', x: 188, y: 11 },
  ],
} as const

// A selectable (available) region: an SVG path clipped to the body outline.
// The transparent circle at `center` with radius `hitR` is the hit target and
// is sized so the tappable area is at least 44 px at the rendered size.
export interface PathShape {
  kind: 'path'
  id: string
  regionId: RegionId
  side: BodySide
  // Region base name ("Shoulder"); `label` is the side-specific full name.
  name: string
  label: string
  path: string
  center: BodyPoint
  hitR: number
}

// A coming-soon region: a small muted dot that is shown but not selectable.
// It still gets a generous transparent hover target so its label is reachable.
export interface DotShape {
  kind: 'dot'
  id: string
  regionId: RegionId
  side: BodySide | 'center'
  name: string
  label: string
  center: BodyPoint
  r: number
  hitR: number
}

export type RegionShape = PathShape | DotShape

function pathShape(
  id: string,
  regionId: RegionId,
  side: BodySide,
  name: string,
  label: string,
  path: string,
  center: BodyPoint,
): PathShape {
  return { kind: 'path', id, regionId, side, name, label, path, center, hitR: 26 }
}

function dotShape(
  id: string,
  regionId: RegionId,
  side: BodySide | 'center',
  name: string,
  label: string,
  cx: number,
  cy: number,
  r = 4,
): DotShape {
  return { kind: 'dot', id, regionId, side, name, label, center: { cx, cy }, r, hitR: 16 }
}

// Available regions (have clinical content) for the front view.
const shoulderRight =
  'M82,89 C80.0,87.7 73.5,90.5 70,92 C66.5,93.5 63.7,95.0 61,98 C58.3,101.0 55.5,105.3 54,110 C52.5,114.7 51.0,122.3 52,126 C53.0,129.7 57.3,132.3 60,132 C62.7,131.7 65.7,127.7 68,124 C70.3,120.3 71.7,114.0 74,110 C76.3,106.0 80.7,103.5 82,100 C83.3,96.5 84.0,90.3 82,89 Z'
const shoulderLeft =
  'M118,89 C120.0,87.7 126.5,90.5 130,92 C133.5,93.5 136.3,95.0 139,98 C141.7,101.0 144.5,105.3 146,110 C147.5,114.7 149.0,122.3 148,126 C147.0,129.7 142.7,132.3 140,132 C137.3,131.7 134.3,127.7 132,124 C129.7,120.3 128.3,114.0 126,110 C123.7,106.0 119.3,103.5 118,100 C116.7,96.5 116.0,90.3 118,89 Z'

export const frontShapes: readonly RegionShape[] = [
  pathShape('front-shoulder-right', 'shoulder', 'right', 'Shoulder', 'Right shoulder', shoulderRight, {
    cx: 68,
    cy: 110,
  }),
  pathShape('front-shoulder-left', 'shoulder', 'left', 'Shoulder', 'Left shoulder', shoulderLeft, {
    cx: 132,
    cy: 110,
  }),
  dotShape('front-neck', 'neck', 'center', 'Neck', 'Neck', 100, 79),
  dotShape('front-elbow-right', 'elbow', 'right', 'Elbow', 'Right elbow', 57, 182),
  dotShape('front-elbow-left', 'elbow', 'left', 'Elbow', 'Left elbow', 143, 182),
  dotShape('front-wrist-hand-right', 'wrist-hand', 'right', 'Wrist & hand', 'Right wrist & hand', 51.5, 243),
  dotShape('front-wrist-hand-left', 'wrist-hand', 'left', 'Wrist & hand', 'Left wrist & hand', 148.5, 243),
  dotShape('front-hip-right', 'hip', 'right', 'Hip', 'Right hip', 84, 228),
  dotShape('front-hip-left', 'hip', 'left', 'Hip', 'Left hip', 116, 228),
  dotShape('front-knee-right', 'knee', 'right', 'Knee', 'Right knee', 85, 333),
  dotShape('front-knee-left', 'knee', 'left', 'Knee', 'Left knee', 115, 333),
  dotShape('front-ankle-right', 'ankle', 'right', 'Ankle', 'Right ankle', 87, 408),
  dotShape('front-ankle-left', 'ankle', 'left', 'Ankle', 'Left ankle', 113, 408),
]

export function shapesForView(view: BodyView): readonly RegionShape[] {
  if (view === 'front') return frontShapes
  return []
}

// The head-to-toe region list shown in the side panel / bottom sheet. It is
// the accessible alternative to the map: enabled vs coming-soon is decided by
// the region registry, never hard-coded here.
export interface RegionListItem {
  regionId: RegionId
  name: string
  sides: readonly (BodySide | 'center')[]
}

export const regionList: readonly RegionListItem[] = [
  { regionId: 'neck', name: 'Neck', sides: ['center'] },
  { regionId: 'shoulder', name: 'Shoulder', sides: ['right', 'left'] },
  { regionId: 'elbow', name: 'Elbow', sides: ['right', 'left'] },
  { regionId: 'wrist-hand', name: 'Wrist & hand', sides: ['right', 'left'] },
  { regionId: 'lumbar', name: 'Lumbar spine', sides: ['center'] },
  { regionId: 'hip', name: 'Hip', sides: ['right', 'left'] },
  { regionId: 'knee', name: 'Knee', sides: ['right', 'left'] },
  { regionId: 'ankle', name: 'Ankle', sides: ['right', 'left'] },
]
