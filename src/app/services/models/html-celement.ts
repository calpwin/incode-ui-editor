import { celementsSelector } from './../../ngrx/selectors/celement.selectors';
import { CustomElement } from './../../ngrx/store/custom-element.state';
import { CElementFastActionComponent } from './../../components/celement-fast-action/celement-fast-action.component';
import { ComponentRef } from '@angular/core';
import Moveable from 'moveable/declaration/Moveable';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/ngrx/store/initial.state';
import { take, firstValueFrom } from 'rxjs';

export class HtmlCElement {
  public flexboxLayout: 'col' | 'relative' = 'relative';
  public flexboxDirection: 'row' | 'column' = 'row';

  constructor(
    public cel: CustomElement,
    public htmlEl: HTMLElement,
    public moveable?: Moveable,
    public fastAtionCompRef?: ComponentRef<CElementFastActionComponent>
  ) {}
}

export class HtmlCelementMap extends Map<string, HtmlCElement> {
  private get _celsAsync() {
    return firstValueFrom(this._store.pipe(select(celementsSelector), take(1)));
  }

  constructor(
    private readonly _document: Document,
    private readonly _store: Store<AppState>
  ) {
    super();
  }

  async getHelmAsync(celId: string) {
    let helm = this.get(celId);

    if (helm) return helm;

    let htlmEl = this._document.getElementById(celId);

    if (!htlmEl) return undefined;

    const cel = (await this._celsAsync).find((x) => x.id === celId)!;
    helm = new HtmlCElement(cel, htlmEl);

    if (!this.get(celId)?.htmlEl) this.set(celId, helm);

    return this.get(celId);
  }
}
