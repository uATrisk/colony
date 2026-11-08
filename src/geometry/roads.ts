import { Point, RoadRecord, UNITS } from './types';
import { shoelaceArea, round2 } from './polygon';

export interface RoadSpec {
  id: string;
  name: string;
  role: 'SPINE' | 'AVENUE' | 'LOOP' | 'JUNCTION';
  widthFt: number;
  widthM: number;
  vertices: Point[];
}

export function generateRoadNetwork(): RoadRecord[] {
  const rawRoads: RoadSpec[] = [
    {
      id: 'ROAD-12M-SPINE',
      name: '12.0m (40\'-0") Main Spinal Boulevard',
      role: 'SPINE',
      widthFt: 40.0,
      widthM: 12.0,
      vertices: [
        [48.0, 118.46],
        [936.25, 118.46],
        [931.75, 158.46],
        [48.0, 158.46]
      ]
    },
    {
      id: 'ROAD-WEST-AVE-1',
      name: '30\'-0" (9.0m) West Avenue-1',
      role: 'AVENUE',
      widthFt: 30.0,
      widthM: 9.0,
      vertices: [
        [48.0, 8.0],
        [78.0, 8.0],
        [78.0, 404.46],
        [48.0, 404.46]
      ]
    },
    {
      id: 'ROAD-NORTH-LOOP',
      name: '25\'-0" (7.62m) North Circulatory Loop Road',
      role: 'LOOP',
      widthFt: 25.0,
      widthM: 7.62,
      vertices: [
        [78.0, 379.46],
        [166.0, 379.46],
        [166.0, 404.46],
        [78.0, 404.46]
      ]
    },
    {
      id: 'ROAD-WEST-AVE-2',
      name: '30\'-0" (9.0m) West Avenue-2',
      role: 'AVENUE',
      widthFt: 30.0,
      widthM: 9.0,
      vertices: [
        [166.0, 8.0],
        [196.0, 8.0],
        [196.0, 404.46],
        [166.0, 404.46]
      ]
    },
    {
      id: 'ROAD-EAST-AVE-1',
      name: '30\'-0" (9.0m) East Avenue-1',
      role: 'AVENUE',
      widthFt: 30.0,
      widthM: 9.0,
      vertices: [
        [508.0, 0.0],
        [538.0, 0.0],
        [538.0, 274.46],
        [508.0, 274.46]
      ]
    },
    {
      id: 'ROAD-EAST-AVE-2',
      name: '30\'-0" (9.0m) East Avenue-2',
      role: 'AVENUE',
      widthFt: 30.0,
      widthM: 9.0,
      vertices: [
        [626.0, 0.0],
        [656.0, 0.0],
        [656.0, 268.46],
        [626.0, 268.46]
      ]
    },
    {
      id: 'ROAD-EAST-AVE-3',
      name: '30\'-0" (9.0m) East Avenue-3',
      role: 'AVENUE',
      widthFt: 30.0,
      widthM: 9.0,
      vertices: [
        [744.0, 118.46],
        [774.0, 118.46],
        [774.0, 268.46],
        [744.0, 268.46]
      ]
    },
    {
      id: 'ROAD-EAST-AVE-4',
      name: '30\'-0" (9.0m) Commercial Access Avenue-4',
      role: 'AVENUE',
      widthFt: 30.0,
      widthM: 9.0,
      vertices: [
        [862.0, 0.0],
        [892.0, 0.0],
        [892.0, 268.46],
        [862.0, 268.46]
      ]
    },
    {
      id: 'ROAD-COM-SERVICE',
      name: '30\'-0" (9.0m) Commercial Rear Loading & Service Promenade',
      role: 'AVENUE',
      widthFt: 30.0,
      widthM: 9.0,
      vertices: [
        [656.0, 43.46],
        [862.0, 43.46],
        [862.0, 73.46],
        [656.0, 73.46]
      ]
    }
  ];

  return rawRoads.map(r => {
    const areaSqFt = round2(shoelaceArea(r.vertices));
    const areaGaj = round2(areaSqFt / 9.0);
    const areaSqM = round2(areaSqFt * UNITS.SQFT_TO_SQM);
    return {
      id: r.id,
      name: r.name,
      role: r.role,
      widthFt: r.widthFt,
      widthM: r.widthM,
      vertices: r.vertices,
      areaSqFt,
      areaGaj,
      areaSqM
    };
  });
}
