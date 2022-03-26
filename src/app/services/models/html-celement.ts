import { CustomElement } from './../../ngrx/store/custom-element.state';
import { CElementFastActionComponent } from './../../components/celement-fast-action/celement-fast-action.component';
import { ComponentRef } from '@angular/core';
import Moveable from 'moveable/declaration/Moveable';

export class HtmlCElement {
  constructor(
    public cel: CustomElement,
    public htmlEl: HTMLElement,
    public moveable?: Moveable,
    public fastAtionCompRef?: ComponentRef<CElementFastActionComponent>) {}
}
