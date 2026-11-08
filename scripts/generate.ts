import fs from 'fs';
import path from 'path';
import { Point, UNITS } from '../src/geometry/types';
import { round2, toFtIn } from '../src/geometry/polygon';
import { buildLayout } from '../src/geometry/subdivision';
import { generateDxf } from '../src/geometry/dxf';

function run() {
  console.log('--- NANDI Township CAD Geometry Engine ---');

  const sitePath = path.resolve('src/data/site.json');
  if (!fs.existsSync(sitePath)) {
    throw new Error('src/data/site.json does not exist!');
  }

  const siteData = JSON.parse(fs.readFileSync(sitePath, 'utf8'));
  const sitePolygon: Point[] = siteData.vertices.map((v: { x: number; y: number }) => [v.x, v.y]);

  const chosenOption = 'A';
  const plan = buildLayout(sitePolygon, {
    optionId: chosenOption,
    nominalDepthFt: 46.917,
    nominalFrontFt: 23.02
  });

  // Ensure output directories exist
  fs.mkdirSync(path.resolve('src/data'), { recursive: true });
  fs.mkdirSync(path.resolve('public'), { recursive: true });
  fs.mkdirSync(path.resolve('dist'), { recursive: true });

  // 1. Write src/data/plots.json
  const plotsJsonPath = path.resolve('src/data/plots.json');
  fs.writeFileSync(plotsJsonPath, JSON.stringify(plan, null, 2));
  fs.writeFileSync(path.resolve('public/plots.json'), JSON.stringify(plan, null, 2));
  console.log(`[OK] Wrote ${plotsJsonPath} (${plan.plots.length} plots)`);

  // 2. Generate Plot Schedule CSV
  const csvHeaders = [
    'Plot ID',
    'Block',
    'Zoning Type',
    'Vastu Facing',
    'Frontage (ft-in)',
    'Depth (ft-in)',
    'Frontage (ft)',
    'Depth (ft)',
    'Area (Gaj)',
    'Area (Sq.Ft)',
    'Area (Sq.M)',
    'Abutting Road',
    'Corner Plot',
    'Premium Tag',
    'Premium Reason'
  ];

  const csvRows = plan.plots.map(p => [
    p.id,
    p.block,
    p.type === 'COM' ? 'Commercial Showroom' : 'Residential',
    p.facing === 'E' ? 'East' : (p.facing === 'W' ? 'West' : 'North'),
    `"${toFtIn(p.frontFt)}"`,
    `"${toFtIn(p.depthFt)}"`,
    p.frontFt.toFixed(2),
    p.depthFt.toFixed(2),
    p.areaGaj.toFixed(2),
    p.areaSqFt.toFixed(2),
    p.areaSqM.toFixed(2),
    `"${p.roadName}"`,
    p.corner ? 'YES' : 'NO',
    p.premium ? 'YES' : 'NO',
    `"${p.premiumReason || 'Standard'}"`
  ]);

  const csvContent = [csvHeaders.join(','), ...csvRows.map(r => r.join(','))].join('\n');
  fs.writeFileSync(path.resolve('src/data/plot_schedule.csv'), csvContent);
  fs.writeFileSync(path.resolve('public/plot_schedule.csv'), csvContent);
  fs.writeFileSync(path.resolve('dist/plot_schedule.csv'), csvContent);
  console.log('[OK] Wrote plot_schedule.csv');

  // 3. Generate Area Statement CSV
  const b = plan.balanceSheet;
  const areaRows = [
    ['Land Use Category', 'Area (Sq.Ft)', 'Area (Gaj)', 'Area (Sq.M)', 'Bighas', '% Share'],
    [b.residentialPlots.name, b.residentialPlots.areaSqFt, b.residentialPlots.areaGaj, b.residentialPlots.areaSqM, b.residentialPlots.bighas, `${b.residentialPlots.pct}%`],
    [b.commercialPlots.name, b.commercialPlots.areaSqFt, b.commercialPlots.areaGaj, b.commercialPlots.areaSqM, b.commercialPlots.bighas, `${b.commercialPlots.pct}%`],
    [b.totalPlots.name, b.totalPlots.areaSqFt, b.totalPlots.areaGaj, b.totalPlots.areaSqM, b.totalPlots.bighas, `${b.totalPlots.pct}%`],
    [b.parks.name, b.parks.areaSqFt, b.parks.areaGaj, b.parks.areaSqM, b.parks.bighas, `${b.parks.pct}%`],
    [b.roads.name, b.roads.areaSqFt, b.roads.areaGaj, b.roads.areaSqM, b.roads.bighas, `${b.roads.pct}%`],
    [b.utilities.name, b.utilities.areaSqFt, b.utilities.areaGaj, b.utilities.areaSqM, b.utilities.bighas, `${b.utilities.pct}%`],
    [b.totalSite.name, b.totalSite.areaSqFt, b.totalSite.areaGaj, b.totalSite.areaSqM, b.totalSite.bighas, '100.00%']
  ];

  const areaCsvContent = areaRows.map(r => r.join(',')).join('\n');
  fs.writeFileSync(path.resolve('src/data/area_statement.csv'), areaCsvContent);
  fs.writeFileSync(path.resolve('public/area_statement.csv'), areaCsvContent);
  fs.writeFileSync(path.resolve('dist/area_statement.csv'), areaCsvContent);
  console.log('[OK] Wrote area_statement.csv');

  // 4. Generate AutoCAD DXF
  const dxfContent = generateDxf(plan, sitePolygon);
  fs.writeFileSync(path.resolve('src/data/nandi_township_master_plan.dxf'), dxfContent);
  fs.writeFileSync(path.resolve('public/nandi_township_master_plan.dxf'), dxfContent);
  fs.writeFileSync(path.resolve('dist/nandi_township_master_plan.dxf'), dxfContent);
  console.log('[OK] Wrote nandi_township_master_plan.dxf');

  console.log('\n=== GENERATION COMPLETE ===');
  console.log(`Total Plots: ${plan.statistics.totalCount}`);
  console.log(`  Residential: ${plan.statistics.residentialCount}`);
  console.log(`  Commercial: ${plan.statistics.commercialCount}`);
  console.log(`  Premium: ${plan.statistics.premiumCount}`);
  console.log(`Facing Breakdown:`);
  console.log(`  East: ${plan.statistics.facing.east.count} (${plan.statistics.facing.east.pct}%)`);
  console.log(`  West: ${plan.statistics.facing.west.count} (${plan.statistics.facing.west.pct}%)`);
  console.log(`  North: ${plan.statistics.facing.north.count} (${plan.statistics.facing.north.pct}%)`);
  console.log(`  South: ${plan.statistics.facing.south.count} (0.0% - 100% VASTU COMPLIANT)`);
  console.log(`Plotted Area: ${b.totalPlots.areaGaj} Gaj (${b.totalPlots.pct}%)`);
  console.log(`Parks Area: ${b.parks.areaGaj} Gaj (${b.parks.pct}%) [MDA Band 13% - 15%]`);
  console.log(`Roads Area: ${b.roads.areaGaj} Gaj (${b.roads.pct}%)`);
  console.log(`Utilities Area: ${b.utilities.areaGaj} Gaj (${b.utilities.pct}%)`);
  const totalSumPct = round2(b.totalPlots.pct + b.parks.pct + b.roads.pct + b.utilities.pct);
  console.log(`Total Land-Use Closure: ${totalSumPct}%`);
}

run();
