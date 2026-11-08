import polygonClipping from 'polygon-clipping';
import { Point, Polygon, UNITS } from './types';

export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function toFtIn(val: number): string {
  const sign = val < 0 ? '-' : '';
  val = Math.abs(val);
  let feet = Math.floor(val);
  const inchesDec = (val - feet) * 12.0;
  const halfInches = Math.round(inchesDec * 2.0);
  let inches = Math.floor(halfInches / 2);
  const remainder = halfInches % 2;

  let frac = '';
  if (remainder === 1) {
    frac = ' 1/2';
  }

  if (inches === 12) {
    feet += 1;
    inches = 0;
    frac = '';
  }

  return `${sign}${feet}'-${inches}${frac}"`;
}

export function shoelaceArea(vertices: Point[]): number {
  const n = vertices.length;
  if (n < 3) return 0;
  let area = 0.0;
  for (let i = 0; i < n; i++) {
    const p1 = vertices[i];
    const p2 = vertices[(i + 1) % n];
    area += p1[0] * p2[1] - p2[0] * p1[1];
  }
  return Math.abs(area) / 2.0;
}

export function polygonCentroid(vertices: Point[]): Point {
  const n = vertices.length;
  let cx = 0;
  let cy = 0;
  let signedArea = 0;
  for (let i = 0; i < n; i++) {
    const p1 = vertices[i];
    const p2 = vertices[(i + 1) % n];
    const a = p1[0] * p2[1] - p2[0] * p1[1];
    signedArea += a;
    cx += (p1[0] + p2[0]) * a;
    cy += (p1[1] + p2[1]) * a;
  }
  signedArea *= 0.5;
  if (Math.abs(signedArea) < 1e-6) {
    return [vertices[0][0], vertices[0][1]];
  }
  return [cx / (6 * signedArea), cy / (6 * signedArea)];
}

export function polygonBounds(vertices: Point[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of vertices) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

export function pointInPolygon(point: Point, vs: Point[]): boolean {
  const x = point[0];
  const y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0];
    const yi = vs[i][1];
    const xj = vs[j][0];
    const yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Clips subject polygon by clip polygon using polygon-clipping.
 */
export function clipPolygon(subject: Polygon, clip: Polygon): Polygon[] {
  const sGeom: polygonClipping.Geom = [[[...subject]]];
  const cGeom: polygonClipping.Geom = [[[...clip]]];
  const result = polygonClipping.intersection(sGeom, cGeom);
  return flattenMultiPolygon(result);
}

export function differencePolygon(subject: Polygon, clip: Polygon): Polygon[] {
  const sGeom: polygonClipping.Geom = [[[...subject]]];
  const cGeom: polygonClipping.Geom = [[[...clip]]];
  const result = polygonClipping.difference(sGeom, cGeom);
  return flattenMultiPolygon(result);
}

function flattenMultiPolygon(mp: polygonClipping.MultiPolygon): Polygon[] {
  const out: Polygon[] = [];
  for (const poly of mp) {
    for (const ring of poly) {
      if (ring.length >= 3) {
        // Drop duplicate closing vertex if present
        const cleanRing: Point[] = ring.map(p => [round2(p[0]), round2(p[1])]);
        if (
          cleanRing.length > 3 &&
          cleanRing[0][0] === cleanRing[cleanRing.length - 1][0] &&
          cleanRing[0][1] === cleanRing[cleanRing.length - 1][1]
        ) {
          cleanRing.pop();
        }
        if (shoelaceArea(cleanRing) > 1.0) {
          out.push(cleanRing);
        }
      }
    }
  }
  return out;
}
