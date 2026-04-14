export default class CopernicusService {
  public async fetchLatestEvents() {
    // Simulation d'un retour API (OData)
    // C'est ce que renvoie l'API "Copernicus Data Space Ecosystem"
    return [
      {
        Id: 'e812967-3312-4a01-fire-toulouse',
        Name: 'S2B_MSIL2A_20260405T10_Toulouse_Fire',
        AlertCode: 'fire',
        Description: 'Fire detected near Toulouse (Ile du Ramier)',
        ContentDate: {
          Start: '2026-04-05T10:30:00.000Z',
          End: null, // Incendie toujours actif
        },
        Status: 'active',
        Level: 4,
        GeoFootprint: {
          type: 'Polygon' as const,
          coordinates: [
            [
              [1.4253457706428492, 43.57667556906142],
              [1.4434900383091929, 43.57667556906142],
              [1.4434900383091929, 43.58971692066518],
              [1.4253457706428492, 43.58971692066518],
              [1.4253457706428492, 43.57667556906142],
            ],
          ],
        },
        Attributes: { cloud_cover: 0.5, platform: 'Sentinel-2B' },
      },
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
      },
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
              [-9.20, 38.68],
              [-9.08, 38.68],
              [-9.08, 38.78],
              [-9.20, 38.78],
              [-9.20, 38.68],
            ],
          ],
        },
        Attributes: { wind_speed_kmh: 110, rainfall_mm: 55, platform: 'ECMWF' },
      },
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
      },
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
    ]
  }
}
