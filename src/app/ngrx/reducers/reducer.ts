import { CustomElement } from './../store/custom-element.state';
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
import { KeyValuePairModel, MediaElementStyles } from '../store/element-style';

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
    const findCel = state.celements.find((x) => x.id === prop.celId);
    const celements = [...state.celements];

    if (!findCel) {
      const cel = new CustomElement(prop.celId, prop.celTag);
      cel.mediaStyles.set(state.currentMedia, prop.celStyles);
      cel.parentCelId = prop.parentCelId;
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
    let cel = state.celements.find((x) => x.id === prop.celId)!;
    const { styles, stylesChanged } = KeyValuePairModel.override(
      cel.mediaStyles.getStyles(state.currentMedia),
      prop.styles
    );

    let celements = state.celements;

    if (stylesChanged) {
      cel = { ...cel };
      cel.mediaStyles.set(state.currentMedia, styles);
      celements = [...celements.filter((x) => x.id !== cel.id), cel];
    }

    return {
      ...state,
      lastCelementStylesChanged: { celId: prop.celId, styles: prop.styles },
      celements,
    };
  }),
  on(changeCElementPositionAction, (state, prop) => {
    return { ...state };
  }),
  on(addCElementAction, (state, prop) => {
    const findCel = state.celements.find((x) => x.id === prop.cel.id);
    const celements = [...state.celements];

    if (!findCel) {
      const cel = new CustomElement(prop.cel.id, prop.cel.tagName);
      MediaElementStyles.override(prop.cel.mediaStyles, cel.mediaStyles);
      cel.parentCelId = state.currentRootCElementId;
      celements.push(cel);
    }

    return { ...state, celements };
  }),
  on(removeCElementAction, (state, prop) => {
    return {
      ...state,
      celements: state.celements.filter((x) => x.id !== prop.celId),
    };
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
