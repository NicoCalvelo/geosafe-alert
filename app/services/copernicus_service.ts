export default class CopernicusService {
  public async fetchLatestEvents() {
    // Simulation d'un retour API (OData)
    // C'est ce que renvoie l'API "Copernicus Data Space Ecosystem"
    return [
      {
        Id: 'e812967-3312-4a01-fire-toulouse',
        Name: 'S2B_MSIL2A_20231005T10_Toulouse_Fire',
        Description: 'Fire detected near Toulouse (Ile du Ramier)',
        ContentDate: { Start: '2023-10-05T10:30:00.000Z' },
        // Le polygone GeoJSON brut (Zone détectée)
        GeoFootprint: {
          type: 'Polygon' as const,
          coordinates: [
            [
              // Toulouse Ile du Ramier (Longitude ~1.43, Latitude ~43.58)
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
        Name: 'S2A_MSIL2A_20231004T11_Lyon_Flood',
        Description: 'Flooding event near Lyon (Rhône river)',
        ContentDate: { Start: '2023-10-04T11:15:00.000Z' },
        GeoFootprint: {
          type: 'Polygon' as const,
          coordinates: [
            [
              // Lyon (Longitude ~4.83, Latitude ~45.76)
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
    ]
  }
}
