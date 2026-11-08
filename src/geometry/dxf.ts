import { MasterPlanOutput, Point } from './types';
import { round2, toFtIn, polygonCentroid } from './polygon';

export function generateDxf(plan: MasterPlanOutput, sitePolygon: Point[]): string {
  const lines: string[] = [];

  const add = (group: number, value: string | number) => {
    lines.push(group.toString());
    lines.push(value.toString());
  };

  // DXF HEADER
  add(0, 'SECTION');
  add(2, 'HEADER');
  add(9, '$ACADVER');
  add(1, 'AC1015'); // AutoCAD 2000 format
  add(9, '$INSUNITS');
  add(70, 2); // 2 = Feet
  add(9, '$MEASUREMENT');
  add(70, 0); // 0 = Imperial / Feet
  add(0, 'ENDSEC');

  // TABLES
  add(0, 'SECTION');
  add(2, 'TABLES');
  add(0, 'TABLE');
  add(2, 'LAYER');
  add(70, 9);

  const layers = [
    { name: 'BOUNDARY', color: 7 }, // White
    { name: 'ROADS', color: 4 },    // Cyan
    { name: 'PLOTS_RES', color: 3 },// Green
    { name: 'PLOTS_COM', color: 2 },// Yellow
    { name: 'PLOTS_PREMIUM', color: 6 }, // Magenta
    { name: 'PARKS', color: 92 },   // Green
    { name: 'UTILITY', color: 5 },  // Blue
    { name: 'LABELS', color: 7 },   // White
    { name: 'DIMS', color: 1 }      // Red/Amber
  ];

  for (const lyr of layers) {
    add(0, 'LAYER');
    add(2, lyr.name);
    add(70, 0);
    add(62, lyr.color);
    add(6, 'CONTINUOUS');
  }

  add(0, 'ENDTAB');
  add(0, 'ENDSEC');

  // ENTITIES
  add(0, 'SECTION');
  add(2, 'ENTITIES');

  // Helper for LWPOLYLINE
  const addPolyline = (layer: string, pts: Point[], closed = true) => {
    add(0, 'LWPOLYLINE');
    add(8, layer);
    add(90, pts.length);
    add(70, closed ? 1 : 0);
    for (const [x, y] of pts) {
      add(10, round2(x));
      add(20, round2(y));
    }
  };

  // Helper for TEXT
  const addText = (layer: string, text: string, x: number, y: number, height: number, rotation = 0) => {
    add(0, 'TEXT');
    add(8, layer);
    add(10, round2(x));
    add(20, round2(y));
    add(40, height);
    add(1, text);
    if (rotation !== 0) {
      add(50, rotation);
    }
    add(72, 1); // Center horizontal
    add(11, round2(x));
    add(21, round2(y));
  };

  // 1. Boundary
  addPolyline('BOUNDARY', sitePolygon, true);

  // 2. Roads
  for (const road of plan.roads) {
    addPolyline('ROADS', road.vertices, true);
    const c = polygonCentroid(road.vertices);
    addText('LABELS', road.name, c[0], c[1], 4.5);
  }

  // 3. Parks
  for (const park of plan.parks) {
    addPolyline('PARKS', park.vertices, true);
    const c = polygonCentroid(park.vertices);
    addText('LABELS', `${park.name} (${round2(park.areaGaj)} Gaj)`, c[0], c[1], 5.0);
  }

  // 4. Utilities
  for (const util of plan.utilities) {
    addPolyline('UTILITY', util.vertices, true);
    const c = polygonCentroid(util.vertices);
    addText('LABELS', `${util.name} (${util.purpose})`, c[0], c[1], 3.5);
  }

  // 5. Plots
  for (const plot of plan.plots) {
    const layer = plot.type === 'COM' ? 'PLOTS_COM' : (plot.premium ? 'PLOTS_PREMIUM' : 'PLOTS_RES');
    addPolyline(layer, plot.vertices, true);

    const c = polygonCentroid(plot.vertices);
    // Plot label
    addText('LABELS', plot.id, c[0], c[1] + 3.0, 3.2);
    addText('LABELS', `${round2(plot.areaGaj)} Gaj`, c[0], c[1] - 1.5, 2.4);
    addText('DIMS', `${toFtIn(plot.frontFt)} x ${toFtIn(plot.depthFt)}`, c[0], c[1] - 5.5, 2.0);
  }

  add(0, 'ENDSEC');
  add(0, 'EOF');

  return lines.join('\n');
}
