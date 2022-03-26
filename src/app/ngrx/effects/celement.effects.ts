import { CElementSerive } from './../../services/celement.service';
import { CelementPosition } from './../store/celement-position';
import { CodeEditorService } from './../../services/code-editor.service';
import { AppState, KeyValuePairModel } from './../store/initial.state';
import {
  addCElementAction,
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
import { celementsSelector } from '../selectors/celement.selectors';

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

  selectCElAction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(selectCElAction),
      withLatestFrom(this.store$.select(celementsSelector)),
      switchMap(([{ celId }, cels]) => {
        const cel = cels.find(x => x.celId === celId)!;
        this._cElementSerive.addCElement(cel);

        return []
      })
    ),
    {dispatch: false}
  );

  constructor(
    private readonly actions$: Actions,
    private readonly _htmlCElementService: HtmlCElementService,
    private readonly _codeEditorService: CodeEditorService,
    \private readonly _cElementSerive: CElementSerive,
    private readonly store$: Store<AppState>
  ) {}
}
