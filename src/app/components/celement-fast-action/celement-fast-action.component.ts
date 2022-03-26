import { removeCElementAction } from '../../ngrx/actions/celement.actions';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

@Component({
  selector: 'rittry-element-fast-action',
  templateUrl: './celement-fast-action.component.html',
  styleUrls: ['./celement-fast-action.component.scss'],
})
export class CElementFastActionComponent implements OnInit {
  // public currentSpaceEl: CustomElement | undefined;

  public celId!: string;

  constructor(private readonly _store: Store<any>) {}

  ngOnInit(): void {}

  closeClick(e: MouseEvent) {
    e.stopImmediatePropagation();

    this._store.dispatch(
      removeCElementAction({
        celId: this.celId,
      })
    );
  }

  ungroupClick() {
    // this._store.dispatch(
    //   unGroupElementsAction({
    //     groupElId: this.groupRootEl.id
    //   })
    // );
  }

  outFromGroupClick() {
    // this._store.dispatch(
    //   getOutFromGroupAction({
    //     groupElId: this.groupRootEl.id
    //   })
    // );
  }

  intoGroupClick() {
    // this._store.dispatch(
    //   getIntoGroupAction({
    //     groupElId: this.groupRootEl.id
    //   })
    // );
  }
}
