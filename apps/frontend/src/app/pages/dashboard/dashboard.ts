import { Component, OnInit, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { CesiumViewer } from '../../shared/components/cesium-viewer/cesium-viewer';
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { Toast } from '../../shared/components/toast/toast';
import { CesiumService } from '../../core/services/cesium.service';
import { AlertsService } from '../../core/services/alerts.service';
import { WsService } from '../../core/services/ws.service';

@Component({
  selector: 'app-dashboard',
  imports: [CesiumViewer, Sidebar, Toast],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  private cesium = inject(CesiumService);
  private alerts = inject(AlertsService);
  private ws = inject(WsService);

  @ViewChild(Toast) toast!: Toast;

  sidebarCollapsed = signal(false);
  loading = signal(false);

  private wsSub: Subscription | null = null;

  ngOnInit(): void {
    // Load CZML once viewer is ready (small delay for Cesium init)
    setTimeout(() => this.loadAlerts(), 500);

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
