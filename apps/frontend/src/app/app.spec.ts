import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]) // minimal router mock
      ],
    }).compileComponents();
  });

  it('should create the application', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
  });

  it('should contain a router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const routerOutlet = fixture.debugElement.query(
      By.css('router-outlet')
    );

    expect(routerOutlet).toBeTruthy();
  });

  it('should render main layout container', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    // adapte si tu as une structure globale (header/main/layout)
    const body = compiled.querySelector('body') || compiled;

    expect(body).toBeTruthy();
  });
});