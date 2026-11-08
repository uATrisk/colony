export type Point = [number, number];
export type Polygon = Point[];

export const UNITS = {
  FT_TO_M: 0.3048,
  M_TO_FT: 1 / 0.3048,
  SQFT_TO_SQM: 0.3048 * 0.3048,
  SQM_TO_SQFT: 10.7639,
  GAJ_TO_SQFT: 9.0,
  SQFT_TO_GAJ: 1 / 9.0,
  GAJ_TO_SQM: 0.836127,
  SQM_TO_GAJ: 1 / 0.836127,
  BIGHA_TO_GAJ: 31412.06 / 38.45 // 816.9586475942782
};

export interface PlotRecord {
  id: string;
  plotNo: number;
  block: string;
  type: 'RES' | 'COM';
  premium: boolean;
  premiumReason: string | null;
  vertices: Point[];
  frontFt: number;
  depthFt: number;
  areaSqFt: number;
  areaGaj: number;
  areaSqM: number;
  facing: 'E' | 'W' | 'N';
  roadName: string;
  corner: boolean;
  irregular: boolean;
}

export interface RoadRecord {
  id: string;
  name: string;
  role: 'SPINE' | 'AVENUE' | 'LOOP' | 'JUNCTION';
  widthFt: number;
  widthM: number;
  vertices: Point[];
  areaSqFt: number;
  areaGaj: number;
  areaSqM: number;
}

export interface ParkRecord {
  id: string;
  name: string;
  type: 'CENTRAL' | 'BUFFER' | 'FRONT' | 'POCKET';
  vertices: Point[];
  areaSqFt: number;
  areaGaj: number;
  areaSqM: number;
  pct: number;
}

export interface UtilityRecord {
  id: string;
  name: string;
  purpose: string;
  vertices: Point[];
  areaSqFt: number;
  areaGaj: number;
  areaSqM: number;
  pct: number;
}

export interface LandUseCategory {
  name: string;
  areaSqFt: number;
  areaGaj: number;
  areaSqM: number;
  bighas: number;
  pct: number;
}

export interface LandUseBalanceSheet {
  residentialPlots: LandUseCategory;
  commercialPlots: LandUseCategory;
  totalPlots: LandUseCategory;
  parks: LandUseCategory;
  roads: LandUseCategory;
  utilities: LandUseCategory;
  totalSite: LandUseCategory;
}

export interface PlotStatistics {
  totalCount: number;
  residentialCount: number;
  commercialCount: number;
  premiumCount: number;
  irregularCount: number;
  facing: {
    east: { count: number; pct: number };
    west: { count: number; pct: number };
    north: { count: number; pct: number };
    south: { count: number; pct: number };
  };
  areaGaj: { min: number; avg: number; max: number };
  frontFt: { min: number; avg: number; max: number };
  depthFt: { min: number; avg: number; max: number };
}

export interface LayoutOptionSummary {
  optionId: 'A' | 'B' | 'C' | 'D';
  name: string;
  nominalDepthFt: number;
  nominalFrontFt: number;
  nominalDepthFtIn: string;
  nominalFrontFtIn: string;
  plotCount: {
    total: number;
    residential: number;
    commercial: number;
    premium: number;
  };
  plottedAreaGaj: number;
  plottedPct: number;
  roadPct: number;
  parkPct: number;
  utilityPct: number;
  avenueCount: number;
  facing: {
    east: number;
    west: number;
    north: number;
    south: number;
  };
}

export interface MasterPlanOutput {
  generatedAt: string;
  chosenOption: 'A' | 'B' | 'C' | 'D';
  optionsComparison: LayoutOptionSummary[];
  siteArea: {
    sqFt: number;
    gaj: number;
    sqM: number;
    bighas: number;
  };
  balanceSheet: LandUseBalanceSheet;
  statistics: PlotStatistics;
  plots: PlotRecord[];
  roads: RoadRecord[];
  parks: ParkRecord[];
  utilities: UtilityRecord[];
}
