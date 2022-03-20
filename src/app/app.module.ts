import { InjectionToken, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SpaceComponent } from './space/space.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { StoreModule } from '@ngrx/store';
import { mainReducer } from './reducers/main.reducer';
import { createCustomElement } from '@angular/elements';
import { LayoutComponent } from './components/rittry-layout/layout.component';

@NgModule({
  declarations: [
    AppComponent,
    SpaceComponent,
    LayoutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatButtonModule,
    StoreModule.forRoot({}),
    StoreModule.forFeature(
      'updateComponentFeature',
      new InjectionToken<any>('componentPropertiesReducer', {
        factory: () => mainReducer,
      })
    ),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(injector: Injector) {
    // const testAngEl = createCustomElement(ElementComponent, { injector });
    // customElements.define('rittry-element', testAngEl);
  }
}
