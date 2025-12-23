// On simule une réponse API Sentinel-2 (GeoJSON)
export default class CopernicusService {
  public async fetchLatestEvents() {
    // Simulation d'un retour API (OData)
    // C'est ce que renvoie l'API "Copernicus Data Space Ecosystem"
    return [
      {
        Id: 'e812967-3312-4a01...',
        Name: 'S2B_MSIL2A_20231005T10_Marseille_Fire',
        Description: 'Fire detected near Marseille',
        ContentDate: { Start: '2023-10-05T10:30:00.000Z' },
        // Le polygone GeoJSON brut (Zone détectée)
        GeoFootprint: {
          type: 'Polygon' as const,
          coordinates: [
            [
              [5.35, 43.28],
              [5.4, 43.28],
              [5.4, 43.32],
              [5.35, 43.32],
              [5.35, 43.28],
            ],
          ],
        },
        Attributes: { cloud_cover: 0.5, platform: 'Sentinel-2B' },
      },
      {
        Id: 'a123456-7890-4bcd...',
        Name: 'S2A_MSIL2A_20231004T11_Lyon_Flood',
        Description: 'Flooding event near Lyon',
        ContentDate: { Start: '2023-10-04T11:15:00.000Z' },
        GeoFootprint: {
          type: 'Polygon' as const,
          coordinates: [
            [
              [4.8, 45.7],
              [4.85, 45.7],
              [4.85, 45.75],
              [4.8, 45.75],
              [4.8, 45.7],
            ],
          ],
        },
        Attributes: { cloud_cover: 1.2, platform: 'Sentinel-2A' },
      },
    ]
  }
}
