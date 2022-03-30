import { ElementStyle, ElementStyles } from './../ngrx/store/element-style';
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Store } from '@ngrx/store';
import Moveable, { MoveableOptions, OnScale } from 'moveable';
import { changeCElementStyleAction } from '../ngrx/actions/celement.actions';
import { KeyValuePairModel } from '../ngrx/store/element-style';

@Injectable({
  providedIn: 'root',
})
export class HtmlMovableElementService {
  private readonly _renderer: Renderer2;

  constructor(
    rendererFactory: RendererFactory2,
    private readonly _store: Store<any>,
  ) {
    this._renderer = rendererFactory.createRenderer(null, null);
  }

  public initialize() {
    // this._store
    //   .select(addUiElementSelector)
    //   .pipe(withLatestFrom(this._store.select(currentSpaceElementSelector)))
    //   .subscribe(([el, speceEl]) => {
    //     if (el) {
    //       this.makeMovable(el, speceEl);
    //     }
    //   });
    // this._store
    //   .select(lastElementStyleChangedSelector)
    //   .pipe(withLatestFrom(this._store.select(elementsSelector)))
    //   .subscribe(([style, els]) => {
    //     if (!style || !els) return;
    //     this.changeElementStyles({
    //       el: els.find((x) => x.id === style.elId)!,
    //       styles: style.changedStyles,
    //     });
    //   });
    // this._store.select(changeAttributeElementSelector).subscribe((changes) => {
    //   if (changes)
    //     this.changeElementAttributes({
    //       el: changes.el,
    //       attributes: changes.changedAttributes,
    //     });
    // });
  }

  public makeMovable(
    parentElement: HTMLElement,
    movableElement: HTMLElement,
    options?: MoveableOptions
  ) {
    const moveable = new Moveable(parentElement, {
      ...{
        target: movableElement,
        // If the container is null, the position is fixed. (default: parentElement(document.body))
        container: parentElement,
        draggable: true,
        resizable: true,
        scalable: true,
        rotatable: true,
        warpable: true,
        // Enabling pinchable lets you use events that
        // can be used in draggable, resizable, scalable, and rotateable.
        pinchable: true, // ["resizable", "scalable", "rotatable"]
        origin: true,
        keepRatio: false,
        // Resize, Scale Events at edges.
        edge: false,
        throttleDrag: 0,
        throttleResize: 0,
        throttleScale: 0,
        throttleRotate: 0,
        dragArea: true,
      },
      ...options,
    });

    let frame = {
      translate: [0, 0],
    };

    /* draggable */
    moveable
      .on('click', ({ target, inputEvent }) => {
        inputEvent.stopImmediatePropagation();
      })
      .on('dragStart', ({ target, clientX, clientY, inputEvent }) => {
        inputEvent.stopImmediatePropagation();
      })
      .on(
        'drag',
        ({
          target,
          transform,
          left,
          top,
          right,
          bottom,
          beforeDelta,
          beforeDist,
          delta,
          dist,
          clientX,
          clientY,
          inputEvent
        }) => {
          // target!.style.left = `${left}px`;
          // target!.style.top = `${top}px`;

          const id = target!.getAttribute('id');

          if (id) {
            this._store.dispatch(
              changeCElementStyleAction({
                celId: id,
                styles: new ElementStyles(
                  new KeyValuePairModel('left', `${left}px`),
                  new KeyValuePairModel('top', `${top}px`),
                ),
              })
            );
          }

          inputEvent.stopImmediatePropagation();
        }
      )
      .on('dragEnd', ({ target, isDrag, clientX, clientY }) => {
        // console.log('onDragEnd', target, isDrag);
      });

    /* resizable */
    moveable
      .on('resizeStart', ({ inputEvent }) => {
        // console.log('onResizeStart', e.target);

        inputEvent.stopPropagation();
      })
      .on(
        'resize',
        ({
          target,
          width,
          height,
          dist,
          delta,
          clientX,
          clientY,
          inputEvent,
        }) => {
          // console.log('onResize', target);
          // delta[0] && (target!.style.width = `${width}px`);
          // delta[1] && (target!.style.height = `${height}px`);

          const id = target!.getAttribute('id');
          if (id) {
            this._store.dispatch(
              changeCElementStyleAction({
                celId: id,
                styles: new ElementStyles(
                  new KeyValuePairModel('width', `${width}px`),
                  new KeyValuePairModel('height', `${height}px`),
                ),
              })
            );
            // this.addOrUpdateStyle({
            //   id,
            //   values: [
            //     { name: 'width', value: `${width}px` },
            //     { name: 'height', value: `${height}px` },
            //   ],
            // });
          }

          inputEvent.stopPropagation();
        }
      )
      .on('resizeEnd', ({ target, isDrag, clientX, clientY }) => {
        // console.log('onResizeEnd', target, isDrag);
      });

    /* scalable */
    moveable
      .on('scaleStart', ({ target, clientX, clientY }) => {
        // console.log('onScaleStart', target);
      })
      .on(
        'scale',
        ({
          target,
          scale,
          dist,
          delta,
          transform,
          clientX,
          clientY,
        }: OnScale) => {
          // console.log('onScale scale', scale);
          // target!.style.transform = transform;

          const id = target!.getAttribute('id');
          if (id) {
            this._store.dispatch(
              changeCElementStyleAction({
                celId: id,

                styles: new ElementStyles(new KeyValuePairModel('transform', `${transform}px`)),
              })
            );
          }
        }
      )
      .on('scaleEnd', ({ target, isDrag, clientX, clientY }) => {
        // console.log('onScaleEnd', target, isDrag);
      });

    /* rotatable */
    moveable
      .on('rotateStart', ({ target, clientX, clientY }) => {
        // console.log('onRotateStart', target);
      })
      .on(
        'rotate',
        ({ target, beforeDelta, delta, dist, transform, clientX, clientY }) => {
          // console.log('onRotate', dist);
          // target!.style.transform = transform;

          const id = target!.getAttribute('id');
          if (id) {
            this._store.dispatch(
              changeCElementStyleAction({
                celId: id,
                styles: new ElementStyles(new KeyValuePairModel('transform', transform)),
              })
            );
          }
        }
      )
      .on('rotateEnd', ({ target, isDrag, clientX, clientY }) => {
        // console.log('onRotateEnd', target, isDrag);
      });

    /* warpable */
    let matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    moveable
      .on('warpStart', ({ target, clientX, clientY }) => {
        // console.log('onWarpStart', target);
      })
      .on(
        'warp',
        ({ target, clientX, clientY, delta, dist, multiply, transform }) => {
          // console.log('onWarp', target);
          // target.style.transform = transform;
          matrix = multiply(matrix, delta);
          target.style.transform = `matrix3d(${matrix.join(',')})`;
        }
      )
      .on('warpEnd', ({ target, isDrag, clientX, clientY }) => {
        // console.log('onWarpEnd', target, isDrag);
      });

    return moveable;
  }
}
