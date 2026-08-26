import { Component, OnInit, OnDestroy, ViewChild, effect, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { CesiumViewer } from '../../shared/components/cesium-viewer/cesium-viewer';
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { Toast } from '../../shared/components/toast/toast';
import { SearchBar, GeocodeResult } from '../../shared/components/search-bar/search-bar';
import { IndicesPanel } from '../../shared/components/indices-panel/indices-panel';
import { CesiumService } from '../../core/services/cesium.service';
import { AlertsService } from '../../core/services/alerts.service';
import { WsService } from '../../core/services/ws.service';
import { IndicesService } from '../../core/services/indices.service';
import { IndexAtAddress } from '../../core/models/index.model';

@Component({
  selector: 'app-dashboard',
  imports: [CesiumViewer, Sidebar, Toast, SearchBar, IndicesPanel],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  private cesium = inject(CesiumService);
  private alerts = inject(AlertsService);
  private ws = inject(WsService);
  private indicesService = inject(IndicesService);

  @ViewChild(Toast) toast!: Toast;

  sidebarCollapsed = signal(false);
  loading = signal(false);

  indicesPanelVisible = signal(false);
  indices = signal<IndexAtAddress[]>([]);
  indicesLoading = signal(false);
  selectedAddressLabel = signal<string | null>(null);

  private wsSub: Subscription | null = null;

  constructor() {
    // Grid cell entities carry their indices as a JSON property (see cesium.service.ts#showGrid)
    effect(() => {
      const entity = this.cesium.selectedEntity();
      const isGridCell = entity?.properties?.['isGridCell']?.getValue();
      if (!isGridCell) return;

      const indices: IndexAtAddress[] = JSON.parse(entity!.properties!['indices'].getValue());
      this.selectedAddressLabel.set('Grid cell');
      this.indices.set(indices);
      this.indicesLoading.set(false);
      this.indicesPanelVisible.set(true);
    });
  }

  ngOnInit(): void {
    void this.initDashboard();

    // WebSocket connection
    this.ws.connect();
    this.wsSub = this.ws.newAlerts$.subscribe((data) => {
      this.toast?.show(`${data.count} new alert(s) received`);
      this.loadAlerts();
    });
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
    this.ws.disconnect();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  onFiltersChanged(): void {
    this.loadAlerts();
  }

  onSynced(): void {
    this.toast?.show('Sync complete — reloading alerts');
    this.loadAlerts();
  }

  async onAddressSelected(result: GeocodeResult): Promise<void> {
    this.cesium.flyToLocation(result.lat, result.lng);

    this.selectedAddressLabel.set(result.name);
    this.indicesPanelVisible.set(true);
    this.indicesLoading.set(true);
    try {
      const indices = await this.indicesService.fetchAt(result.lat, result.lng);
      this.indices.set(indices);
    } catch (err) {
      console.error('Failed to fetch indices:', err);
      this.indices.set([]);
    } finally {
      this.indicesLoading.set(false);
    }
  }

  onIndicesPanelClosed(): void {
    this.indicesPanelVisible.set(false);
    this.cesium.clearZoneHighlight();
  }

  onIndexHover(index: IndexAtAddress | null): void {
    if (index) {
      this.cesium.highlightZone(index.zone, index.color ?? undefined);
    } else {
      this.cesium.clearZoneHighlight();
    }
  }

  private async initDashboard(): Promise<void> {
    await this.alerts.loadAlertTypes();

    // Load CZML once viewer is ready (small delay for Cesium init)
    setTimeout(() => this.loadAlerts(), 500);
  }

  private async loadAlerts(): Promise<void> {
    this.loading.set(true);
    try {
      const filters = this.alerts.activeFilters();
      const czml = await this.alerts.fetchCzml({
        alertTypes: filters.length > 0 ? filters : undefined,
      });
      await this.cesium.loadCzml(czml);
    } catch (err) {
      console.error('Failed to load CZML:', err);
    } finally {
      this.loading.set(false);
    }
  }
}
