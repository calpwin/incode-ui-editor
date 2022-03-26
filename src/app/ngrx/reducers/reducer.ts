import { CElement } from './../store/celement';
import { selectCElAction } from './../actions/celement.actions';
import { createReducer, on } from '@ngrx/store';
import { initialState } from '../store/initial.state';
import {
  changeMediaAction,
  changeRootElAction,
  changeRootCElLayoutAlignAction,
} from '../actions/space.actions';
import {
  changeCElementStyleAction,
  addCElementAction,
  removeCElementAction,
  changeCElementPositionAction,
} from '../actions/celement.actions';
import {
  changeCssAction,
  changeHtmlAction,
  saveCodeAction,
} from '../actions/code-editor.actions';

export const reducers = createReducer(
  initialState,

  //#region Space
  on(changeRootElAction, (state, prop) => {
    return { ...state, currentRootCElementId: prop.toRootElId };
  }),
  on(changeMediaAction, (state, prop) => {
    return { ...state, currentMedia: prop.toMedia };
  }),
  on(changeRootCElLayoutAlignAction, (state, prop) => {
    return { ...state };
  }),
  on(selectCElAction, (state, prop) => {
    const findCel = state.celements.find((x) => x.celId === prop.celId);
    const celements = [...state.celements];

    if (!findCel) {
      const cel = new CElement(prop.celId, prop.celTag, prop.celStyles);
      celements.push(cel);
    }

    return {
      ...state,
      currentSelectedCelId: prop.celId,
      celements,
    };
  }),
  //#endregion

  //#region Celement
  on(changeCElementStyleAction, (state, prop) => {
    return {
      ...state,
      lastCelementStylesChanged: { celId: prop.celId, styles: prop.styles },
    };
  }),
  on(changeCElementPositionAction, (state, prop) => {
    return { ...state };
  }),
  on(addCElementAction, (state, prop) => {
    return { ...state };
  }),
  on(removeCElementAction, (state, prop) => {
    return { ...state };
  }),
  //#endregion

  //#region Editor action
  on(changeHtmlAction, (state, prop) => {
    return { ...state, existNotSavedCodeChanges: true };
  }),
  on(changeCssAction, (state, prop) => {
    return { ...state, existNotSavedCodeChanges: true };
  }),
  on(saveCodeAction, (state, prop) => {
    return { ...state, existNotSavedCodeChanges: false };
  })
  //#endregion
);
