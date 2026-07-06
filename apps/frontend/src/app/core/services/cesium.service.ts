import { Injectable, signal } from '@angular/core';
import * as Cesium from 'cesium';
import { environment } from '../../../environments/environment';

type CzmlJson = unknown;

@Injectable({ providedIn: 'root' })
export class CesiumService {
  private viewer: Cesium.Viewer | null = null;
  private czmlDataSource: Cesium.CzmlDataSource | null = null;

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

  destroy(): void {
    if (this.viewer && !this.viewer.isDestroyed()) {
      this.viewer.destroy();
    }
    this.viewer = null;
    this.czmlDataSource = null;
  }
}
