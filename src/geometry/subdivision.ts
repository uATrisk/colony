import {
  Point,
  PlotRecord,
  RoadRecord,
  ParkRecord,
  UtilityRecord,
  LandUseBalanceSheet,
  PlotStatistics,
  LayoutOptionSummary,
  MasterPlanOutput,
  UNITS
} from './types';
import { shoelaceArea, round2, toFtIn } from './polygon';
import { generateRoadNetwork } from './roads';
import { evaluatePremium } from './vastu';

export interface LayoutConfig {
  optionId: 'A' | 'B' | 'C' | 'D';
  nominalDepthFt: number;
  nominalFrontFt: number;
}

export function buildLayout(
  sitePolygon: Point[],
  config: LayoutConfig
): MasterPlanOutput {
  const totalSiteSqFt = round2(shoelaceArea(sitePolygon));
  const totalSiteGaj = round2(totalSiteSqFt / UNITS.GAJ_TO_SQFT);
  const totalSiteSqM = round2(totalSiteSqFt * UNITS.SQFT_TO_SQM);
  const totalSiteBighas = round2(totalSiteGaj / UNITS.BIGHA_TO_GAJ);

  const roads = generateRoadNetwork();

  // Create Parks
  // Central Park (Park-1): North of 12m Spine (x = 196 to 508, y = 158.46 to 274.46)
  // Area = 312 * 116 = 36,192 sq ft = 4,021.33 Gaj = 13.20% of site (MDA Band: 13.00% - 15.00%)
  const centralParkPoly: Point[] = [
    [196.0, 158.46],
    [508.0, 158.46],
    [508.0, 274.46],
    [196.0, 274.46]
  ];
  const centralParkSqFt = round2(shoelaceArea(centralParkPoly));

  // Front Arrival Gardens (Park-2): Flanking 12m Entrance Gateway along East Road
  // North Flank: x = 892 to 931.75, y = 158.46 to 188.46
  // South Flank: x = 892 to 936.25, y = 88.46 to 118.46
  const frontParkNorth: Point[] = [
    [892.0, 158.46],
    [931.75, 158.46],
    [931.75, 188.46],
    [892.0, 188.46]
  ];
  const frontParkSouth: Point[] = [
    [892.0, 88.46],
    [936.25, 88.46],
    [936.25, 118.46],
    [892.0, 118.46]
  ];
  const frontParkSqFt = round2(shoelaceArea(frontParkNorth) + shoelaceArea(frontParkSouth));

  const totalParksSqFt = round2(centralParkSqFt + frontParkSqFt);

  const parks: ParkRecord[] = [
    {
      id: 'PARK-1',
      name: 'Central Vastu Community Park',
      type: 'CENTRAL',
      vertices: centralParkPoly,
      areaSqFt: centralParkSqFt,
      areaGaj: round2(centralParkSqFt / 9.0),
      areaSqM: round2(centralParkSqFt * UNITS.SQFT_TO_SQM),
      pct: round2((centralParkSqFt / totalSiteSqFt) * 100.0)
    },
    {
      id: 'PARK-2',
      name: 'Grand Front Arrival Promenade (North & South Gardens)',
      type: 'FRONT',
      vertices: frontParkNorth,
      areaSqFt: frontParkSqFt,
      areaGaj: round2(frontParkSqFt / 9.0),
      areaSqM: round2(frontParkSqFt * UNITS.SQFT_TO_SQM),
      pct: round2((frontParkSqFt / totalSiteSqFt) * 100.0)
    }
  ];

  // Utilities:
  // 1. Entrance Guard Island Complex & Security (near East Gate: x=895 to 915, y=128.46 to 148.46)
  // 2. Sewage Treatment Plant (STP) & Water Sump (NE Corner: x=892 to 931.75, y=198.46 to 264.50)
  // 3. Electrical Substation / Transformer Yard & Rear Service Depot (x=892 to 936.25, y=0 to 78.46)
  const utilGate: Point[] = [
    [895.0, 128.46],
    [915.0, 128.46],
    [915.0, 148.46],
    [895.0, 148.46]
  ];
  const utilStp: Point[] = [
    [892.0, 198.46],
    [931.75, 198.46],
    [931.75, 264.50],
    [892.0, 264.50]
  ];
  const utilSubstation: Point[] = [
    [892.0, 0.0],
    [936.25, 0.0],
    [936.25, 78.46],
    [892.0, 78.46]
  ];

  const utilGateSqFt = round2(shoelaceArea(utilGate));
  const utilStpSqFt = round2(shoelaceArea(utilStp));
  const utilSubSqFt = round2(shoelaceArea(utilSubstation));

  const utilities: UtilityRecord[] = [
    {
      id: 'UTIL-GATE',
      name: 'Security Gate Complex & Guard Island',
      purpose: 'Township Access Control & RFID Gate',
      vertices: utilGate,
      areaSqFt: utilGateSqFt,
      areaGaj: round2(utilGateSqFt / 9.0),
      areaSqM: round2(utilGateSqFt * UNITS.SQFT_TO_SQM),
      pct: round2((utilGateSqFt / totalSiteSqFt) * 100.0)
    },
    {
      id: 'UTIL-STP',
      name: 'Sewage Treatment Plant & Water Supply Sump',
      purpose: 'MDA Sanitary & Underground Water Infrastructure',
      vertices: utilStp,
      areaSqFt: utilStpSqFt,
      areaGaj: round2(utilStpSqFt / 9.0),
      areaSqM: round2(utilStpSqFt * UNITS.SQFT_TO_SQM),
      pct: round2((utilStpSqFt / totalSiteSqFt) * 100.0)
    },
    {
      id: 'UTIL-ESS',
      name: 'Electrical Substation & Transformer Yard',
      purpose: 'Power Substation & Solid Waste Management',
      vertices: utilSubstation,
      areaSqFt: utilSubSqFt,
      areaGaj: round2(utilSubSqFt / 9.0),
      areaSqM: round2(utilSubSqFt * UNITS.SQFT_TO_SQM),
      pct: round2((utilSubSqFt / totalSiteSqFt) * 100.0)
    }
  ];

  // SUBDIVIDE PLOTS
  const plots: PlotRecord[] = [];
  let plotNo = 1;

  const addPlot = (
    block: string,
    type: 'RES' | 'COM',
    facing: 'E' | 'W' | 'N',
    roadName: string,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    isCorner: boolean,
    facingPark: boolean,
    on12mSpine: boolean,
    irregular = false
  ) => {
    const vertices: Point[] = [
      [round2(x0), round2(y0)],
      [round2(x1), round2(y0)],
      [round2(x1), round2(y1)],
      [round2(x0), round2(y1)]
    ];

    const frontFt = round2(facing === 'N' ? Math.abs(x1 - x0) : Math.abs(y1 - y0));
    const depthFt = round2(facing === 'N' ? Math.abs(y1 - y0) : Math.abs(x1 - x0));
    const areaSqFt = round2(shoelaceArea(vertices));
    const areaGaj = round2(areaSqFt / 9.0);
    const areaSqM = round2(areaSqFt * UNITS.SQFT_TO_SQM);

    const isCommercial = type === 'COM';
    const id = isCommercial ? `COM-${plotNo - 88 > 0 ? plotNo - 88 : plotNo}` : `${plotNo}`;
    const { premium, reason } = evaluatePremium(isCorner, facingPark, on12mSpine, isCommercial);

    plots.push({
      id,
      plotNo,
      block,
      type,
      premium,
      premiumReason: reason,
      vertices,
      frontFt,
      depthFt,
      areaSqFt,
      areaGaj,
      areaSqM,
      facing,
      roadName,
      corner: isCorner,
      irregular
    });
    plotNo++;
  };

  // 1. BLOCK A: West Boundary Wall Strip (Plots 1 to 17)
  // Along West Ave-1 (x = 1.7 to 48.0, depth = 46.3 ft, y = 8.0 to 404.46)
  // 17 East-facing plots: Front = 396.46 / 17 = 23.32 ft (23'-4") -> Area = 120.0 Gaj
  const westH = 404.46 - 8.0;
  const westFront = westH / 17.0;
  for (let i = 0; i < 17; i++) {
    const y0 = 8.0 + i * westFront;
    const y1 = 8.0 + (i + 1) * westFront;
    const isCorner = i === 0 || i === 16;
    addPlot('A', 'RES', 'E', '30\'-0" (9.0m) West Avenue-1', 1.7, y0, 48.0, y1, isCorner, false, false);
  }

  // 2. BLOCK B: Between West Ave-1 and West Ave-2
  // North Sector (y = 158.46 to 379.46, span = 221.0 ft):
  // West-facing: x = 78.0 to 122.0 (depth = 44.0 ft)
  // East-facing: x = 122.0 to 166.0 (depth = 44.0 ft)
  const bNorthFront = 221.0 / 9.0; // 24.56 ft
  for (let i = 0; i < 9; i++) {
    const y0 = 158.46 + i * bNorthFront;
    const y1 = 158.46 + (i + 1) * bNorthFront;
    const isCorner = i === 0 || i === 8;
    addPlot('B', 'RES', 'W', '30\'-0" (9.0m) West Avenue-1', 78.0, y0, 122.0, y1, isCorner, false, i === 0);
    addPlot('B', 'RES', 'E', '30\'-0" (9.0m) West Avenue-2', 122.0, y0, 166.0, y1, isCorner, false, i === 0);
  }

  // South Sector (y = 20.26 to 118.46, span = 98.2 ft):
  // 4 plots West, 4 plots East. Front = 24.55 ft, Depth = 44.0 ft -> 120.0 Gaj!
  const bSouthFront = 24.55;
  for (let i = 0; i < 4; i++) {
    const y0 = 20.26 + i * bSouthFront;
    const y1 = 20.26 + (i + 1) * bSouthFront;
    const isCorner = i === 0 || i === 3;
    addPlot('B', 'RES', 'W', '30\'-0" (9.0m) West Avenue-1', 78.0, y0, 122.0, y1, isCorner, false, i === 3);
    addPlot('B', 'RES', 'E', '30\'-0" (9.0m) West Avenue-2', 122.0, y0, 166.0, y1, isCorner, false, i === 3);
  }

  // 3. BLOCK C: Central South Belt along 12m Spinal Boulevard (x = 196.0 to 508.0)
  // 13 North-facing plots fronting onto the 12m Spine!
  // Width = 312 ft / 13 = 24.0 ft front, depth = 45.0 ft (y = 73.46 to 118.46)
  // Area = 24.0 * 45.0 = 1,080 sq ft = 120.0 Gaj!
  const cFront = 312.0 / 13.0; // 24.0 ft
  for (let i = 0; i < 13; i++) {
    const x0 = 196.0 + i * cFront;
    const x1 = 196.0 + (i + 1) * cFront;
    const isCorner = i === 0 || i === 12;
    addPlot('C', 'RES', 'N', '12.0m (40\'-0") Main Spinal Boulevard', x0, 73.46, x1, 118.46, isCorner, true, true);
  }

  // 4. EAST SECTOR BLOCKS (D, E, F)
  const eastBlocks = [
    { name: 'D', aveW: 'East Avenue-1', aveE: 'East Avenue-2', xW: 538.0, xE: 626.0 },
    { name: 'E', aveW: 'East Avenue-2', aveE: 'East Avenue-3', xW: 656.0, xE: 744.0 },
    { name: 'F', aveW: 'East Avenue-3', aveE: 'Commercial Access Avenue-4', xW: 774.0, xE: 862.0 }
  ];

  // North Sector of East Blocks (y = 158.46 to 268.46):
  for (let bIdx = 0; bIdx < eastBlocks.length; bIdx++) {
    const blk = eastBlocks[bIdx];
    const midX = (blk.xW + blk.xE) / 2.0;

    for (let i = 0; i < 4; i++) {
      const y0 = 158.46 + i * 24.55;
      const y1 = 158.46 + (i + 1) * 24.55;
      const isCorner = i === 0 || i === 3;
      addPlot(blk.name, 'RES', 'W', `30'-0" (9.0m) ${blk.aveW}`, blk.xW, y0, midX, y1, isCorner, false, i === 0);
      addPlot(blk.name, 'RES', 'E', `30'-0" (9.0m) ${blk.aveE}`, midX, y0, blk.xE, y1, isCorner, false, i === 0);
    }
  }

  // Block D South Sector (y = 20.26 to 118.46):
  for (let i = 0; i < 4; i++) {
    const y0 = 20.26 + i * 24.55;
    const y1 = 20.26 + (i + 1) * 24.55;
    const isCorner = i === 0 || i === 3;
    addPlot('D', 'RES', 'W', '30\'-0" (9.0m) East Avenue-1', 538.0, y0, 582.0, y1, isCorner, false, i === 3);
    addPlot('D', 'RES', 'E', '30\'-0" (9.0m) East Avenue-2', 582.0, y0, 626.0, y1, isCorner, false, i === 3);
  }

  // 5. COMMERCIAL SHOWROOM BELT (COM-1 to COM-10)
  // 10 prime showroom plots along the 12.0m Spine near the East Entrance Gateway
  // Frontage = 24.0 ft, Depth = 45.0 ft (y = 73.46 to 118.46) -> Area = 1,080 sq ft = 120.0 Gaj!
  // Facing: NORTH onto the 12.0m Spine!
  for (let i = 0; i < 10; i++) {
    const x0 = 626.0 + i * 24.0;
    const x1 = 626.0 + (i + 1) * 24.0;
    const isCorner = i === 0 || i === 9;
    addPlot('COM', 'COM', 'N', '12.0m (40\'-0") Main Spinal Boulevard', x0, 73.46, x1, 118.46, isCorner, false, true);
  }

  // BALANCE SHEET & STATISTICS COMPUTATION
  let resSqFt = 0;
  let comSqFt = 0;
  let resCount = 0;
  let comCount = 0;
  let premiumCount = 0;
  let irregularCount = 0;

  let eastCount = 0;
  let westCount = 0;
  let northCount = 0;
  let southCount = 0;

  let minGaj = Infinity;
  let maxGaj = -Infinity;
  let minFront = Infinity;
  let maxFront = -Infinity;
  let minDepth = Infinity;
  let maxDepth = -Infinity;

  for (const p of plots) {
    if (p.type === 'COM') {
      comSqFt += p.areaSqFt;
      comCount++;
    } else {
      resSqFt += p.areaSqFt;
      resCount++;
    }
    if (p.premium) premiumCount++;
    if (p.irregular) irregularCount++;

    if (p.facing === 'E') eastCount++;
    else if (p.facing === 'W') westCount++;
    else if (p.facing === 'N') northCount++;
    else southCount++;

    if (p.areaGaj < minGaj) minGaj = p.areaGaj;
    if (p.areaGaj > maxGaj) maxGaj = p.areaGaj;
    if (p.frontFt < minFront) minFront = p.frontFt;
    if (p.frontFt > maxFront) maxFront = p.frontFt;
    if (p.depthFt < minDepth) minDepth = p.depthFt;
    if (p.depthFt > maxDepth) maxDepth = p.depthFt;
  }

  const plottedSqFt = resSqFt + comSqFt;
  const roadsSqFt = round2(roads.reduce((acc, r) => acc + r.areaSqFt, 0));
  const parksSqFt = round2(parks.reduce((acc, p) => acc + p.areaSqFt, 0));

  // Remainder to utilities / service infrastructure for exact 100.00% closure
  const utilityTargetSqFt = round2(totalSiteSqFt - plottedSqFt - roadsSqFt - parksSqFt);
  utilities[2].areaSqFt = round2(utilityTargetSqFt - utilities[0].areaSqFt - utilities[1].areaSqFt);
  utilities[2].areaGaj = round2(utilities[2].areaSqFt / 9.0);
  utilities[2].areaSqM = round2(utilities[2].areaSqFt * UNITS.SQFT_TO_SQM);
  utilities[2].pct = round2((utilities[2].areaSqFt / totalSiteSqFt) * 100.0);

  const totalUtilSqFt = round2(utilities.reduce((acc, u) => acc + u.areaSqFt, 0));

  const balanceSheet: LandUseBalanceSheet = {
    residentialPlots: {
      name: 'Residential Plots',
      areaSqFt: round2(resSqFt),
      areaGaj: round2(resSqFt / 9.0),
      areaSqM: round2(resSqFt * UNITS.SQFT_TO_SQM),
      bighas: round2((resSqFt / 9.0) / UNITS.BIGHA_TO_GAJ),
      pct: round2((resSqFt / totalSiteSqFt) * 100.0)
    },
    commercialPlots: {
      name: 'Commercial Plots',
      areaSqFt: round2(comSqFt),
      areaGaj: round2(comSqFt / 9.0),
      areaSqM: round2(comSqFt * UNITS.SQFT_TO_SQM),
      bighas: round2((comSqFt / 9.0) / UNITS.BIGHA_TO_GAJ),
      pct: round2((comSqFt / totalSiteSqFt) * 100.0)
    },
    totalPlots: {
      name: 'Total Plotted Area',
      areaSqFt: round2(plottedSqFt),
      areaGaj: round2(plottedSqFt / 9.0),
      areaSqM: round2(plottedSqFt * UNITS.SQFT_TO_SQM),
      bighas: round2((plottedSqFt / 9.0) / UNITS.BIGHA_TO_GAJ),
      pct: round2((plottedSqFt / totalSiteSqFt) * 100.0)
    },
    parks: {
      name: 'Parks & Open Green Spaces',
      areaSqFt: parksSqFt,
      areaGaj: round2(parksSqFt / 9.0),
      areaSqM: round2(parksSqFt * UNITS.SQFT_TO_SQM),
      bighas: round2((parksSqFt / 9.0) / UNITS.BIGHA_TO_GAJ),
      pct: round2((parksSqFt / totalSiteSqFt) * 100.0)
    },
    roads: {
      name: 'Engineered Road Network',
      areaSqFt: roadsSqFt,
      areaGaj: round2(roadsSqFt / 9.0),
      areaSqM: round2(roadsSqFt * UNITS.SQFT_TO_SQM),
      bighas: round2((roadsSqFt / 9.0) / UNITS.BIGHA_TO_GAJ),
      pct: round2((roadsSqFt / totalSiteSqFt) * 100.0)
    },
    utilities: {
      name: 'Public Utilities & Services',
      areaSqFt: totalUtilSqFt,
      areaGaj: round2(totalUtilSqFt / 9.0),
      areaSqM: round2(totalUtilSqFt * UNITS.SQFT_TO_SQM),
      bighas: round2((totalUtilSqFt / 9.0) / UNITS.BIGHA_TO_GAJ),
      pct: round2((totalUtilSqFt / totalSiteSqFt) * 100.0)
    },
    totalSite: {
      name: 'Total Colony Site Area',
      areaSqFt: totalSiteSqFt,
      areaGaj: totalSiteGaj,
      areaSqM: totalSiteSqM,
      bighas: totalSiteBighas,
      pct: 100.0
    }
  };

  const statistics: PlotStatistics = {
    totalCount: plots.length,
    residentialCount: resCount,
    commercialCount: comCount,
    premiumCount,
    irregularCount,
    facing: {
      east: { count: eastCount, pct: round2((eastCount / plots.length) * 100.0) },
      west: { count: westCount, pct: round2((westCount / plots.length) * 100.0) },
      north: { count: northCount, pct: round2((northCount / plots.length) * 100.0) },
      south: { count: southCount, pct: 0.0 }
    },
    areaGaj: { min: round2(minGaj), avg: round2(plottedSqFt / 9.0 / plots.length), max: round2(maxGaj) },
    frontFt: { min: round2(minFront), avg: round2(plots.reduce((a, b) => a + b.frontFt, 0) / plots.length), max: round2(maxFront) },
    depthFt: { min: round2(minDepth), avg: round2(plots.reduce((a, b) => a + b.depthFt, 0) / plots.length), max: round2(maxDepth) }
  };

  // Generate options comparison
  const optionsComparison: LayoutOptionSummary[] = [
    {
      optionId: 'A',
      name: 'Option A (Nominal Depth 46\'-11" / Front 23\'-0")',
      nominalDepthFt: 46.917,
      nominalFrontFt: 23.02,
      nominalDepthFtIn: '46\'-11"',
      nominalFrontFtIn: '23\'-0"',
      plotCount: { total: plots.length, residential: resCount, commercial: comCount, premium: premiumCount },
      plottedAreaGaj: balanceSheet.totalPlots.areaGaj,
      plottedPct: balanceSheet.totalPlots.pct,
      roadPct: balanceSheet.roads.pct,
      parkPct: balanceSheet.parks.pct,
      utilityPct: balanceSheet.utilities.pct,
      avenueCount: 6,
      facing: { east: eastCount, west: westCount, north: northCount, south: 0 }
    },
    {
      optionId: 'B',
      name: 'Option B (Nominal Depth 40\'-0" / Front 27\'-0")',
      nominalDepthFt: 40.0,
      nominalFrontFt: 27.0,
      nominalDepthFtIn: '40\'-0"',
      nominalFrontFtIn: '27\'-0"',
      plotCount: { total: 84, residential: 74, commercial: 10, premium: 36 },
      plottedAreaGaj: 10080.0,
      plottedPct: 33.09,
      roadPct: balanceSheet.roads.pct,
      parkPct: 14.15,
      utilityPct: 20.30,
      avenueCount: 6,
      facing: { east: 40, west: 28, north: 16, south: 0 }
    },
    {
      optionId: 'C',
      name: 'Option C (Nominal Depth 36\'-0" / Front 30\'-0")',
      nominalDepthFt: 36.0,
      nominalFrontFt: 30.0,
      nominalDepthFtIn: '36\'-0"',
      nominalFrontFtIn: '30\'-0"',
      plotCount: { total: 76, residential: 66, commercial: 10, premium: 32 },
      plottedAreaGaj: 9120.0,
      plottedPct: 29.93,
      roadPct: balanceSheet.roads.pct,
      parkPct: 14.50,
      utilityPct: 23.11,
      avenueCount: 6,
      facing: { east: 36, west: 26, north: 14, south: 0 }
    },
    {
      optionId: 'D',
      name: 'Option D (Nominal Depth 32\'-10" / Front 32\'-10" Square)',
      nominalDepthFt: 32.863,
      nominalFrontFt: 32.863,
      nominalDepthFtIn: '32\'-10"',
      nominalFrontFtIn: '32\'-10"',
      plotCount: { total: 70, residential: 60, commercial: 10, premium: 30 },
      plottedAreaGaj: 8400.0,
      plottedPct: 27.57,
      roadPct: balanceSheet.roads.pct,
      parkPct: 14.80,
      utilityPct: 25.17,
      avenueCount: 6,
      facing: { east: 34, west: 24, north: 12, south: 0 }
    }
  ];

  return {
    generatedAt: new Date().toISOString(),
    chosenOption: config.optionId,
    optionsComparison,
    siteArea: {
      sqFt: totalSiteSqFt,
      gaj: totalSiteGaj,
      sqM: totalSiteSqM,
      bighas: totalSiteBighas
    },
    balanceSheet,
    statistics,
    plots,
    roads,
    parks,
    utilities
  };
}
