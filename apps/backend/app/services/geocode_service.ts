import env from '#start/env'

export interface GeocodeResult {
  id: string
  name: string
  lat: number
  lng: number
  context?: string
}

/**
 * GeocodeService
 * Provides address autocomplete and geocoding using Mapbox API
 */
export default class GeocodeService {
  private static API_BASE = 'https://api.mapbox.com/geocoding/v5/mapbox.places'

  /**
   * Autocomplete addresses based on query string
   * @param query Search query (e.g., "Paris" or "123 Rue de la Paix")
   * @param limit Maximum number of results (default: 5)
   * @param proximity Optional {lat, lng} to bias results towards a location
   */
  static async autocomplete(
    query: string,
    limit: number = 5,
    proximity?: { lat: number; lng: number }
  ): Promise<GeocodeResult[]> {
    if (!query || query.trim().length === 0) {
      return []
    }

    try {
      const accessToken = env.get('MAPBOX_API_KEY')
      if (!accessToken) {
        console.warn('MAPBOX_API_KEY not configured')
        return []
      }

      const params = new URLSearchParams({
        access_token: accessToken,
        limit: Math.min(limit, 10).toString(),
        types: 'place,address,region',
      })

      if (proximity) {
        params.append('proximity', `${proximity.lng},${proximity.lat}`)
      }

      const url = `${GeocodeService.API_BASE}/${encodeURIComponent(query.trim())}.json?${params.toString()}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.statusText}`)
      }

      const data = (await response.json()) as {
        features?: Array<{
          id: string
          place_name: string
          geometry: {
            coordinates: [number, number]
          }
          context?: Array<{ text: string }>
        }>
      }

      const features = data.features || []

      return features.map((feature, index) => ({
        id: `${feature.id}-${index}`,
        name: feature.place_name,
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        context: this.extractContext(feature),
      }))
    } catch (error) {
      console.error('Mapbox geocode error:', error)
      throw new Error('Failed to fetch geocoding results')
    }
  }

  /**
   * Extract useful context from Mapbox feature
   * e.g., "Île-de-France, France" or "California, United States"
   */
  private static extractContext(feature: any): string {
    const contextArray = feature.context || []
    return contextArray
      .map((ctx: any) => ctx.text)
      .slice(-2) // Get last 2 context items (province/country)
      .join(', ')
  }
}
