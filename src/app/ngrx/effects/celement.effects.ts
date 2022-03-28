import { CelementPosition } from './../store/celement-position';
import { CodeEditorService } from './../../services/code-editor.service';
import { AppState } from './../store/initial.state';
import {
  addCElementAction,
  changeCElementFlexboxColAction,
  changeCElementPositionAction,
  changeCElementStyleAction,
  removeCElementAction,
  selectCElAction,
} from '../actions/celement.actions';
import { HtmlCElementService } from '../../services/html-celement.service';
import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { withLatestFrom, switchMap } from 'rxjs';
import { currentRootElSelector } from '../selectors/space.selectors';
import {
  changeCssAction,
  changeHtmlAction,
} from '../actions/code-editor.actions';

@Injectable()
export class CElementEffects {
  changeCElementStyle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changeCElementStyleAction),
      switchMap(({ celId: celId, styles }) => {
        this._htmlCElementService.setStyles(celId, [...styles]);

        return [changeCssAction()];
      })
    )
  );

  changeCElementPosition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changeCElementPositionAction),
      switchMap(({ celId: celId, position }) => {
        this._htmlCElementService.removeMovaeble(celId);

        return [
          changeCElementStyleAction({
            celId,
            styles: CelementPosition.stylesFromPositionType(position),
          }),
        ];
      })
    )
  );

  changeCElementFlexboxColAction$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(changeCElementFlexboxColAction),
        switchMap(async ({ celId, position }) => {
          await this._htmlCElementService.updateFlexboxPosition(
            celId,
            position
          );

          return [];
        })
      ),
    { dispatch: false }
  );

  addCElement$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addCElementAction),
      withLatestFrom(this.store$.select(currentRootElSelector)),
      switchMap(([{ cel }, spaceElId]) => {
        this._htmlCElementService.addCElement(cel, spaceElId);
        this._htmlCElementService.bindEventsToCElements();

        this._codeEditorService.addElToDom(cel, spaceElId);

        return [changeHtmlAction()];
      })
    )
  );

  removeCElement$ = createEffect(() =>
    this.actions$.pipe(
      ofType(removeCElementAction),
      switchMap(({ celId }) => {
        this._htmlCElementService.removeCElement(celId);

        this._codeEditorService.removeElFromDom(celId);

        return [changeHtmlAction()];
      })
    )
  );

  selectCElAction$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(selectCElAction),
        switchMap(({ celId }) => {
          this._htmlCElementService.onCElementSelect(celId);

          return [];
        })
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
