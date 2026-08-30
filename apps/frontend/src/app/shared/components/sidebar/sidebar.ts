import { Component, OnInit, input, output, inject, computed, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { AlertsService } from '../../../core/services/alerts.service';
import { CesiumService } from '../../../core/services/cesium.service';
import { IndicesService } from '../../../core/services/indices.service';
import { ZoneAlertsService } from '../../../core/services/zone-alerts.service';
import { IndexType, ZoneAlert } from '../../../core/models/index.model';
import { RouterLink } from '@angular/router';
import { AlertCard } from '../alert-card/alert-card';

@Component({
  selector: 'app-sidebar',
  imports: [AlertCard, RouterLink],
  templateUrl: './sidebar.html',
})
export class Sidebar implements OnInit {
  collapsed = input(false);
  toggled = output<void>();

  private auth = inject(AuthService);
  private alerts = inject(AlertsService);
  private cesium = inject(CesiumService);
  private indices = inject(IndicesService);
  private zoneAlerts = inject(ZoneAlertsService);

  readonly user = this.auth.currentUser;
  readonly alertTypes = this.alerts.alertTypes;
  readonly activeFilters = this.alerts.activeFilters;
  readonly selectedEntityId = computed(() => this.cesium.selectedEntity()?.id);

  myAlerts = signal<ZoneAlert[]>([]);

  // Build alert list from Cesium entities
  readonly entityList = computed(() => {
    const entities = this.cesium.getEntities();
    return entities
      .filter((e) => e.id !== 'document')
      .map((e) => ({
        id: e.id,
        name: e.name ?? 'Unknown',
        label: '', // Will be enriched from CZML description
        color: '#ffffff',
      }));
  });

  filtersChanged = output<void>();
  synced = output<void>();
  zoneAlertSelected = output<ZoneAlert>();
  syncing = signal(false);

  gridVisible = signal(false);
  gridLoading = signal(false);
  indexTypes = signal<IndexType[]>([]);
  selectedGridIndex = signal<string | null>(null);

  ngOnInit(): void {
    void this.loadMyAlerts();
  }

  private async loadMyAlerts(): Promise<void> {
    try {
      this.myAlerts.set(await this.zoneAlerts.list());
    } catch (err) {
      console.error('Failed to load zone alerts:', err);
    }
  }

  formatAlertTime(iso: string): string {
    return new Date(iso).toLocaleString();
  }

  onToggleFilter(code: string): void {
    this.alerts.toggleFilter(code);
    this.filtersChanged.emit();
  }

  onResetFilters(): void {
    this.alerts.clearFilters();
    this.filtersChanged.emit();
  }

  isFilterActive(code: string): boolean {
    return this.activeFilters().includes(code);
  }

  onAlertClick(entityId: string): void {
    this.cesium.flyToEntity(entityId);
  }

  onZoneAlertClick(alert: ZoneAlert): void {
    this.zoneAlertSelected.emit(alert);
  }

  onToggle(): void {
    this.toggled.emit();
  }

  async onSync(): Promise<void> {
    if (this.syncing()) return;
    this.syncing.set(true);
    try {
      await Promise.all([this.alerts.ingest(), this.indices.ingest()]);
      await this.zoneAlerts.check();
      await this.loadMyAlerts();
      // Values were just regenerated: redraw the grid if it's on screen, otherwise it stays stale
      if (this.gridVisible()) {
        const zones = await this.indices.fetchGrid();
        this.cesium.showGrid(zones);
        this.cesium.setGridIndexFilter(this.selectedGridIndex());
      }
      this.synced.emit();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      this.syncing.set(false);
    }
  }

  async onToggleGrid(): Promise<void> {
    if (this.gridLoading()) return;

    if (this.gridVisible()) {
      this.cesium.hideGrid();
      this.gridVisible.set(false);
      this.selectedGridIndex.set(null);
      return;
    }

    this.gridLoading.set(true);
    try {
      const [zones, types] = await Promise.all([
        this.indices.fetchGrid(),
        this.indexTypes().length === 0 ? this.indices.fetchTypes() : Promise.resolve(this.indexTypes()),
      ]);
      this.cesium.showGrid(zones);
      this.indexTypes.set(types);
      this.gridVisible.set(true);
    } catch (err) {
      console.error('Failed to load risk grid:', err);
    } finally {
      this.gridLoading.set(false);
    }
  }

  onSelectGridIndex(code: string): void {
    const next = this.selectedGridIndex() === code ? null : code;
    this.selectedGridIndex.set(next);
    this.cesium.setGridIndexFilter(next);
  }

  async onLogout(): Promise<void> {
    await this.auth.logout();
  }
}
