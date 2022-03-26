import { AppConstants } from 'src/app/services/app.constant';
import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SpaceComponent } from './space/space.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { StoreModule } from '@ngrx/store';
import { reducers } from './ngrx/reducers/reducer';
import { LayoutComponent } from './components/rittry-layout/layout.component';
import { EffectsModule } from '@ngrx/effects';
import { CElementEffects } from './ngrx/effects/celement.effects';
import { CElementFastActionComponent } from './components/celement-fast-action/celement-fast-action.component';
import { CodeEditorEffects } from './ngrx/effects/code-editor.effect';
import { SpaceEffects } from './ngrx/effects/space.effect';

@NgModule({
  declarations: [AppComponent, SpaceComponent, LayoutComponent, CElementFastActionComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    StoreModule.forRoot({}),
    StoreModule.forFeature(
      AppConstants.uiEditorFeatureName,
      reducers
    ),
    EffectsModule.forRoot([CElementEffects, CodeEditorEffects, SpaceEffects]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(injector: Injector) {
    // const testAngEl = createCustomElement(ElementComponent, { injector });
    // customElements.define('rittry-element', testAngEl);
  }
}
