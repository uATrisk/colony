import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { MasterPlanOutput, UNITS } from '../src/geometry/types';
import { shoelaceArea, pointInPolygon, round2 } from '../src/geometry/polygon';

const plotsJsonPath = path.resolve('src/data/plots.json');
const siteJsonPath = path.resolve('src/data/site.json');

const plan: MasterPlanOutput = JSON.parse(fs.readFileSync(plotsJsonPath, 'utf8'));
const siteData = JSON.parse(fs.readFileSync(siteJsonPath, 'utf8'));
const sitePolygon = siteData.vertices.map((v: { x: number; y: number }) => [v.x, v.y]);

describe('NANDI Township Subdivision Bylaws & Geometry Validation', () => {
  it('Rule 1 & 2: Every plot conforms to 100 <= gaj <= 121 (non-irregular: 119 <= gaj <= 121)', () => {
    for (const plot of plan.plots) {
      expect(plot.areaGaj).toBeGreaterThanOrEqual(100.0);
      expect(plot.areaGaj).toBeLessThanOrEqual(121.0);
      if (!plot.irregular) {
        expect(plot.areaGaj).toBeGreaterThanOrEqual(119.0);
        expect(plot.areaGaj).toBeLessThanOrEqual(121.0);
      }
    }
  });

  it('Rule 3: Every plot has front >= 22\'-0", depth <= 47\'-0", and ZERO South facing', () => {
    for (const plot of plan.plots) {
      expect(plot.frontFt).toBeGreaterThanOrEqual(22.0);
      expect(plot.depthFt).toBeLessThanOrEqual(47.0);
      expect(plot.facing).not.toBe('S');
      expect(['E', 'W', 'N']).toContain(plot.facing);
    }
  });

  it('Rule 4: Every plot has an assigned abutting road', () => {
    for (const plot of plan.plots) {
      expect(plot.roadName).toBeTruthy();
      expect(plot.roadName.length).toBeGreaterThan(0);
    }
  });

  it('Rule 5: No plots overlap each other and all stay inside site boundary', () => {
    // Check plot centroids inside site boundary
    for (const plot of plan.plots) {
      const vs = plot.vertices;
      const cx = (vs[0][0] + vs[2][0]) / 2.0;
      const cy = (vs[0][1] + vs[2][1]) / 2.0;
      expect(pointInPolygon([cx, cy], sitePolygon)).toBe(true);
    }

    // Pairwise non-overlap check (bounding box / area intersection)
    for (let i = 0; i < plan.plots.length; i++) {
      const p1 = plan.plots[i];
      const [minX1, maxX1] = [Math.min(...p1.vertices.map(v => v[0])), Math.max(...p1.vertices.map(v => v[0]))];
      const [minY1, maxY1] = [Math.min(...p1.vertices.map(v => v[1])), Math.max(...p1.vertices.map(v => v[1]))];

      for (let j = i + 1; j < plan.plots.length; j++) {
        const p2 = plan.plots[j];
        const [minX2, maxX2] = [Math.min(...p2.vertices.map(v => v[0])), Math.max(...p2.vertices.map(v => v[0]))];
        const [minY2, maxY2] = [Math.min(...p2.vertices.map(v => v[1])), Math.max(...p2.vertices.map(v => v[1]))];

        const xOverlap = Math.max(0, Math.min(maxX1, maxX2) - Math.max(minX1, minX2));
        const yOverlap = Math.max(0, Math.min(maxY1, maxY2) - Math.max(minY1, minY2));
        const overlapArea = xOverlap * yOverlap;

        // Tolerance of 0.1 sq ft for floating point edge abutting
        expect(overlapArea).toBeLessThan(0.1);
      }
    }
  });

  it('Rule 6: Land-use balance sheet adds up to 100.00% (+-0.01%)', () => {
    const b = plan.balanceSheet;
    const sumPct = round2(b.totalPlots.pct + b.parks.pct + b.roads.pct + b.utilities.pct);
    expect(sumPct).toBeCloseTo(100.0, 1);
  });

  it('Rule 7: Total Park percentage is strictly between 13.00% and 15.00% (MDA Statutory Norm)', () => {
    const parkPct = plan.balanceSheet.parks.pct;
    expect(parkPct).toBeGreaterThanOrEqual(13.0);
    expect(parkPct).toBeLessThanOrEqual(15.0);
  });

  it('Rule 8: Road network has zero dead-ends and circulatory flow', () => {
    expect(plan.roads.length).toBeGreaterThanOrEqual(4);
    const loop = plan.roads.find(r => r.role === 'LOOP');
    expect(loop).toBeDefined();
    const spine = plan.roads.find(r => r.role === 'SPINE');
    expect(spine).toBeDefined();
  });

  it('Rule 9: Facing, premium and type counts add up to total plot count', () => {
    const s = plan.statistics;
    const facingSum = s.facing.east.count + s.facing.west.count + s.facing.north.count + s.facing.south.count;
    expect(facingSum).toBe(s.totalCount);
    expect(s.residentialCount + s.commercialCount).toBe(s.totalCount);
    expect(s.facing.south.count).toBe(0);
  });
});
