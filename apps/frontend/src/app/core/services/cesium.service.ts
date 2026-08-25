import { Injectable, signal } from '@angular/core';
import * as Cesium from 'cesium';
import { environment } from '../../../environments/environment';
import { IndexZoneGrid } from '../models/index.model';

type CzmlJson = unknown;

@Injectable({ providedIn: 'root' })
export class CesiumService {
  private viewer: Cesium.Viewer | null = null;
  private czmlDataSource: Cesium.CzmlDataSource | null = null;
  private zoneHighlightEntity: Cesium.Entity | null = null;
  private gridEntities: Cesium.Entity[] = [];

  readonly selectedEntity = signal<Cesium.Entity | null>(null);

  initViewer(container: HTMLElement): Cesium.Viewer {
    const hasToken = !!environment.cesiumIonToken;

    if (hasToken) {
      Cesium.Ion.defaultAccessToken = environment.cesiumIonToken;
    }

    const baseLayer = hasToken
      ? undefined
      : Cesium.ImageryLayer.fromProviderAsync(
          Cesium.TileMapServiceImageryProvider.fromUrl(
            Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
          )
        );

    this.viewer = new Cesium.Viewer(container, {
      ...(baseLayer ? { baseLayer } : {}),
      timeline: true,
      animation: true,
      sceneModePicker: true,
      baseLayerPicker: hasToken,
      navigationHelpButton: false,
      homeButton: true,
      fullscreenButton: false,
      geocoder: false,
      infoBox: true,
      selectionIndicator: true,
    });

    // Track entity selection
    this.viewer.selectedEntityChanged.addEventListener((entity: Cesium.Entity | undefined) => {
      this.selectedEntity.set(entity ?? null);
    });

    return this.viewer;
  }

  async loadCzml(czmlData: CzmlJson): Promise<void> {
    if (!this.viewer) return;

    // Remove previous data source
    if (this.czmlDataSource) {
      this.viewer.dataSources.remove(this.czmlDataSource, true);
    }

    this.czmlDataSource = await Cesium.CzmlDataSource.load(czmlData);
    await this.viewer.dataSources.add(this.czmlDataSource);

    // Fly to the data extent
    if (this.czmlDataSource.entities.values.length > 0) {
      this.viewer.flyTo(this.czmlDataSource);
    }
  }

  flyToEntity(entityId: string): void {
    if (!this.viewer || !this.czmlDataSource) return;

    const entity = this.czmlDataSource.entities.getById(entityId);
    if (entity) {
      this.viewer.flyTo(entity);
      this.viewer.selectedEntity = entity;
    }
  }

  /**
   * Fly to a specific geographic location (lat/lng)
   * @param lat Latitude
   * @param lng Longitude
   * @param altitude Altitude in meters (default: 5000m for good overview)
   */
  flyToLocation(lat: number, lng: number, altitude = 5000): void {
    if (!this.viewer) return;

    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lng, lat, altitude),
      duration: 2,
    });
  }

  getEntities(): Cesium.Entity[] {
    return this.czmlDataSource?.entities.values ?? [];
  }

  /**
   * Highlight a GeoJSON polygon zone on the globe (e.g. on index row hover)
   */
  highlightZone(polygon: { coordinates: number[][][] }, color = '#ffff00'): void {
    if (!this.viewer) return;

    this.clearZoneHighlight();

    const ring = polygon.coordinates[0];
    const flatDegrees = ring.flatMap(([lng, lat]) => [lng, lat]);

    this.zoneHighlightEntity = this.viewer.entities.add({
      polygon: {
        hierarchy: Cesium.Cartesian3.fromDegreesArray(flatDegrees),
        material: Cesium.Color.fromCssColorString(color).withAlpha(0.35),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString(color),
      },
    });
  }

  clearZoneHighlight(): void {
    if (this.viewer && this.zoneHighlightEntity) {
      this.viewer.entities.remove(this.zoneHighlightEntity);
    }
    this.zoneHighlightEntity = null;
  }

  /**
   * Draw the full risk-index grid over the map. Each cell stores its index
   * values as an entity property so a click can populate the indices panel.
   */
  showGrid(zones: IndexZoneGrid[]): void {
    if (!this.viewer) return;

    this.hideGrid();

    for (const zone of zones) {
      const ring = zone.zone.coordinates[0];
      const flatDegrees = ring.flatMap(([lng, lat]) => [lng, lat]);

      const indicesForPanel = zone.values.map((v) => ({ ...v, zone: zone.zone }));

      // Damier gris clair/foncé pour distinguer les cellules adjacentes
      const isDark = (zone.cellX + zone.cellY) % 2 === 0;
      const fillColor = isDark
        ? Cesium.Color.SLATEGRAY.withAlpha(0.35)
        : Cesium.Color.LIGHTGRAY.withAlpha(0.2);

      const entity = this.viewer.entities.add({
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(flatDegrees),
          material: fillColor,
          outline: true,
          outlineColor: Cesium.Color.LIGHTGRAY.withAlpha(0.9),
          outlineWidth: 2,
        },
        properties: {
          isGridCell: true,
          indices: JSON.stringify(indicesForPanel),
        },
      });

      this.gridEntities.push(entity);
    }
  }

  hideGrid(): void {
    if (this.viewer) {
      for (const entity of this.gridEntities) {
        this.viewer.entities.remove(entity);
      }
    }
    this.gridEntities = [];
  }

  destroy(): void {
    if (this.viewer && !this.viewer.isDestroyed()) {
      this.viewer.destroy();
    }
    this.viewer = null;
    this.czmlDataSource = null;
    this.zoneHighlightEntity = null;
    this.gridEntities = [];
  }
}
