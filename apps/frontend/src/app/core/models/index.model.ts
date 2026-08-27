export interface IndexType {
  code: string;
  label: string;
  icon: string | null;
  color: string | null;
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export type IndexLevel = 'low' | 'medium' | 'high' | 'extreme';

export interface IndexAtAddress {
  code: string;
  label: string;
  icon: string | null;
  color: string | null;
  value: number;
  level: IndexLevel;
  zone: GeoJSONPolygon;
}

export interface ZoneIndexValue {
  code: string;
  label: string;
  icon: string | null;
  color: string | null;
  value: number;
  level: IndexLevel;
}

export interface IndexZoneGrid {
  id: string;
  cellX: number;
  cellY: number;
  zone: GeoJSONPolygon;
  values: ZoneIndexValue[];
}

export interface ZoneAlert {
  id: string;
  userId: string;
  zoneId: string;
  kind: 'index' | 'event';
  indexTypeId: number | null;
  eventId: string | null;
  value: number | null;
  message: string;
  read: boolean;
  alertDate: string | null;
  createdAt: string;
}

