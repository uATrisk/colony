import { PlotRecord } from './types';

export function determineFacing(
  frontSide: 'EAST' | 'WEST' | 'NORTH' | 'SOUTH'
): 'E' | 'W' | 'N' {
  if (frontSide === 'SOUTH') {
    throw new Error('Vastu violation: South-facing plot is strictly prohibited.');
  }
  switch (frontSide) {
    case 'EAST':
      return 'E';
    case 'WEST':
      return 'W';
    case 'NORTH':
      return 'N';
  }
}

export function evaluatePremium(
  isCorner: boolean,
  facingPark: boolean,
  on12mSpine: boolean,
  isCommercial: boolean
): { premium: boolean; reason: string | null } {
  if (isCommercial) {
    return { premium: true, reason: 'Prime Commercial Showroom Frontage' };
  }
  const reasons: string[] = [];
  if (isCorner) reasons.push('Corner Plot with Dual Open Air');
  if (facingPark) reasons.push('Direct Park Facing');
  if (on12mSpine) reasons.push('12.0m Boulevard Frontage');

  if (reasons.length > 0) {
    return { premium: true, reason: reasons.join(' & ') };
  }
  return { premium: false, reason: null };
}

export function validateVastuCompliance(plots: PlotRecord[]): {
  compliant: boolean;
  eastCount: number;
  westCount: number;
  northCount: number;
  southCount: number;
} {
  let eastCount = 0;
  let westCount = 0;
  let northCount = 0;
  let southCount = 0;

  for (const plot of plots) {
    if (plot.facing === 'E') eastCount++;
    else if (plot.facing === 'W') westCount++;
    else if (plot.facing === 'N') northCount++;
    else southCount++;
  }

  return {
    compliant: southCount === 0,
    eastCount,
    westCount,
    northCount,
    southCount
  };
}
