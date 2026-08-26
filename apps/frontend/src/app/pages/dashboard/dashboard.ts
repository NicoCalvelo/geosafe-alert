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
import { ZoneSubscriptionsService } from '../../core/services/zone-subscriptions.service';
import { IndexAtAddress, ZoneAlert } from '../../core/models/index.model';

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
  private zoneSubscriptions = inject(ZoneSubscriptionsService);

  @ViewChild(Toast) toast!: Toast;

  sidebarCollapsed = signal(false);
  loading = signal(false);

  indicesPanelVisible = signal(false);
  indices = signal<IndexAtAddress[]>([]);
  indicesLoading = signal(false);
  selectedAddressLabel = signal<string | null>(null);
  selectedZoneId = signal<string | null>(null);
  subscribedZoneIds = signal<Set<string>>(new Set());

  private lastAddressCoords: { lat: number; lng: number } | null = null;
  private wsSub: Subscription | null = null;
  private zoneAlertSub: Subscription | null = null;

  constructor() {
    // Grid cell entities carry their indices as a JSON property (see cesium.service.ts#showGrid)
    effect(() => {
      const entity = this.cesium.selectedEntity();
      const isGridCell = entity?.properties?.['isGridCell']?.getValue();
      if (!isGridCell) return;

      const indices: IndexAtAddress[] = JSON.parse(entity!.properties!['indices'].getValue());
      const zoneId: string = entity!.properties!['zoneId'].getValue();
      this.selectedAddressLabel.set('Grid cell');
      this.selectedZoneId.set(zoneId);
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
    this.zoneAlertSub = this.ws.zoneAlerts$.subscribe((alert) => {
      this.toast?.show(alert.message);
    });
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
    this.zoneAlertSub?.unsubscribe();
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
    void this.refreshIndicesPanel();
  }

  async onAddressSelected(result: GeocodeResult): Promise<void> {
    this.cesium.flyToLocation(result.lat, result.lng);

    this.lastAddressCoords = { lat: result.lat, lng: result.lng };
    this.selectedAddressLabel.set(result.name);
    this.selectedZoneId.set(null);
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
    this.selectedZoneId.set(null);
    this.lastAddressCoords = null;
    this.cesium.clearZoneHighlight();
  }

  // Index values are fully regenerated on every sync: an open panel must be refetched or it goes stale
  private async refreshIndicesPanel(): Promise<void> {
    if (!this.indicesPanelVisible()) return;

    const zoneId = this.selectedZoneId();
    try {
      if (zoneId) {
        this.indices.set(await this.indicesService.fetchByZone(zoneId));
      } else if (this.lastAddressCoords) {
        const { lat, lng } = this.lastAddressCoords;
        this.indices.set(await this.indicesService.fetchAt(lat, lng));
      }
    } catch (err) {
      console.error('Failed to refresh indices after sync:', err);
    }
  }

  async onZoneAlertClicked(alert: ZoneAlert): Promise<void> {
    if (alert.kind === 'event' && alert.eventId) {
      this.cesium.focusOnEvent(alert.eventId);
      return;
    }

    this.selectedAddressLabel.set('Zone alert');
    this.selectedZoneId.set(alert.zoneId);
    this.indicesPanelVisible.set(true);
    this.indicesLoading.set(true);
    try {
      const indices = await this.indicesService.fetchByZone(alert.zoneId);
      this.indices.set(indices);
      if (indices.length > 0) {
        this.cesium.focusOnZone(indices[0].zone);
      }
    } catch (err) {
      console.error('Failed to fetch zone indices:', err);
      this.indices.set([]);
    } finally {
      this.indicesLoading.set(false);
    }
  }

  onIndexHover(index: IndexAtAddress | null): void {
    if (index) {
      this.cesium.highlightZone(index.zone, index.color ?? undefined);
    } else {
      this.cesium.clearZoneHighlight();
    }
  }

  async onToggleSubscribe(): Promise<void> {
    const zoneId = this.selectedZoneId();
    if (!zoneId) return;

    const current = this.subscribedZoneIds();
    const isSubscribed = current.has(zoneId);

    try {
      if (isSubscribed) {
        await this.zoneSubscriptions.unsubscribe(zoneId);
      } else {
        await this.zoneSubscriptions.subscribe(zoneId);
      }
      const next = new Set(current);
      isSubscribed ? next.delete(zoneId) : next.add(zoneId);
      this.subscribedZoneIds.set(next);
    } catch (err) {
      console.error('Failed to toggle zone subscription:', err);
    }
  }

  private async initDashboard(): Promise<void> {
    await this.alerts.loadAlertTypes();
    void this.loadSubscriptions();

    // Load CZML once viewer is ready (small delay for Cesium init)
    setTimeout(() => this.loadAlerts(), 500);
  }

  private async loadSubscriptions(): Promise<void> {
    try {
      const zoneIds = await this.zoneSubscriptions.fetchMine();
      this.subscribedZoneIds.set(new Set(zoneIds));
    } catch (err) {
      console.error('Failed to load zone subscriptions:', err);
    }
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
