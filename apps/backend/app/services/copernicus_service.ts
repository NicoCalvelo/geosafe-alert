// ── Types pour les données mock ─────────────────────────────

interface CopernicusFrame {
  Time: string
  GeoFootprint: GeoJSON
  Properties?: Record<string, any>
}

interface GeoJSON {
  type: 'Point' | 'Polygon' | 'MultiPolygon'
  coordinates: any
}

export interface CopernicusEvent {
  Id: string
  Name: string
  AlertCode: string
  Description: string
  ContentDate: { Start: string; End: string | null }
  Status: string
  Level: number
  GeoFootprint: GeoJSON
  Attributes: Record<string, any>
  Frames?: CopernicusFrame[]
}

// ── Service ─────────────────────────────────────────────────

export default class CopernicusService {
  public async fetchLatestEvents(): Promise<CopernicusEvent[]> {
    return [
      // ────────────────────────────────────────────────────
      // 1. FIRE — Toulouse — 10 frames sur ~24h (feu qui s'étend)
      // ────────────────────────────────────────────────────
      {
        Id: 'e812967-3312-4a01-fire-toulouse',
        Name: 'S2B_MSIL2A_20260405T10_Toulouse_Fire',
        AlertCode: 'fire',
        Description: 'Fire detected near Toulouse (Ile du Ramier)',
        ContentDate: {
          Start: '2026-04-05T10:30:00.000Z',
          End: null,
        },
        Status: 'active',
        Level: 4,
        GeoFootprint: {
          type: 'Polygon' as const,
          coordinates: [
            [
              [1.4253, 43.5767],
              [1.4435, 43.5767],
              [1.4435, 43.5897],
              [1.4253, 43.5897],
              [1.4253, 43.5767],
            ],
          ],
        },
        Attributes: { confidence: 0.92, platform: 'Sentinel-2B' },
        Frames: [
          {
            Time: '2026-04-05T10:30:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [1.432, 43.582],
                  [1.435, 43.582],
                  [1.435, 43.584],
                  [1.432, 43.584],
                  [1.432, 43.582],
                ],
              ],
            },
            Properties: { confidence: 0.88, area_km2: 0.06 },
          },
          {
            Time: '2026-04-05T12:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [1.431, 43.5815],
                  [1.4365, 43.5815],
                  [1.4365, 43.5848],
                  [1.431, 43.5848],
                  [1.431, 43.5815],
                ],
              ],
            },
            Properties: { confidence: 0.9, area_km2: 0.14 },
          },
          {
            Time: '2026-04-05T14:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [1.4295, 43.5808],
                  [1.438, 43.5808],
                  [1.438, 43.5858],
                  [1.4295, 43.5858],
                  [1.4295, 43.5808],
                ],
              ],
            },
            Properties: { confidence: 0.91, area_km2: 0.35 },
          },
          {
            Time: '2026-04-05T16:30:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [1.428, 43.58],
                  [1.44, 43.58],
                  [1.44, 43.587],
                  [1.428, 43.587],
                  [1.428, 43.58],
                ],
              ],
            },
            Properties: { confidence: 0.92, area_km2: 0.64 },
          },
          {
            Time: '2026-04-05T19:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [1.427, 43.579],
                  [1.4415, 43.579],
                  [1.4415, 43.588],
                  [1.427, 43.588],
                  [1.427, 43.579],
                ],
              ],
            },
            Properties: { confidence: 0.93, area_km2: 1.02 },
          },
          {
            Time: '2026-04-05T22:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [1.426, 43.5785],
                  [1.443, 43.5785],
                  [1.443, 43.589],
                  [1.426, 43.589],
                  [1.426, 43.5785],
                ],
              ],
            },
            Properties: { confidence: 0.94, area_km2: 1.45 },
          },
          {
            Time: '2026-04-06T01:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [1.4255, 43.578],
                  [1.444, 43.578],
                  [1.444, 43.5895],
                  [1.4255, 43.5895],
                  [1.4255, 43.578],
                ],
              ],
            },
            Properties: { confidence: 0.93, area_km2: 1.78 },
          },
          {
            Time: '2026-04-06T04:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [1.4253, 43.5775],
                  [1.4445, 43.5775],
                  [1.4445, 43.59],
                  [1.4253, 43.59],
                  [1.4253, 43.5775],
                ],
              ],
            },
            Properties: { confidence: 0.92, area_km2: 2.05 },
          },
          {
            Time: '2026-04-06T07:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [1.425, 43.577],
                  [1.4448, 43.577],
                  [1.4448, 43.59],
                  [1.425, 43.59],
                  [1.425, 43.577],
                ],
              ],
            },
            Properties: { confidence: 0.91, area_km2: 2.15 },
          },
          {
            Time: '2026-04-06T10:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [1.4253, 43.5767],
                  [1.4435, 43.5767],
                  [1.4435, 43.5897],
                  [1.4253, 43.5897],
                  [1.4253, 43.5767],
                ],
              ],
            },
            Properties: { confidence: 0.92, area_km2: 2.1 },
          },
        ],
      },

      // ────────────────────────────────────────────────────
      // 2. FLOOD — Lyon — 10 frames sur ~19h (crue du Rhône)
      // ────────────────────────────────────────────────────
      {
        Id: 'a123456-7890-4bcd-flood-lyon',
        Name: 'S2A_MSIL2A_20260404T11_Lyon_Flood',
        AlertCode: 'flood',
        Description: 'Flooding event near Lyon (Rhône river)',
        ContentDate: {
          Start: '2026-04-04T11:15:00.000Z',
          End: '2026-04-05T06:00:00.000Z',
        },
        Status: 'ended',
        Level: 3,
        GeoFootprint: {
          type: 'Polygon' as const,
          coordinates: [
            [
              [4.81, 45.74],
              [4.85, 45.74],
              [4.85, 45.77],
              [4.81, 45.77],
              [4.81, 45.74],
            ],
          ],
        },
        Attributes: { cloud_cover: 1.2, platform: 'Sentinel-2A' },
        Frames: [
          {
            Time: '2026-04-04T11:15:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [4.83, 45.755],
                  [4.838, 45.755],
                  [4.838, 45.762],
                  [4.83, 45.762],
                  [4.83, 45.755],
                ],
              ],
            },
            Properties: { water_level_m: 2.1 },
          },
          {
            Time: '2026-04-04T13:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [4.827, 45.752],
                  [4.841, 45.752],
                  [4.841, 45.764],
                  [4.827, 45.764],
                  [4.827, 45.752],
                ],
              ],
            },
            Properties: { water_level_m: 2.8 },
          },
          {
            Time: '2026-04-04T15:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [4.823, 45.749],
                  [4.844, 45.749],
                  [4.844, 45.766],
                  [4.823, 45.766],
                  [4.823, 45.749],
                ],
              ],
            },
            Properties: { water_level_m: 3.5 },
          },
          {
            Time: '2026-04-04T17:30:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [4.819, 45.746],
                  [4.847, 45.746],
                  [4.847, 45.768],
                  [4.819, 45.768],
                  [4.819, 45.746],
                ],
              ],
            },
            Properties: { water_level_m: 4.1 },
          },
          {
            Time: '2026-04-04T20:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [4.815, 45.743],
                  [4.849, 45.743],
                  [4.849, 45.769],
                  [4.815, 45.769],
                  [4.815, 45.743],
                ],
              ],
            },
            Properties: { water_level_m: 4.6 },
          },
          {
            Time: '2026-04-04T22:30:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [4.812, 45.741],
                  [4.85, 45.741],
                  [4.85, 45.77],
                  [4.812, 45.77],
                  [4.812, 45.741],
                ],
              ],
            },
            Properties: { water_level_m: 4.9 },
          },
          {
            Time: '2026-04-05T00:30:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [4.81, 45.74],
                  [4.85, 45.74],
                  [4.85, 45.77],
                  [4.81, 45.77],
                  [4.81, 45.74],
                ],
              ],
            },
            Properties: { water_level_m: 5.0 },
          },
          {
            Time: '2026-04-05T02:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [4.812, 45.741],
                  [4.849, 45.741],
                  [4.849, 45.769],
                  [4.812, 45.769],
                  [4.812, 45.741],
                ],
              ],
            },
            Properties: { water_level_m: 4.5 },
          },
          {
            Time: '2026-04-05T04:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [4.818, 45.745],
                  [4.845, 45.745],
                  [4.845, 45.766],
                  [4.818, 45.766],
                  [4.818, 45.745],
                ],
              ],
            },
            Properties: { water_level_m: 3.6 },
          },
          {
            Time: '2026-04-05T06:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [4.825, 45.75],
                  [4.84, 45.75],
                  [4.84, 45.763],
                  [4.825, 45.763],
                  [4.825, 45.75],
                ],
              ],
            },
            Properties: { water_level_m: 2.4 },
          },
        ],
      },

      // ────────────────────────────────────────────────────
      // 3. EARTHQUAKE — Naples — Point fixe, pas de frames
      // ────────────────────────────────────────────────────
      {
        Id: 'b987654-1111-4abc-eq-naples',
        Name: 'USGS_20260403T08_Naples_Earthquake',
        AlertCode: 'earthquake',
        Description: 'Magnitude 4.8 earthquake detected near Naples (Campi Flegrei)',
        ContentDate: {
          Start: '2026-04-03T08:22:00.000Z',
          End: '2026-04-03T08:25:00.000Z',
        },
        Status: 'ended',
        Level: 3,
        GeoFootprint: {
          type: 'Point' as const,
          coordinates: [14.1394, 40.8268],
        },
        Attributes: { magnitude: 4.8, depth_km: 3.2, platform: 'USGS' },
      },

      // ────────────────────────────────────────────────────
      // 4. STORM — Lisbon — 10 frames sur ~8h (tempête qui se déplace NE)
      // ────────────────────────────────────────────────────
      {
        Id: 'c555111-2222-4def-storm-lisbon',
        Name: 'ECMWF_20260406T14_Lisbon_Storm',
        AlertCode: 'storm',
        Description: 'Severe storm with heavy winds approaching Lisbon',
        ContentDate: {
          Start: '2026-04-06T14:00:00.000Z',
          End: '2026-04-06T22:00:00.000Z',
        },
        Status: 'ended',
        Level: 4,
        GeoFootprint: {
          type: 'Polygon' as const,
          coordinates: [
            [
              [-9.2, 38.68],
              [-9.08, 38.68],
              [-9.08, 38.78],
              [-9.2, 38.78],
              [-9.2, 38.68],
            ],
          ],
        },
        Attributes: { wind_speed_kmh: 110, rainfall_mm: 55, platform: 'ECMWF' },
        Frames: [
          {
            Time: '2026-04-06T14:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [-9.32, 38.6],
                  [-9.22, 38.6],
                  [-9.22, 38.68],
                  [-9.32, 38.68],
                  [-9.32, 38.6],
                ],
              ],
            },
            Properties: { wind_speed_kmh: 85, rainfall_mm: 20 },
          },
          {
            Time: '2026-04-06T15:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [-9.28, 38.63],
                  [-9.17, 38.63],
                  [-9.17, 38.72],
                  [-9.28, 38.72],
                  [-9.28, 38.63],
                ],
              ],
            },
            Properties: { wind_speed_kmh: 95, rainfall_mm: 30 },
          },
          {
            Time: '2026-04-06T16:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [-9.25, 38.66],
                  [-9.12, 38.66],
                  [-9.12, 38.76],
                  [-9.25, 38.76],
                  [-9.25, 38.66],
                ],
              ],
            },
            Properties: { wind_speed_kmh: 105, rainfall_mm: 42 },
          },
          {
            Time: '2026-04-06T17:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [-9.22, 38.68],
                  [-9.08, 38.68],
                  [-9.08, 38.79],
                  [-9.22, 38.79],
                  [-9.22, 38.68],
                ],
              ],
            },
            Properties: { wind_speed_kmh: 110, rainfall_mm: 55 },
          },
          {
            Time: '2026-04-06T18:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [-9.18, 38.71],
                  [-9.04, 38.71],
                  [-9.04, 38.82],
                  [-9.18, 38.82],
                  [-9.18, 38.71],
                ],
              ],
            },
            Properties: { wind_speed_kmh: 108, rainfall_mm: 50 },
          },
          {
            Time: '2026-04-06T18:45:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [-9.15, 38.73],
                  [-9.01, 38.73],
                  [-9.01, 38.84],
                  [-9.15, 38.84],
                  [-9.15, 38.73],
                ],
              ],
            },
            Properties: { wind_speed_kmh: 102, rainfall_mm: 45 },
          },
          {
            Time: '2026-04-06T19:30:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [-9.12, 38.75],
                  [-8.98, 38.75],
                  [-8.98, 38.86],
                  [-9.12, 38.86],
                  [-9.12, 38.75],
                ],
              ],
            },
            Properties: { wind_speed_kmh: 95, rainfall_mm: 38 },
          },
          {
            Time: '2026-04-06T20:15:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [-9.08, 38.78],
                  [-8.95, 38.78],
                  [-8.95, 38.88],
                  [-9.08, 38.88],
                  [-9.08, 38.78],
                ],
              ],
            },
            Properties: { wind_speed_kmh: 88, rainfall_mm: 30 },
          },
          {
            Time: '2026-04-06T21:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [-9.05, 38.8],
                  [-8.93, 38.8],
                  [-8.93, 38.89],
                  [-9.05, 38.89],
                  [-9.05, 38.8],
                ],
              ],
            },
            Properties: { wind_speed_kmh: 75, rainfall_mm: 22 },
          },
          {
            Time: '2026-04-06T22:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [-9.02, 38.82],
                  [-8.92, 38.82],
                  [-8.92, 38.9],
                  [-9.02, 38.9],
                  [-9.02, 38.82],
                ],
              ],
            },
            Properties: { wind_speed_kmh: 60, rainfall_mm: 12 },
          },
        ],
      },

      // ────────────────────────────────────────────────────
      // 5. FIRE — Athens — 10 frames sur ~33h (feu qui s'étend puis recule)
      // ────────────────────────────────────────────────────
      {
        Id: 'd444333-3333-4fed-fire-athens',
        Name: 'S2A_MSIL2A_20260407T09_Athens_Fire',
        AlertCode: 'fire',
        Description: 'Wildfire detected on Mount Hymettus near Athens',
        ContentDate: {
          Start: '2026-04-07T09:00:00.000Z',
          End: '2026-04-08T18:00:00.000Z',
        },
        Status: 'ended',
        Level: 5,
        GeoFootprint: {
          type: 'Polygon' as const,
          coordinates: [
            [
              [23.78, 37.94],
              [23.82, 37.94],
              [23.82, 37.97],
              [23.78, 37.97],
              [23.78, 37.94],
            ],
          ],
        },
        Attributes: { cloud_cover: 0.1, platform: 'Sentinel-2A' },
        Frames: [
          {
            Time: '2026-04-07T09:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [23.795, 37.953],
                  [23.803, 37.953],
                  [23.803, 37.958],
                  [23.795, 37.958],
                  [23.795, 37.953],
                ],
              ],
            },
            Properties: { confidence: 0.85, area_km2: 0.04 },
          },
          {
            Time: '2026-04-07T12:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [23.79, 37.95],
                  [23.808, 37.95],
                  [23.808, 37.96],
                  [23.79, 37.96],
                  [23.79, 37.95],
                ],
              ],
            },
            Properties: { confidence: 0.9, area_km2: 0.15 },
          },
          {
            Time: '2026-04-07T15:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [23.786, 37.947],
                  [23.813, 37.947],
                  [23.813, 37.963],
                  [23.786, 37.963],
                  [23.786, 37.947],
                ],
              ],
            },
            Properties: { confidence: 0.93, area_km2: 0.38 },
          },
          {
            Time: '2026-04-07T18:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [23.783, 37.944],
                  [23.817, 37.944],
                  [23.817, 37.966],
                  [23.783, 37.966],
                  [23.783, 37.944],
                ],
              ],
            },
            Properties: { confidence: 0.95, area_km2: 0.65 },
          },
          {
            Time: '2026-04-07T21:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [23.781, 37.942],
                  [23.82, 37.942],
                  [23.82, 37.968],
                  [23.781, 37.968],
                  [23.781, 37.942],
                ],
              ],
            },
            Properties: { confidence: 0.94, area_km2: 0.9 },
          },
          {
            Time: '2026-04-08T00:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [23.78, 37.94],
                  [23.82, 37.94],
                  [23.82, 37.97],
                  [23.78, 37.97],
                  [23.78, 37.94],
                ],
              ],
            },
            Properties: { confidence: 0.92, area_km2: 1.08 },
          },
          {
            Time: '2026-04-08T04:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [23.78, 37.94],
                  [23.819, 37.94],
                  [23.819, 37.969],
                  [23.78, 37.969],
                  [23.78, 37.94],
                ],
              ],
            },
            Properties: { confidence: 0.9, area_km2: 1.02 },
          },
          {
            Time: '2026-04-08T08:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [23.783, 37.943],
                  [23.816, 37.943],
                  [23.816, 37.966],
                  [23.783, 37.966],
                  [23.783, 37.943],
                ],
              ],
            },
            Properties: { confidence: 0.87, area_km2: 0.68 },
          },
          {
            Time: '2026-04-08T13:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [23.788, 37.948],
                  [23.812, 37.948],
                  [23.812, 37.962],
                  [23.788, 37.962],
                  [23.788, 37.948],
                ],
              ],
            },
            Properties: { confidence: 0.8, area_km2: 0.3 },
          },
          {
            Time: '2026-04-08T18:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [23.793, 37.952],
                  [23.806, 37.952],
                  [23.806, 37.958],
                  [23.793, 37.958],
                  [23.793, 37.952],
                ],
              ],
            },
            Properties: { confidence: 0.7, area_km2: 0.07 },
          },
        ],
      },

      // ────────────────────────────────────────────────────
      // 6. EARTHQUAKE — Zagreb — Point fixe, pas de frames
      // ────────────────────────────────────────────────────
      {
        Id: 'e666999-4444-4abc-eq-zagreb',
        Name: 'USGS_20260405T16_Zagreb_Earthquake',
        AlertCode: 'earthquake',
        Description: 'Magnitude 5.3 earthquake north of Zagreb',
        ContentDate: {
          Start: '2026-04-05T16:42:00.000Z',
          End: '2026-04-05T16:44:00.000Z',
        },
        Status: 'ended',
        Level: 4,
        GeoFootprint: {
          type: 'Point' as const,
          coordinates: [15.98, 45.84],
        },
        Attributes: { magnitude: 5.3, depth_km: 8.5, platform: 'USGS' },
      },

      // ────────────────────────────────────────────────────
      // 7. STORM — Barcelona — 8 frames sur ~6h (tempête côtière SE→NW)
      // ────────────────────────────────────────────────────
      {
        Id: 'f777888-5555-4abc-storm-barcelona',
        Name: 'ECMWF_20260408T08_Barcelona_Storm',
        AlertCode: 'storm',
        Description: 'Severe thunderstorm with heavy rainfall over Barcelona coast',
        ContentDate: {
          Start: '2026-04-08T08:00:00.000Z',
          End: '2026-04-08T14:00:00.000Z',
        },
        Status: 'ended',
        Level: 3,
        GeoFootprint: {
          type: 'Polygon' as const,
          coordinates: [
            [
              [2.1, 41.35],
              [2.25, 41.35],
              [2.25, 41.45],
              [2.1, 41.45],
              [2.1, 41.35],
            ],
          ],
        },
        Attributes: { wind_speed_kmh: 95, rainfall_mm: 42, platform: 'ECMWF' },
        Frames: [
          {
            Time: '2026-04-08T08:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [2.22, 41.33],
                  [2.3, 41.33],
                  [2.3, 41.39],
                  [2.22, 41.39],
                  [2.22, 41.33],
                ],
              ],
            },
            Properties: { wind_speed_kmh: 70, rainfall_mm: 15 },
          },
          {
            Time: '2026-04-08T08:45:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [2.19, 41.35],
                  [2.28, 41.35],
                  [2.28, 41.42],
                  [2.19, 41.42],
                  [2.19, 41.35],
                ],
              ],
            },
            Properties: { wind_speed_kmh: 82, rainfall_mm: 25 },
          },
          {
            Time: '2026-04-08T09:30:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [2.16, 41.36],
                  [2.26, 41.36],
                  [2.26, 41.44],
                  [2.16, 41.44],
                  [2.16, 41.36],
                ],
              ],
            },
            Properties: { wind_speed_kmh: 90, rainfall_mm: 35 },
          },
          {
            Time: '2026-04-08T10:15:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [2.13, 41.37],
                  [2.24, 41.37],
                  [2.24, 41.45],
                  [2.13, 41.45],
                  [2.13, 41.37],
                ],
              ],
            },
            Properties: { wind_speed_kmh: 95, rainfall_mm: 42 },
          },
          {
            Time: '2026-04-08T11:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [2.1, 41.38],
                  [2.22, 41.38],
                  [2.22, 41.46],
                  [2.1, 41.46],
                  [2.1, 41.38],
                ],
              ],
            },
            Properties: { wind_speed_kmh: 92, rainfall_mm: 40 },
          },
          {
            Time: '2026-04-08T11:45:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [2.08, 41.39],
                  [2.19, 41.39],
                  [2.19, 41.47],
                  [2.08, 41.47],
                  [2.08, 41.39],
                ],
              ],
            },
            Properties: { wind_speed_kmh: 85, rainfall_mm: 32 },
          },
          {
            Time: '2026-04-08T12:30:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [2.05, 41.4],
                  [2.16, 41.4],
                  [2.16, 41.47],
                  [2.05, 41.47],
                  [2.05, 41.4],
                ],
              ],
            },
            Properties: { wind_speed_kmh: 75, rainfall_mm: 22 },
          },
          {
            Time: '2026-04-08T14:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [2.02, 41.41],
                  [2.12, 41.41],
                  [2.12, 41.47],
                  [2.02, 41.47],
                  [2.02, 41.41],
                ],
              ],
            },
            Properties: { wind_speed_kmh: 55, rainfall_mm: 10 },
          },
        ],
      },

      // ────────────────────────────────────────────────────
      // 8. FLOOD — Marseille — 10 frames sur ~14h (crue côtière)
      // ────────────────────────────────────────────────────
      {
        Id: 'g888222-6666-4def-flood-marseille',
        Name: 'S2B_MSIL2A_20260409T07_Marseille_Flood',
        AlertCode: 'flood',
        Description: 'Coastal flooding near Marseille old port area',
        ContentDate: {
          Start: '2026-04-09T07:00:00.000Z',
          End: '2026-04-09T21:00:00.000Z',
        },
        Status: 'ended',
        Level: 3,
        GeoFootprint: {
          type: 'Polygon' as const,
          coordinates: [
            [
              [5.35, 43.28],
              [5.39, 43.28],
              [5.39, 43.31],
              [5.35, 43.31],
              [5.35, 43.28],
            ],
          ],
        },
        Attributes: { cloud_cover: 0.8, platform: 'Sentinel-2B' },
        Frames: [
          {
            Time: '2026-04-09T07:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [5.365, 43.293],
                  [5.373, 43.293],
                  [5.373, 43.298],
                  [5.365, 43.298],
                  [5.365, 43.293],
                ],
              ],
            },
            Properties: { water_level_m: 1.2 },
          },
          {
            Time: '2026-04-09T08:30:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [5.362, 43.291],
                  [5.376, 43.291],
                  [5.376, 43.3],
                  [5.362, 43.3],
                  [5.362, 43.291],
                ],
              ],
            },
            Properties: { water_level_m: 1.8 },
          },
          {
            Time: '2026-04-09T10:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [5.358, 43.288],
                  [5.38, 43.288],
                  [5.38, 43.303],
                  [5.358, 43.303],
                  [5.358, 43.288],
                ],
              ],
            },
            Properties: { water_level_m: 2.5 },
          },
          {
            Time: '2026-04-09T11:30:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [5.355, 43.286],
                  [5.384, 43.286],
                  [5.384, 43.305],
                  [5.355, 43.305],
                  [5.355, 43.286],
                ],
              ],
            },
            Properties: { water_level_m: 3.0 },
          },
          {
            Time: '2026-04-09T13:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [5.352, 43.283],
                  [5.388, 43.283],
                  [5.388, 43.308],
                  [5.352, 43.308],
                  [5.352, 43.283],
                ],
              ],
            },
            Properties: { water_level_m: 3.4 },
          },
          {
            Time: '2026-04-09T14:30:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [5.35, 43.28],
                  [5.39, 43.28],
                  [5.39, 43.31],
                  [5.35, 43.31],
                  [5.35, 43.28],
                ],
              ],
            },
            Properties: { water_level_m: 3.5 },
          },
          {
            Time: '2026-04-09T16:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [5.352, 43.282],
                  [5.388, 43.282],
                  [5.388, 43.308],
                  [5.352, 43.308],
                  [5.352, 43.282],
                ],
              ],
            },
            Properties: { water_level_m: 3.2 },
          },
          {
            Time: '2026-04-09T17:30:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [5.356, 43.285],
                  [5.384, 43.285],
                  [5.384, 43.305],
                  [5.356, 43.305],
                  [5.356, 43.285],
                ],
              ],
            },
            Properties: { water_level_m: 2.6 },
          },
          {
            Time: '2026-04-09T19:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [5.36, 43.289],
                  [5.38, 43.289],
                  [5.38, 43.302],
                  [5.36, 43.302],
                  [5.36, 43.289],
                ],
              ],
            },
            Properties: { water_level_m: 1.9 },
          },
          {
            Time: '2026-04-09T21:00:00.000Z',
            GeoFootprint: {
              type: 'Polygon',
              coordinates: [
                [
                  [5.364, 43.292],
                  [5.375, 43.292],
                  [5.375, 43.299],
                  [5.364, 43.299],
                  [5.364, 43.292],
                ],
              ],
            },
            Properties: { water_level_m: 1.1 },
          },
        ],
      },
    ]
  }
}
