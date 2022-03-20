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
import { createSelector, State, Store } from '@ngrx/store';
import { SignalRService } from '../hub-connection';

import * as Split from 'split.js';
import { DOCUMENT } from '@angular/common';
import { StartupService } from '../services/startup.service';
import { SpaceMedia } from '../store/space-media';

@Component({
  selector: 'rittry-space',
  templateUrl: './space.component.html',
  styleUrls: ['./space.component.scss'],
})
export class SpaceComponent implements OnInit, AfterViewInit {
  @ViewChild('mainSpace') _mainSpace!: ElementRef<HTMLElement>;
  @ViewChild('ideWrapper') _ideWrapper!: ElementRef;
  @ViewChild('appendCustomElement')
  _appendCustomElement!: ElementRef<HTMLElement>;

  public selectedElement?: {
    position: string;
  };

  constructor(
    private signalRService: SignalRService,
    private readonly _renderer: Renderer2,
    private readonly _startupService: StartupService,
    private _store: Store<any>,
    @Inject(DOCUMENT) private _document: Document
  ) {
    _startupService.bindApplicationEvents();
  }

  ngOnInit(): void {
    // this.signalRService.startConnection();
    // this.signalRService.addTransferChartDataListener();
  }

  ngAfterViewInit(): void {
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

    // split(
    //   [this._mainSpace.nativeElement, this._ideWrapper.nativeElement],
    //   splitOptions
    // );

    // this._renderer.listen(this._mainSpace.nativeElement, 'click', () => {
    //   this._store.dispatch(setSelectedElementAction({ elId: undefined }));
    // });

    // this._store.select(currentSpaceElementSelector).subscribe((spaceEl) => {
    //   this._currentSpaceElement = spaceEl;
    // });

    // this._store.select(selectedElementSelector).subscribe((selectedEl) => {
    //   this.сhangeSelectedElement(selectedEl);
    // });

    // this._store.select(changeGroupingElementsSelector).subscribe((els) => {
    //   this.groupingElements = els;
    // });

    // this._store.dispatch(
    //   startChangeSpaceMediaAction({ media: SpaceMedia[SpaceMedia.Desktop] })
    // );
  }

  public changeSpaceSize(spaceMedia: string) {
    const rect = this._mainSpace.nativeElement.getBoundingClientRect();
    let scale = 1;

    switch (spaceMedia) {
      case SpaceMedia[SpaceMedia.Phone]:
        if (rect.width < 480) {
          scale = rect.width / 480;
        }

        this._renderer.setStyle(
          this._appendCustomElement.nativeElement,
          'transform',
          `scale(${scale})`
        );
        this._renderer.setStyle(
          this._appendCustomElement.nativeElement,
          'flex-basis',
          '480px'
        );

        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-sm'
        );
        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-xl'
        );
        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-xxl'
        );
        this._renderer.addClass(
          this._appendCustomElement.nativeElement,
          'layout-sm'
        );
        break;
      case SpaceMedia[SpaceMedia.Tablet]:
        if (rect.width < 768) {
          scale = rect.width / 768;
        }

        this._renderer.setStyle(
          this._appendCustomElement.nativeElement,
          'transform',
          `scale(${scale})`
        );
        this._renderer.setStyle(
          this._appendCustomElement.nativeElement,
          'flex-basis',
          '768px'
        );

        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-sm'
        );
        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-xl'
        );
        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-xxl'
        );
        this._renderer.addClass(
          this._appendCustomElement.nativeElement,
          'layout-xl'
        );
        break;
      case SpaceMedia[SpaceMedia.Laptop]:
        if (rect.width < 1024) {
          scale = rect.width / 1024;
        }

        this._renderer.setStyle(
          this._appendCustomElement.nativeElement,
          'transform',
          `scale(${scale})`
        );
        this._renderer.setStyle(
          this._appendCustomElement.nativeElement,
          'flex-basis',
          '1024px'
        );

        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-sm'
        );
        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-xl'
        );
        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-xxl'
        );
        this._renderer.addClass(
          this._appendCustomElement.nativeElement,
          'layout-xl'
        );
        break;
      case SpaceMedia[SpaceMedia.Desktop]:
        if (rect.width < 1200) {
          scale = rect.width / 1200;
        }

        this._renderer.setStyle(
          this._appendCustomElement.nativeElement,
          'transform',
          `scale(${scale})`
        );
        this._renderer.setStyle(
          this._appendCustomElement.nativeElement,
          'flex-basis',
          '1200px'
        );

        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-sm'
        );
        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-xl'
        );
        this._renderer.removeClass(
          this._appendCustomElement.nativeElement,
          'layout-xxl'
        );
        this._renderer.addClass(
          this._appendCustomElement.nativeElement,
          'layout-xxl'
        );
        break;
    }

    // this._store.dispatch(
    //   startChangeSpaceMediaAction({
    //     media: spaceMedia,
    //   })
    // );
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
