import { CElement } from './../ngrx/store/celement';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CElementSerive {
  private readonly _celements: CElement[] = [];

  addCElement(cel: CElement) {
    this._celements.push(cel);
  }

  getCElement(celId: string) {
    return this._celements.find(x => x.celId === celId);
  }
}
