import { Injectable, signal } from '@angular/core';
import * as Cesium from 'cesium';
import { environment } from '../../../environments/environment';
import { IndexZoneGrid, GeoJSONPolygon } from '../models/index.model';

type CzmlJson = unknown;

@Injectable({ providedIn: 'root' })
export class CesiumService {
  private viewer: Cesium.Viewer | null = null;
  private czmlDataSource: Cesium.CzmlDataSource | null = null;
  private zoneHighlightEntity: Cesium.Entity | null = null;
  private gridEntities: Cesium.Entity[] = [];
  private gridZones: IndexZoneGrid[] = [];

  private static readonly LEVEL_COLORS: Record<string, Cesium.Color> = {
    low: Cesium.Color.LIMEGREEN,
    medium: Cesium.Color.GOLD,
    high: Cesium.Color.ORANGE,
    extreme: Cesium.Color.RED,
  };

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
   * Focus on an event entity, scrub the timeline to its start time and play it
   */
  focusOnEvent(entityId: string): void {
    if (!this.viewer || !this.czmlDataSource) return;

    const entity = this.czmlDataSource.entities.getById(entityId);
    if (!entity) return;

    this.viewer.selectedEntity = entity;
    this.viewer.flyTo(entity);

    if (entity.availability && !entity.availability.isEmpty) {
      this.viewer.clock.currentTime = entity.availability.start.clone();
    }
    this.viewer.clock.shouldAnimate = true;
  }

  /**
   * Fly the camera to a GeoJSON polygon's bounding box and highlight it
   */
  focusOnZone(polygon: GeoJSONPolygon, color = '#ffff00'): void {
    if (!this.viewer) return;

    this.highlightZone(polygon, color);

    const ring = polygon.coordinates[0];
    const lons = ring.map(([lng]) => lng);
    const lats = ring.map(([, lat]) => lat);
    const rectangle = Cesium.Rectangle.fromDegrees(
      Math.min(...lons),
      Math.min(...lats),
      Math.max(...lons),
      Math.max(...lats)
    );
    this.viewer.camera.flyTo({ destination: rectangle });
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
    this.gridZones = zones;

    for (const zone of zones) {
      const ring = zone.zone.coordinates[0];
      const flatDegrees = ring.flatMap(([lng, lat]) => [lng, lat]);

      const indicesForPanel = zone.values.map((v) => ({ ...v, zone: zone.zone }));

      const entity = this.viewer.entities.add({
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(flatDegrees),
          material: Cesium.Color.LIGHTGRAY.withAlpha(0.2),
          outline: true,
          outlineColor: Cesium.Color.LIGHTGRAY.withAlpha(0.9),
          outlineWidth: 2,
        },
        properties: {
          isGridCell: true,
          zoneId: zone.id,
          indices: JSON.stringify(indicesForPanel),
        },
      });

      this.gridEntities.push(entity);
    }

    this.applyGridColoring(null);
  }

  /** Recolors the existing grid by risk level for one index (or neutral checkerboard if null) */
  setGridIndexFilter(code: string | null): void {
    this.applyGridColoring(code);
  }

  private applyGridColoring(code: string | null): void {
    this.gridZones.forEach((zone, i) => {
      const entity = this.gridEntities[i];
      if (!entity?.polygon) return;

      let fill: Cesium.Color;
      let outline: Cesium.Color;

      if (code) {
        const match = zone.values.find((v) => v.code === code);
        const levelColor = (match && CesiumService.LEVEL_COLORS[match.level]) || Cesium.Color.GRAY;
        fill = levelColor.withAlpha(0.55);
        outline = levelColor.withAlpha(0.95);
      } else {
        // Damier gris clair/foncé pour distinguer les cellules adjacentes
        const isDark = (zone.cellX + zone.cellY) % 2 === 0;
        fill = isDark ? Cesium.Color.SLATEGRAY.withAlpha(0.35) : Cesium.Color.LIGHTGRAY.withAlpha(0.2);
        outline = Cesium.Color.LIGHTGRAY.withAlpha(0.9);
      }

      entity.polygon.material = new Cesium.ColorMaterialProperty(fill);
      entity.polygon.outlineColor = new Cesium.ConstantProperty(outline);
    });
  }

  hideGrid(): void {
    if (this.viewer) {
      for (const entity of this.gridEntities) {
        this.viewer.entities.remove(entity);
      }
    }
    this.gridEntities = [];
    this.gridZones = [];
  }

  destroy(): void {
    if (this.viewer && !this.viewer.isDestroyed()) {
      this.viewer.destroy();
    }
    this.viewer = null;
    this.czmlDataSource = null;
    this.zoneHighlightEntity = null;
    this.gridEntities = [];
    this.gridZones = [];
  }
}
