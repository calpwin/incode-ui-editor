import { VsCodeService } from 'src/app/services/vscode.service';
import {
  changeMediaAction,
} from './../actions/space.actions';
import { currentRootElSelector } from './../selectors/space.selectors';
import { CodeEditorService } from './../../services/code-editor.service';
import { AppState, ElementStyle } from './../store/initial.state';
import { HtmlCElementService } from '../../services/html-celement.service';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, withLatestFrom } from 'rxjs';
import { changeCElementStyleAction } from '../actions/celement.actions';
import {
  changeRootCElLayoutAlignAction,
} from '../actions/space.actions';

@Injectable()
export class SpaceEffects {
  changeRootElLayoutAlign$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changeRootCElLayoutAlignAction),
      withLatestFrom(this.store$.select(currentRootElSelector)),
      switchMap(([{ toLayoutAlign }, rootCelId]) => {
        return [
          changeCElementStyleAction({
            celId: rootCelId,
            styles: [ElementStyle.fromLayoutAlign(toLayoutAlign)],
          }),
        ];
      })
    )
  );

  changeMedia$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(changeMediaAction),
        switchMap(({ fromMedia, toMedia }) => {
          this._codeEditorService.syncEditorStyles();

          this._vsCodeService.writeCssToFile(fromMedia);
          this._vsCodeService.readCssFile(toMedia);
          return [];
        })
      ),
    { dispatch: false }
  );

  constructor(
    private readonly actions$: Actions,
    private readonly _htmlCElementService: HtmlCElementService,
    private readonly _codeEditorService: CodeEditorService,
    private readonly _vsCodeService: VsCodeService,
    private readonly store$: Store<AppState>
  ) {}
}