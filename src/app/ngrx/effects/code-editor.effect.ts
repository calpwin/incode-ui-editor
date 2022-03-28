import { MediaHelper, MediaType } from './../store/space-media';
import { currentMediaSelector } from './../selectors/space.selectors';
import { HtmlCElementService } from '../../services/html-celement.service';
import { saveCodeAction } from '../actions/code-editor.actions';
import {
  RitCommandType,
  RitPathType,
  RitReadWriteCommand,
} from '../../services/models/rittry-ide-command';
import { AppState } from '../store/initial.state';
import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, withLatestFrom } from 'rxjs';
import { CodeEditorService } from 'src/app/services/code-editor.service';
import { VsCodeService } from 'src/app/services/vscode.service';
import { currentRootElSelector } from '../selectors/space.selectors';

@Injectable()
export class CodeEditorEffects {
  saveCode$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(saveCodeAction),
        withLatestFrom(this.store$.select(currentMediaSelector)),
        switchMap(([_, __]) => {

          this.writeCodeToIde();

          return [];
        })
      ),
    { dispatch: false }
  );

  private writeCodeToIde() {
    for (const mediaKey in MediaType) {
      const media = Number(mediaKey as keyof typeof MediaType) as MediaType;

      this._codeEditorService.syncEditorStyles(media);

      this.writeCodeToIdeForMedia(RitCommandType.writeHtml, media);
      this.writeCodeToIdeForMedia(RitCommandType.writeCss, media);
    }
  }

  private writeCodeToIdeForMedia(cmdType: RitCommandType, media: MediaType) {
    if (cmdType === RitCommandType.writeHtml) {
      const code = this._codeEditorService.getHtml();

      this._vsCodeService.writeToFile(
        new RitReadWriteCommand(
          RitCommandType.writeHtml,
          MediaHelper.convertToIdeMedia(media),
          RitPathType.root,
          code
        )
      );
    }

    if (cmdType === RitCommandType.writeCss) {
      const code = this._codeEditorService.getCss(media);

      this._vsCodeService.writeToFile(
        new RitReadWriteCommand(
          RitCommandType.writeCss,
          MediaHelper.convertToIdeMedia(media),
          RitPathType.root,
          code
        )
      );
    }
  }

  constructor(
    private readonly actions$: Actions,
    private readonly _codeEditorService: CodeEditorService,
    private readonly _vsCodeService: VsCodeService,
    private readonly _htmlCElementService: HtmlCElementService,
    private readonly store$: Store<AppState>
  ) {}
}
