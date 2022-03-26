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
import { Store } from '@ngrx/store';
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

  currentMedia = MediaType.None;
  MediaType = MediaType;
  AppConstants = AppConstants;
  ElementLayoutAlign = CElementLayoutAlign;

  public currentSelectedCel?: CustomElement;

  constructor(
    private signalRService: SignalRService,
    private readonly _renderer: Renderer2,
    private readonly _startupService: StartupService,
    private readonly _htmlElementService: HtmlCElementService,
    private readonly _store: Store<any>,
    @Inject(DOCUMENT) private readonly _document: Document,
    private readonly _viewContainerRef: ViewContainerRef
  ) {
    _startupService.bindApplicationEvents();
  }

  ngOnInit(): void {
    // this.signalRService.startConnection();
    // this.signalRService.addTransferChartDataListener();
  }

  async ngAfterViewInit() {
    this.bindSpaceEvents();

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

    await this._htmlElementService.initialize();
    this._htmlElementService.spaceCElViewConRef = this._viewContainerRef;
    this._htmlElementService.bindEventsToCElements();
  }

  public changeMedia(media: MediaType) {
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
    }

    this._store.dispatch(
      changeMediaAction({
        fromMedia: this.currentMedia, toMedia: media,
      })
    );
  }

  addCElement() {
    this._store.dispatch(
      addCElementAction({
        cel: new NewCustomElement('div'),
      })
    );
  }

  saveCodeToIde() {
    this._store.dispatch(saveCodeAction());
  }

  changeRootElLayoutAlign(align: CElementLayoutAlign) {
    this._store.dispatch(
      changeRootCElLayoutAlignAction({ toLayoutAlign: align })
    );
  }

  toggleCurrentCElPosition() {
    if (!this.currentSelectedCel) return;

    const position = this._htmlElementService.getStyle(
      this.currentMedia,
      this.currentSelectedCel.id,
      'position',
      true
    );

    this._store.dispatch(
      changeCElementPositionAction({
        celId: this.currentSelectedCel.id,
        position:
          position === 'absolute'
            ? CelementPositionType.Relative
            : CelementPositionType.Absolute,
      })
    );
  }

  private bindSpaceEvents() {
    this._store
      .select(existNotSavedCodeChangesSelector)
      .subscribe((existNotSavedCodeChanges) => {
        this.existNotSavedCodeChanges = existNotSavedCodeChanges;
      });

    this._store.select(currentMediaSelector).subscribe((media) => {
      this.currentMedia = media;
    });

    this._store.select(currentSelectedCELSelector).subscribe((celId) => {
      if (!celId) {
        this.currentSelectedCel = undefined;
        return;
      }

      const helm = this._htmlElementService.getElement(celId)!;
      this.currentSelectedCel = helm.cel;
    });
  }

  // private сhangeSelectedElement(selectedEl: CustomElement | undefined) {
  //   if (this.selectedElement) {
  //     this._renderer.removeChild(
  //       this.selectedElement.element.htmlEl,
  //       this.selectedElement.fastElementActionHtmlElement
  //     );
  //   }

  //   if (!selectedEl) {
  //     this.selectedElement = undefined;
  //     return;
  //   }

  //   const element = this._elementService.getElement(selectedEl.id);
  //   if (!element) return;

  //   const elementFastActionComponentFactory =
  //     this.componentFactoryResolver.resolveComponentFactory(
  //       ElementFastActionComponent
  //     );
  //   const elementFastActionComponent = this.viewContainerRef.createComponent(
  //     elementFastActionComponentFactory
  //   );

  //   // const closeBtnElement = this._renderer.createElement('div') as HTMLElement;
  //   // this._renderer.addClass(closeBtnElement, 'element-fast-action-wrapper');
  //   // this._renderer.listen(closeBtnElement, 'click', (event) => {
  //   //   this._store.dispatch(
  //   //     removeCustomElementAction({
  //   //       element: element.customEl,
  //   //       fromStorage: true,
  //   //     })
  //   //   );
  //   // });

  //   elementFastActionComponent.instance.groupRootEl = element.customEl;
  //   elementFastActionComponent.instance.currentSpaceEl =
  //     this._currentSpaceElement;

  //   const htmlEl = this._document.getElementById(selectedEl.id) as HTMLElement;

  //   this._renderer.appendChild(
  //     htmlEl,
  //     elementFastActionComponent.location.nativeElement
  //   );

  //   const elPosition = element.customEl.styles.find(
  //     (x) => x.name === 'position'
  //   );
  //   this.selectedElement = {
  //     element: { customEl: element.customEl, htmlEl: element.htmlEl },
  //     fastElementActionHtmlElement:
  //       elementFastActionComponent.location.nativeElement,
  //     position: elPosition?.value ?? 'relative',
  //   };
  // }

  // public changeSelectedElPosition() {
  //   if (!this.selectedElement) return;

  //   const newPosition =
  //     this.selectedElement.element.htmlEl.style.position === 'absolute'
  //       ? 'relative'
  //       : 'absolute';

  //   this._store.dispatch(
  //     addOrUpdateElementStyleAction({
  //       elId: this.selectedElement.element.customEl.id,
  //       styles: [new KeyValuePairModel('position', newPosition)],
  //     })
  //   );

  //   this.selectedElement.position = newPosition;
  // }

  // public setParentElementJustifyContent(direction: string) {
  //   if (!this._currentSpaceElement) return;

  //   switch (direction) {
  //     case 'left':
  //       this._store.dispatch(
  //         addOrUpdateElementStyleAction({
  //           elId: this._currentSpaceElement.id,
  //           styles: [
  //             { name: 'justify-content', value: 'flex-start' },
  //             { name: 'display', value: 'flex' },
  //           ],
  //         })
  //       );
  //       break;
  //     case 'vertical':
  //       this._store.dispatch(
  //         addOrUpdateElementStyleAction({
  //           elId: this._currentSpaceElement.id,
  //           styles: [
  //             { name: 'justify-content', value: 'space-around' },
  //             { name: 'display', value: 'flex' },
  //           ],
  //         })
  //       );
  //       break;
  //     case 'right':
  //       this._store.dispatch(
  //         addOrUpdateElementStyleAction({
  //           elId: this._currentSpaceElement.id,
  //           styles: [
  //             { name: 'justify-content', value: 'flex-end' },
  //             { name: 'display', value: 'flex' },
  //           ],
  //         })
  //       );
  //       break;
  //   }
  // }

  // public addElement() {
  //   this._store.dispatch(
  //     addCustomElementAction(
  //       new NewCustomElement(
  //         Date.now().toString(),
  //         'rittry-element',
  //         [
  //           { name: 'background-color', value: 'red' },
  //           { name: 'width', value: '100px' },
  //           { name: 'height', value: '50px' }
  //         ]
  //       )
  //     )
  //   );
  // }

  // public toggleGroupingElements() {
  //   this._store.dispatch(groupElementsAction());
  // }
}
