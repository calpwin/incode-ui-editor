import { ElementStyle } from './../store/element-style';
import { CelementPosition } from './../store/celement-position';
import { CodeEditorService } from './../../services/code-editor.service';
import { AppState } from './../store/initial.state';
import {
  addCElementAction,
  changeCElementFlexboxColAction,
  changeCElementPositionAction,
  changeCElementStyleAction,
  removeCElementAction,
  removeCElementStylesAction,
  selectCElAction,
} from '../actions/celement.actions';
import { HtmlCElementService } from '../../services/html-celement.service';
import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { withLatestFrom, switchMap, map, from, of, forkJoin } from 'rxjs';
import { currentRootElSelector } from '../selectors/space.selectors';
import {
  changeCssAction,
  changeHtmlAction,
} from '../actions/code-editor.actions';
import { ElementStyles } from '../store/element-style';

@Injectable()
export class CElementEffects {
  changeCElementStyle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changeCElementStyleAction),
      switchMap(({ celId: celId, styles }) =>
        this._htmlCElementService.setStylesAsync(celId, [...styles])
      ),
      map((_) => changeCssAction())
    )
  );

  changeCElementPosition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changeCElementPositionAction),
      switchMap(({ celId: celId, position }) =>
        from(this._htmlCElementService.removeMovaebleAsync(celId)).pipe(
          map((_) =>
            changeCElementStyleAction({
              celId,
              styles: new ElementStyles(
                ...CelementPosition.stylesFromPositionType(position)
              ),
            })
          )
        )
      )
    )
  );

  changeCElementFlexboxColAction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changeCElementFlexboxColAction),
      switchMap(({ celId, position }) =>
        of(
          this._htmlCElementService.updateFlexboxPositionAsync(celId, position)
        ).pipe(
          map((_) =>
            removeCElementStylesAction({
              celId,
              styles: [new ElementStyle('width', '')],
            })
          )
        )
      )
    )
  );

  removeCElementStylesAction$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(removeCElementStylesAction),
        switchMap(({ celId, styles }) =>
          this._htmlCElementService.removeStyles(celId, styles)
        )
      ),
    { dispatch: false }
  );

  addCElement$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addCElementAction),
      withLatestFrom(this.store$.select(currentRootElSelector)),
      switchMap(([{ cel }, spaceElId]) =>
        of(
          this._htmlCElementService.addCElement(cel, spaceElId),
          this._htmlCElementService.bindEventsToCElements(),
          this._codeEditorService.addElToDom(cel, spaceElId)
        ).pipe(map((_) => changeHtmlAction()))
      )
    )
  );

  removeCElement$ = createEffect(() =>
    this.actions$.pipe(
      ofType(removeCElementAction),
      switchMap(({ celId }) =>
        forkJoin([
          this._htmlCElementService.removeCElementAsync(celId),
          of(this._codeEditorService.removeElFromDom(celId)),
        ]).pipe(map((x) => changeHtmlAction()))
      )
    )
  );

  selectCElAction$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(selectCElAction),
        switchMap(({ celId }) =>
          this._htmlCElementService.onCElementSelectAsync(celId)
        )
      ),
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly _htmlCElementService: HtmlCElementService,
    private readonly _codeEditorService: CodeEditorService,
    private readonly store$: Store<AppState>
  ) {}
}
