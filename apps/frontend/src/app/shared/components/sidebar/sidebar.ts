import { Component, input, output, inject, computed, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { AlertsService } from '../../../core/services/alerts.service';
import { CesiumService } from '../../../core/services/cesium.service';
import { IndicesService } from '../../../core/services/indices.service';
import { RouterLink } from '@angular/router';
import { AlertCard } from '../alert-card/alert-card';

@Component({
  selector: 'app-sidebar',
  imports: [AlertCard, RouterLink],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  collapsed = input(false);
  toggled = output<void>();

  private auth = inject(AuthService);
  private alerts = inject(AlertsService);
  private cesium = inject(CesiumService);
  private indices = inject(IndicesService);

  readonly user = this.auth.currentUser;
  readonly alertTypes = this.alerts.alertTypes;
  readonly activeFilters = this.alerts.activeFilters;
  readonly selectedEntityId = computed(() => this.cesium.selectedEntity()?.id);

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
  syncing = signal(false);

  gridVisible = signal(false);
  gridLoading = signal(false);

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

  onToggle(): void {
    this.toggled.emit();
  }

  async onSync(): Promise<void> {
    if (this.syncing()) return;
    this.syncing.set(true);
    try {
      await Promise.all([this.alerts.ingest(), this.indices.ingest()]);
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
      return;
    }

    this.gridLoading.set(true);
    try {
      const zones = await this.indices.fetchGrid();
      this.cesium.showGrid(zones);
      this.gridVisible.set(true);
    } catch (err) {
      console.error('Failed to load risk grid:', err);
    } finally {
      this.gridLoading.set(false);
    }
  }

  async onLogout(): Promise<void> {
    await this.auth.logout();
  }
}
