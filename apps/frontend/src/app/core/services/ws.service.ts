import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { ZoneAlert } from '../models/index.model';

@Injectable({ providedIn: 'root' })
export class WsService {
  private auth = inject(AuthService);
  private socket: Socket | null = null;

  private _newAlerts$ = new Subject<{ count: number; ids: string[] }>();
  readonly newAlerts$: Observable<{ count: number; ids: string[] }> = this._newAlerts$.asObservable();

  private _zoneAlerts$ = new Subject<ZoneAlert>();
  readonly zoneAlerts$: Observable<ZoneAlert> = this._zoneAlerts$.asObservable();

  connect(): void {
    if (this.socket?.connected) return;

    const token = this.auth.getToken();

    this.socket = io('/events', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 3000,
    });

    this.socket.on('connect', () => {
      console.log('[WS] Connected to /events');
    });

    this.socket.on('new_alerts', (data: { count: number; ids: string[] }) => {
      this._newAlerts$.next(data);
    });

    this.socket.on('zone_alert', (data: ZoneAlert & { userId: string }) => {
      // Diffusion globale : on ne garde que les alertes destinées à l'utilisateur courant
      if (data.userId === this.auth.currentUser()?.id) {
        this._zoneAlerts$.next(data);
      }
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('[WS] Disconnected:', reason);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}
