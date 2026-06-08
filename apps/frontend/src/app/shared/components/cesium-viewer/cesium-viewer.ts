import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CesiumService } from '../../../core/services/cesium.service';

@Component({
  selector: 'app-cesium-viewer',
  templateUrl: './cesium-viewer.html',
  styleUrl: './cesium-viewer.css',
})
export class CesiumViewer implements AfterViewInit, OnDestroy {
  @ViewChild('cesiumContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  private cesium = inject(CesiumService);

  ngAfterViewInit(): void {
    this.cesium.initViewer(this.containerRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.cesium.destroy();
  }
}
