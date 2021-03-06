import { HtmlMovableElementService } from './../services/html-movable-celement.service';
import { currentRootElSelector } from './../ngrx/selectors/space.selectors';
import {
  ElementStyle,
  ElementStyles,
  FlexboxCelPosition,
} from './../ngrx/store/element-style';
import {
  changeCElementFlexboxColAction,
  changeCElementStyleAction,
} from './../ngrx/actions/celement.actions';
import { celementsSelector } from './../ngrx/selectors/celement.selectors';
import { AppConstants } from 'src/app/services/app.constant';
import { CelementPositionType } from './../ngrx/store/celement-position';
import { changeCElementPositionAction } from '../ngrx/actions/celement.actions';
import { CustomElement } from './../ngrx/store/custom-element.state';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { SignalRService } from '../hub-connection';

import * as Split from 'split.js';
import { DOCUMENT } from '@angular/common';
import { StartupService } from '../services/startup.service';
import { MediaType, CElementLayoutAlign } from '../ngrx/store/space-media';
import { HtmlCElementService } from '../services/html-celement.service';
import { addCElementAction } from '../ngrx/actions/celement.actions';
import { NewCustomElement } from '../ngrx/store/custom-element.state';
import { existNotSavedCodeChangesSelector } from '../ngrx/selectors/code-editor.selectors';
import { saveCodeAction } from '../ngrx/actions/code-editor.actions';
import {
  changeMediaAction,
  changeRootCElLayoutAlignAction,
} from '../ngrx/actions/space.actions';
import {
  currentMediaSelector,
  currentSelectedCELSelector,
} from '../ngrx/selectors/space.selectors';
import { firstValueFrom, map, take, withLatestFrom } from 'rxjs';
import Moveable from 'moveable';

@Component({
  selector: 'rittry-space',
  templateUrl: './space.component.html',
  styleUrls: ['./space.component.scss'],
})
export class SpaceComponent implements OnInit, AfterViewInit {
  @ViewChild('mainSpace') _mainSpace!: ElementRef<HTMLElement>;
  @ViewChild('ideWrapper') _ideWrapper!: ElementRef;
  @ViewChild('appendCustomElement')
  appendCElementToViewRef!: ElementRef<HTMLElement>;

  existNotSavedCodeChanges = false;

  MediaType = MediaType;
  AppConstants = AppConstants;
  ElementLayoutAlign = CElementLayoutAlign;

  get currentMediaAsync() {
    return this._store.pipe(select(currentMediaSelector), take(1));
  }

  selectedCelFlexboxPosition?: FlexboxCelPosition;
  selectedCelFlexboxLayout?: 'col' | 'relative';
  currentRootCelFbLayooutDirection?: 'row' | 'column' = undefined;

  public get currentSelectedCelAsync() {
    return this._store.pipe(
      select(currentSelectedCELSelector),
      withLatestFrom(this._store.select(celementsSelector)),
      map(([celId, cels]) => {
        return cels.find((x) => x.id === celId);
      }),
      take(1)
    );
  }

  get currentRootCElementIdAsync() {
    return firstValueFrom(
      this._store.pipe(select(currentRootElSelector), take(1))
    );
  }

  constructor(
    private signalRService: SignalRService,
    private readonly _renderer: Renderer2,
    private readonly _startupService: StartupService,
    private readonly _htmlElementService: HtmlCElementService,
    private readonly _store: Store<any>,
    @Inject(DOCUMENT) private readonly _document: Document,
    private readonly _viewContainerRef: ViewContainerRef,
    private readonly _HtmlMovableElementService: HtmlMovableElementService
  ) {
    _startupService.bindApplicationEvents();
  }

  ngOnInit(): void {
    // this.signalRService.startConnection();
    // this.signalRService.addTransferChartDataListener();
  }

  async ngAfterViewInit() {
    await this.bindSpaceEventsAsync();

    this._startupService.appInit();

    this._renderer.setStyle(
      this._mainSpace.nativeElement,
      'width',
      this._mainSpace.nativeElement.getBoundingClientRect().width + 'px'
    );

    const split = (Split as any).default;

    var splitOptions: Split.Options = {
      direction: 'vertical',
      sizes: [60, 40],
      gutterSize: 10,
      minSize: [0, 200],
    };

    await this._htmlElementService.initializeAsync();
    this._htmlElementService.spaceCElViewConRef = this._viewContainerRef;
    this._htmlElementService.bindEventsToCElements();
  }

  public async changeMedia(media: MediaType) {
    const rect = this._mainSpace.nativeElement.getBoundingClientRect();
    let scale = 1;

    switch (media) {
      case MediaType.Phone:
        if (rect.width < 480) {
          scale = rect.width / 480;
        }

        this._renderer.setStyle(
          this.appendCElementToViewRef.nativeElement,
          'transform',
          `scale(${scale})`
        );
        this._renderer.setStyle(
          this.appendCElementToViewRef.nativeElement,
          'flex-basis',
          '480px'
        );

        this._renderer.removeClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-sm'
        );
        this._renderer.removeClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-xl'
        );
        this._renderer.removeClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-xxl'
        );
        this._renderer.addClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-sm'
        );
        break;
      case MediaType.Tablet:
        if (rect.width < 768) {
          scale = rect.width / 768;
        }

        this._renderer.setStyle(
          this.appendCElementToViewRef.nativeElement,
          'transform',
          `scale(${scale})`
        );
        this._renderer.setStyle(
          this.appendCElementToViewRef.nativeElement,
          'flex-basis',
          '768px'
        );

        this._renderer.removeClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-sm'
        );
        this._renderer.removeClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-xl'
        );
        this._renderer.removeClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-xxl'
        );
        this._renderer.addClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-xl'
        );
        break;
      case MediaType.Laptop:
        if (rect.width < 1024) {
          scale = rect.width / 1024;
        }

        this._renderer.setStyle(
          this.appendCElementToViewRef.nativeElement,
          'transform',
          `scale(${scale})`
        );
        this._renderer.setStyle(
          this.appendCElementToViewRef.nativeElement,
          'flex-basis',
          '1024px'
        );

        this._renderer.removeClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-sm'
        );
        this._renderer.removeClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-xl'
        );
        this._renderer.removeClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-xxl'
        );
        this._renderer.addClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-xl'
        );
        break;
      case MediaType.Desktop:
        if (rect.width < 1200) {
          scale = rect.width / 1200;
        }

        this._renderer.setStyle(
          this.appendCElementToViewRef.nativeElement,
          'transform',
          `scale(${scale})`
        );
        this._renderer.setStyle(
          this.appendCElementToViewRef.nativeElement,
          'flex-basis',
          '1200px'
        );

        this._renderer.removeClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-sm'
        );
        this._renderer.removeClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-xl'
        );
        this._renderer.removeClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-xxl'
        );
        this._renderer.addClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-xxl'
        );
        break;
      case MediaType.None:
        this._renderer.removeStyle(
          this.appendCElementToViewRef.nativeElement,
          'transform'
        );
        this._renderer.removeStyle(
          this.appendCElementToViewRef.nativeElement,
          'flex-basis'
        );

        this._renderer.removeClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-sm'
        );
        this._renderer.removeClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-xl'
        );
        this._renderer.removeClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-xxl'
        );
        this._renderer.addClass(
          this.appendCElementToViewRef.nativeElement,
          'layout-xxl'
        );
        break;
    }

    this._store.dispatch(
      changeMediaAction({
        fromMedia: (await this.currentMediaAsync.toPromise())!,
        toMedia: media,
      })
    );
  }

  async addCElement() {
    const cel = new NewCustomElement('div');
    cel.parentCelId = await this.currentRootCElementIdAsync;

    this._store.dispatch(addCElementAction({ cel }));
  }

  saveCodeToIde() {
    this._store.dispatch(saveCodeAction());
  }

  changeRootElLayoutAlign(align: CElementLayoutAlign) {
    this._store.dispatch(
      changeRootCElLayoutAlignAction({ toLayoutAlign: align })
    );
  }

  async onSelectedCelMarginLeftColsChange(e: any) {
    const selectedCel = await firstValueFrom(this.currentSelectedCelAsync);

    this.selectedCelFlexboxPosition ??= new FlexboxCelPosition(0, 0);
    this.selectedCelFlexboxPosition.marginLeftCols = e.target.value;
  }

  async onSelectedCelWidthColsChange(e: any) {
    const selectedCel = await firstValueFrom(this.currentSelectedCelAsync);

    this.selectedCelFlexboxPosition ??= new FlexboxCelPosition(0, 0);
    this.selectedCelFlexboxPosition.widthCols = e.target.value;

    this._store.dispatch(
      changeCElementFlexboxColAction({
        celId: selectedCel!.id,
        position: new FlexboxCelPosition(
          this.selectedCelFlexboxPosition.marginLeftCols,
          this.selectedCelFlexboxPosition.widthCols
        ),
      })
    );
  }

  async toggleCurrentCElPosition() {
    if (!this.currentSelectedCelAsync) return;

    const currentSelectedCel = await firstValueFrom(
      this.currentSelectedCelAsync
    );
    const currentMedia = await firstValueFrom(this.currentMediaAsync);

    const position = await this._htmlElementService.getStyleAsync(
      currentMedia!,
      currentSelectedCel!.id,
      'position',
      true
    );

    this._store.dispatch(
      changeCElementPositionAction({
        celId: currentSelectedCel!.id,
        position:
          position === 'absolute'
            ? CelementPositionType.Relative
            : CelementPositionType.Absolute,
      })
    );
  }

  async toggleRootElLayoutDirection() {
    const rootCelId = await this.currentRootCElementIdAsync;
    const currentMedia = await firstValueFrom(this.currentMediaAsync);

    let directionStyleVal = (await this._htmlElementService.getStyleAsync(
      currentMedia!,
      rootCelId,
      'flex-direction',
      true
    )) as 'row' | 'column';

    directionStyleVal = directionStyleVal === 'row' ? 'column' : 'row';
    this.currentRootCelFbLayooutDirection = directionStyleVal;

    this._store.dispatch(
      changeCElementStyleAction({
        celId: rootCelId,
        styles: new ElementStyles(
          new ElementStyle('flex-direction', directionStyleVal)
        ),
      })
    );
  }

  async toggleElColLayout() {
    const selectedCel = await firstValueFrom(this.currentSelectedCelAsync);
    const media = await firstValueFrom(this.currentMediaAsync);

    if (!selectedCel || selectedCel.childrenIds.length === 0) return;

    const selectedHelm = (await this._htmlElementService.getElementAsync(
      selectedCel.id
    ))!;

    selectedHelm.flexboxLayout =
      selectedHelm.flexboxLayout === 'col' ? 'relative' : 'col';
    this.selectedCelFlexboxLayout = selectedHelm.flexboxLayout;

    selectedCel.childrenIds.forEach(async (celId) => {
      const helm = (await this._htmlElementService.getElementAsync(celId))!;

      if (this.selectedCelFlexboxLayout === 'col') {
        this._store.dispatch(
          changeCElementFlexboxColAction({
            celId,
            position: new FlexboxCelPosition(
              helm.cel.mediaStyles.getStyles(media).flexboxPosition
                ?.marginLeftCols ?? 1,
              helm.cel.mediaStyles.getStyles(media).flexboxPosition
                ?.widthCols ?? 1
            ),
          })
        );
      } else {
        this._store.dispatch(
          changeCElementFlexboxColAction({
            celId,
            position: undefined,
          })
        );
      }
    });
  }

  private async bindSpaceEventsAsync() {
    this._store
      .select(existNotSavedCodeChangesSelector)
      .subscribe((existNotSavedCodeChanges) => {
        this.existNotSavedCodeChanges = existNotSavedCodeChanges;
      });

    this._store
      .select(currentSelectedCELSelector)
      .pipe(withLatestFrom(this._store.select(celementsSelector)))
      .subscribe(async ([celId, cels]) => {
        const cel = cels.find((x) => x.id === celId);

        if (!cel) {
          this.selectedCelFlexboxPosition = undefined;
          return;
        }

        const hel = (await this._htmlElementService.getElementAsync(cel.id))!;

        const currentMedia = await firstValueFrom(this.currentMediaAsync);

        const position = new FlexboxCelPosition(0, 0);
        position.widthCols =
          cel.mediaStyles.getStyles(currentMedia).flexboxPosition?.widthCols ??
          0;
        position.marginLeftCols =
          cel.mediaStyles.getStyles(currentMedia).flexboxPosition
            ?.marginLeftCols ?? 0;

        if (position.notValid) {
          const flexboxClass =
            HtmlCElementService.getFlexboxColClass(currentMedia);
          hel.htmlEl.classList.forEach((cls) => {
            if (!cls.startsWith(flexboxClass.prefix)) return;

            let match = cls.match(`${flexboxClass.prefix}(\\d)+-(\\d)+-\\d+`);

            if (!match) return;

            position.marginLeftCols = Number(match[1]);
            position.widthCols = Number(match[2]);
          });
        }

        this.selectedCelFlexboxPosition = !position.notValid
          ? position
          : undefined;

        this.currentRootCelFbLayooutDirection = hel.flexboxDirection;
      });
  }
}
