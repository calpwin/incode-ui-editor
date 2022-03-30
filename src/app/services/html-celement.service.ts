import { currentMediaSelector } from './../ngrx/selectors/space.selectors';
import { MediaType } from './../ngrx/store/space-media';
import { celementsSelector } from './../ngrx/selectors/celement.selectors';
import { CElementFastActionComponent } from './../components/celement-fast-action/celement-fast-action.component';
import { changeRootElAction } from './../ngrx/actions/space.actions';
import { AppState } from '../ngrx/store/initial.state';
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
import { select, Store } from '@ngrx/store';
import {
  HtmlCElement,
  HtmlCelementMap as HtmlCElementMap,
} from './models/html-celement';
import { selectCElAction } from '../ngrx/actions/celement.actions';
import { firstValueFrom, take } from 'rxjs';
import { uiEditorSpaceFeatureSelector } from '../ngrx/selectors/space.selectors';
import {
  ElementStyle,
  ElementStyles,
  FlexboxCelPosition,
  KeyValuePairModel,
} from '../ngrx/store/element-style';

@Injectable({
  providedIn: 'root',
})
export class HtmlCElementService {
  private readonly _renderer: Renderer2;
  private readonly _window: Window;

  // Automatically update from store
  private _celements = new Map<string, CustomElement>();

  // If clicked html element will be in this map,
  // then can be removed by "close element" ui action
  private readonly _hels: HtmlCElementMap;

  public spaceCElViewConRef!: ViewContainerRef;

  get currentMediaAsync() {
    return firstValueFrom(
      this._store.pipe(select(currentMediaSelector), take(1))
    );
  }

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private readonly _rendererFactory: RendererFactory2,
    private readonly _htmlMovableElementService: HtmlMovableElementService,
    private readonly _store: Store<AppState>
  ) {
    this._hels = new HtmlCElementMap(_document, _store);
    this._renderer = _rendererFactory.createRenderer(null, null);
    this._window = _document.defaultView!;
  }

  async initializeAsync() {
    this._store.select(celementsSelector).subscribe((cels) => {
      const map = new Map<string, CustomElement>();
      cels.forEach((cel) => {
        map.set(cel.id, cel);

        if (this._hels.has(cel.id)) {
          this._hels.get(cel.id)!.cel = cel;
        }
      });
      this._celements = map;
    });

    const htmlEl = this._document.getElementById(
      AppConstants.HtmlRootSpaceElementId
    )!;

    const state = await firstValueFrom(
      this._store.pipe(select(uiEditorSpaceFeatureSelector), take(1))
    );
    const cel = state.celements.find(
      (x) => x.id === AppConstants.HtmlRootSpaceElementId
    )!;

    const hel: HtmlCElement = { cel, htmlEl, flexboxLayout: 'relative' };

    this._hels.set(AppConstants.HtmlRootSpaceElementId, hel);
  }

  bindEventsToCElements() {
    const htmlEls = this._document.getElementsByClassName(
      AppConstants.HtmlElementClassName
    );

    for (var i = 0; i < htmlEls.length; i++) {
      const el = htmlEls[i];
      const elId = el.getAttribute('id')!;

      el.addEventListener('click', (e: Event) => this.onCElementClick(elId, e));
    }
  }

  /**
   *
   * @param celId
   * @param styles styles to set
   * @param saveCurrent true -> save current elements styles
   */
  async setStylesAsync(
    celId: string,
    styles: KeyValuePairModel[],
    saveCurrent = true
  ) {
    const helm = await this._hels.getHelmAsync(celId);
    if (!helm) return;

    if (!saveCurrent) this._renderer.removeAttribute(helm.htmlEl, 'style');

    styles.forEach((style) => {
      this._renderer.setStyle(helm.htmlEl, style.name, style.value);
    });
  }

  async removeStyles(celId: string, styles: ElementStyle[]) {
    const helm = await this._hels.getHelmAsync(celId);
    if (!helm) return;

    styles.forEach((style) => {
      this._renderer.removeStyle(helm.htmlEl, style.name);
    });
  }

  /**
   * Get element style
   * @param withDom if true and style not bind to cel, find in current dom tree
   */
  async getStyleAsync(
    media: MediaType,
    celId: string,
    styleName: string,
    withDom = false
  ) {
    const helm = await this._hels.getHelmAsync(celId);

    if (!helm) return undefined;

    let style = helm.cel.mediaStyles
      .get(media)!
      .find((x) => x.name === styleName);

    if (style || !withDom) return style?.value;

    const styles = this._window.getComputedStyle(helm.htmlEl);
    return styles.getPropertyValue(styleName);
  }

  async updateFlexboxPositionAsync(
    celId: string,
    position?: FlexboxCelPosition
  ) {
    const helm = (await this._hels.getHelmAsync(celId))!;
    const currentMedia = await this.currentMediaAsync;
    const flexboxClass = HtmlCElementService.getFlexboxColClass(currentMedia);

    helm.htmlEl.classList.forEach((cls) => {
      if (!cls.startsWith(flexboxClass.prefix)) return;

      this._renderer.removeClass(helm.htmlEl, cls);
    });

    if (position) {
      this._renderer.addClass(
        helm.htmlEl,
        `${flexboxClass.prefix}${position.marginLeftCols}-${position.widthCols}-${flexboxClass.cols}`
      );
    }
  }

  static getFlexboxColClass(media: MediaType) {
    switch (media) {
      case MediaType.None:
      case MediaType.Desktop:
      case MediaType.Laptop:
        return { prefix: 'col-xxl-', cols: 12 };
      case MediaType.Tablet:
        return { prefix: 'col-xl-', cols: 8 };
      case MediaType.Phone:
        return { prefix: 'col-sm-', cols: 4 };
      default:
        throw Error(`MediaType: ${media} not suppported`);
    }
  }

  addCElement(cel: CustomElement, appendToId: string) {
    if (this._hels.has(cel.id)) {
      console.log(`Can not add element, element with ${cel.id} already exist`);
      return;
    }

    const appendToHtmlEl = this._document.getElementById(appendToId);

    if (!appendToHtmlEl) return;

    const htmlEl = this._document.createElement(cel.tagName);
    this._renderer.addClass(htmlEl, 'rittry-element');
    htmlEl.setAttribute('id', cel.id);

    this._renderer.appendChild(appendToHtmlEl, htmlEl);

    this._hels.set(cel.id, {
      cel,
      htmlEl,
      flexboxLayout: 'relative',
    });
  }

  async getElementAsync(celId: string) {
    return await this._hels.getHelmAsync(celId);
  }

  getElements(exceptRoot = true) {
    let helms = Array.from(this._hels);

    if (exceptRoot)
      helms = helms.filter((x) => x[0] !== AppConstants.HtmlRootSpaceElementId);

    return helms.map((x) => x[1]);
  }

  async removeCElementAsync(celId: string) {
    const hel = await this._hels.getHelmAsync(celId);

    if (!hel) return;

    hel.moveable?.destroy();
    hel.fastAtionCompRef?.destroy();
    hel.htmlEl.remove();
    this._hels.delete(celId);
  }

  async removeMovaebleAsync(celid: string) {
    const helm = await this._hels.getHelmAsync(celid);
    const movaeble = helm?.moveable;

    if (!helm || !movaeble) return;

    this.removeSelection(helm);
  }

  async onCElementSelectAsync(celId: string) {
    let hel = await this._hels.getHelmAsync(celId);
    // this._hels.set(celId, hel!);

    console.log(hel === this._hels.get(celId));

    if (!hel) {
      console.log(`Can not find html element with id ${celId}`);
      return;
    }

    // const cel = this._celements.get(celId)!;
    // const htmlEl = this._document.getElementById(celId);

    // if (!htmlEl) {
    //   console.log(`Can not find html element with id ${celId}`);
    //   return;
    // }

    let parentHtmlEl = this._document.getElementById(hel.cel.parentCelId);

    // if (!hel) {
    //   hel = { cel, htmlEl };
    //   this._htmlEls.set(celId, hel);
    // }

    this._hels.forEach((x) => {
      this.removeSelection(x);
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
      parentHtmlEl!,
      hel.htmlEl,
      {
        draggable: window.getComputedStyle(hel.htmlEl).position === 'absolute',
      }
    );

    hel.moveable = moveable;

    const fastActionCompRef = this.spaceCElViewConRef.createComponent(
      CElementFastActionComponent
    );
    fastActionCompRef.instance.celId = celId;

    this._renderer.appendChild(
      hel.htmlEl,
      fastActionCompRef.location.nativeElement
    );

    hel.fastAtionCompRef = fastActionCompRef;
  }

  private onCElementClick(celId: string, e: Event) {
    e.stopImmediatePropagation();

    const htmlEl = e.currentTarget as HTMLElement;
    const elId = htmlEl.getAttribute('id');
    const parentHtmlEl = (htmlEl.parentNode as HTMLElement).closest(
      '.' + AppConstants.HtmlElementClassName
    ) as HTMLElement;
    let parentCelId = undefined;

    if (!elId)
      throw Error(
        `Can not find id attribute on ${AppConstants.HtmlElementClassName} element`
      );

    if (elId !== AppConstants.HtmlRootSpaceElementId) {
      if (!parentHtmlEl) {
        throw Error(
          `Can not find parent element with class name: ${AppConstants.HtmlElementClassName}`
        );
      }

      parentCelId = parentHtmlEl.getAttribute('id');

      if (!parentCelId) {
        throw Error(
          `Can not find id attribute for parent el to el with id: ${elId}`
        );
      }
    }

    const children: { celId: string; tagName: string }[] = [];
    for (var i = 0; i < htmlEl.children.length; i++) {
      const hel = htmlEl.children[i];

      if (!hel.classList.contains(AppConstants.HtmlElementClassName)) continue;

      const celId = hel.getAttribute('id');
      if (!celId) {
        console.log(`${hel} element without id not supported will be skiped`);
        return;
      }

      children.push({ celId, tagName: hel.tagName });
    }

    this._store.dispatch(
      selectCElAction({
        celId,
        parentCelId: parentCelId ?? 'it-is-root-el', //TODO maybe remake
        celTag: htmlEl.tagName,
        celStyles: new ElementStyles(),
        children,
      })
    );
  }

  private removeSelection(helm: HtmlCElement) {
    helm.moveable?.destroy();
    helm.moveable = undefined;
    helm.fastAtionCompRef?.destroy();
    helm.fastAtionCompRef = undefined;
  }
}
