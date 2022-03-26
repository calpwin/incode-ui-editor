import { CElementFastActionComponent } from './../components/celement-fast-action/celement-fast-action.component';
import {
  changeRootElAction,
} from './../ngrx/actions/space.actions';
import { AppState, KeyValuePairModel } from '../ngrx/store/initial.state';
import { DOCUMENT } from '@angular/common';
import {
  Inject,
  Injectable,
  Renderer2,
  RendererFactory2,
  ViewContainerRef,
} from '@angular/core';
import { AppConstants } from './app.constant';
import { HtmlMovableElementService } from './html-movable-celement.service';
import { CustomElement } from '../ngrx/store/custom-element.state';
import { Store } from '@ngrx/store';
import { HtmlCElement } from './models/html-celement';
import { selectCElAction } from '../ngrx/actions/celement.actions';

@Injectable({
  providedIn: 'root',
})
export class HtmlCElementService {
  private readonly _renderer: Renderer2;
  private readonly _window: Window;

  // If clicked html element will be in this map,
  // then can be removed by "close element" ui action
  private readonly _htmlEls = new Map<string, HtmlCElement>();

  public spaceCElViewConRef!: ViewContainerRef;

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _rendererFactory: RendererFactory2,
    private readonly _htmlMovableElementService: HtmlMovableElementService,
    private readonly _store: Store<AppState>
  ) {
    this._renderer = _rendererFactory.createRenderer(null, null);
    this._window = _document.defaultView!;
  }

  initialize() {
    const htmlEl = this._document.getElementById(AppConstants.HtmlRootSpaceElementId)!;

    const hel: HtmlCElement = {
      cel: { id: AppConstants.HtmlRootSpaceElementId, tagName: htmlEl.tagName, styles: [] },
      htmlEl,
    };

    this._htmlEls.set(AppConstants.HtmlRootSpaceElementId, hel);
  }

  bindEventsToCElements() {
    const htmlRootEl = this._document.getElementById(
      AppConstants.HtmlRootSpaceElementId
    )!;
    const htmlEls = this._document.getElementsByClassName(
      AppConstants.HtmlElementClassName
    );

    for (var i = 0; i < htmlEls.length; i++) {
      const el = htmlEls[i];
      const elId = el.getAttribute('id')!;

      el.addEventListener('click', (e: Event) =>
        this.onCElementClick(elId, htmlRootEl, e)
      );
    }
  }

  setStyles(celId: string, styles: KeyValuePairModel[]) {
    const helm = this._htmlEls.get(celId)!;
    KeyValuePairModel.override(helm.cel.styles, styles);

    const htmlCel = this._document.getElementById(celId);

    styles.forEach((style) => {
      this._renderer.setStyle(htmlCel, style.name, style.value);
    });
  }

  /**
   * Get element style
   * @param withDom if true and style not bind to cel, find in current dom tree
   */
  getStyle(celId: string, styleName: string, withDom = false) {
    const helm = this._htmlEls.get(celId);

    if (!helm) return undefined;

    let style = helm.cel.styles.find((x) => x.name === styleName);

    if (style || !withDom) return style?.value;

    const styles = this._window.getComputedStyle(helm.htmlEl);
    return styles.getPropertyValue(styleName);
  }

  addCElement(cel: CustomElement, appendToId: string) {
    if (this._htmlEls.has(cel.id)) {
      console.log(`Can not add element, element with ${cel.id} already exist`);
      return;
    }

    const appendToHtmlEl = this._document.getElementById(appendToId);

    if (!appendToHtmlEl) return;

    const htmlEl = this._document.createElement(cel.tagName);
    this._renderer.addClass(htmlEl, 'rittry-element');
    htmlEl.setAttribute('id', cel.id);

    this._renderer.appendChild(appendToHtmlEl, htmlEl);

    this._htmlEls.set(cel.id, {
      cel: { ...cel, styles: [...cel.styles] },
      htmlEl,
    });
  }

  getElement(celId: string) {
    return this._htmlEls.get(celId);
  }

  getElements(exceptRoot = true) {
    let helms = Array.from(this._htmlEls);

    if (exceptRoot)
      helms = helms.filter((x) => x[0] !== AppConstants.HtmlRootSpaceElementId);

    return helms.map((x) => x[1]);
  }

  removeCElement(celId: string) {
    const hel = this._htmlEls.get(celId);

    if (!hel) return;

    hel.moveable?.destroy();
    hel.fastAtionCompRef?.destroy();
    hel.htmlEl.remove();
    this._htmlEls.delete(celId);
  }

  removeMovaeble(celid: string) {
    const helm = this._htmlEls.get(celid);
    const movaeble = helm?.moveable;

    if (!helm || !movaeble) return;

    movaeble.destroy();
    helm.moveable = undefined;
  }

  private onCElementClick(celId: string, htmlRootEl: HTMLElement, e: Event) {
    e.stopImmediatePropagation();

    let hel = this._htmlEls.get(celId);
    const htmlEl = this._document.getElementById(celId);

    if (!htmlEl) {
      console.log(`Can not find html element with id ${celId}`);
      return;
    }

    if (!hel) {
      hel = {
        cel: { id: celId, tagName: htmlRootEl.tagName, styles: [] },
        htmlEl,
      };

      this._htmlEls.set(celId, hel);
    }

    this._htmlEls.forEach((x) => {
      x.moveable?.destroy();
      x.moveable = undefined;
      x.fastAtionCompRef?.destroy();
      x.fastAtionCompRef = undefined;
    });

    this._store.dispatch(
      changeRootElAction({
        toRootElId: celId,
      })
    );

    if (celId === AppConstants.HtmlRootSpaceElementId) {
      return;
    }

    const moveable = this._htmlMovableElementService.makeMovable(
      htmlRootEl,
      <HTMLElement>e.currentTarget,
      {
        draggable:
          window.getComputedStyle(<HTMLElement>e.currentTarget).position ===
          'absolute',
      }
    );

    hel.moveable = moveable;

    const fastActionCompRef = this.spaceCElViewConRef.createComponent(
      CElementFastActionComponent
    );
    fastActionCompRef.instance.celId = celId;

    this._renderer.appendChild(
      e.currentTarget,
      fastActionCompRef.location.nativeElement
    );

    hel.fastAtionCompRef = fastActionCompRef;

    this._store.dispatch(
      selectCElAction({
        celId,
        celTag: htmlRootEl.tagName,
        celStyles: []
      })
    );
  }
}

