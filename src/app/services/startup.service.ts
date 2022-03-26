import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { AppConstants } from './app.constant';
import { HtmlMovableElementService } from './html-movable-celement.service';
import { VsCodeService } from './vscode.service';

@Injectable({
  providedIn: 'root',
})
export class StartupService {
  private _appInit = false;

  constructor(private readonly _vsCodeService: VsCodeService) {}

  appInit() {
    if (this._appInit) {
      throw Error('App already inite');
    }

    this._vsCodeService.connect();

    this._appInit = true;
  }

  bindApplicationEvents() {}
}
