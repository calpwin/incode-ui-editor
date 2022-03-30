import { AppConstants } from './../../services/app.constant';
import { ElementStyles } from './../store/element-style';
import { CelementPosition } from './../store/celement-position';
import { CustomElement } from './../store/custom-element.state';
import {
  changeCElementFlexboxColAction,
  removeCElementStylesAction,
  selectCElAction,
} from './../actions/celement.actions';
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
import {
  FlexboxCelPosition,
  KeyValuePairModel,
  MediaElementStyles,
} from '../store/element-style';
import { MediaType } from '../store/space-media';

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
    let celements = [...state.celements];

    if (!findCel) {
      const cel = new CustomElement(prop.celId, prop.celTag);
      cel.mediaStyles.set(state.currentMedia, prop.celStyles);
      cel.parentCelId = prop.parentCelId;
      celements.push(cel);

      if (cel.id !== AppConstants.HtmlRootSpaceElementId) {
        let parentCel = state.celements.find((x) => x.id === prop.parentCelId)!;
        parentCel = { ...parentCel };
        parentCel.childrenIds = [...parentCel.childrenIds, cel.id];
        celements = setCel(celements, parentCel);
      }

      prop.children.forEach((x) => {
        const chCel = new CustomElement(x.celId, x.tagName);
        chCel.parentCelId = cel.id;
        celements.push(chCel);

        cel.childrenIds.push(chCel.id);
      });
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

    // console.log(`${cel.id} : ${styles?.map(x => `${x.name}:${x.value}`)}`);

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
  on(removeCElementStylesAction, (state, prop) => {
    let cel = state.celements.find((x) => x.id === prop.celId)!;
    let celements = state.celements;

    let celModified = false;
    prop.styles.forEach((remStyle) => {
      const styles = cel.mediaStyles.getStyles(state.currentMedia);

      if (styles.tryRemoveStyle(remStyle.name) && !celModified) {
        cel = { ...cel };
        celModified = true;
      }
    });

    if (celModified) {
      celements = setCel(celements, cel);
    }

    return { ...state, celements };
  }),
  on(changeCElementPositionAction, (state, prop) => {
    return { ...state };
  }),
  on(changeCElementFlexboxColAction, (state, prop) => {
    let cel = state.celements.find((x) => x.id === prop.celId)!;
    const styles = cel.mediaStyles.getStyles(state.currentMedia);
    let celements = state.celements;

    cel = { ...cel };
    const elStyles: ElementStyles = new ElementStyles(...styles);
    elStyles.flexboxPosition = prop.position
      ? new FlexboxCelPosition(
          prop.position.marginLeftCols,
          prop.position.widthCols
        )
      : undefined;
    cel.mediaStyles.set(state.currentMedia, elStyles);

    celements = [...celements.filter((x) => x.id !== cel.id), cel];

    return {
      ...state,
      celements,
    };
  }),
  on(addCElementAction, (state, prop) => {
    const findCel = state.celements.find((x) => x.id === prop.cel.id);
    let celements = [...state.celements];

    if (!findCel) {
      const cel = new CustomElement(prop.cel.id, prop.cel.tagName);
      MediaElementStyles.override(prop.cel.mediaStyles, cel.mediaStyles);
      cel.parentCelId = state.currentRootCElementId;
      celements.push(cel);

      let parentCel = state.celements.find(
        (x) => x.id === prop.cel.parentCelId
      )!;
      parentCel = { ...parentCel };
      parentCel.childrenIds.push(cel.id);
      celements = setCel(celements, parentCel);
    }

    return { ...state, celements };
  }),
  on(removeCElementAction, (state, prop) => {
    const cel = state.celements.find((x) => x.id === prop.celId);
    let celements = state.celements.filter((x) => x.id !== prop.celId);

    if (cel?.parentCelId) {
      const parentCel = state.celements.find((x) => x.id === cel.parentCelId)!;
      tryRemoveFromArray(parentCel.childrenIds, parentCel.id);
      celements = setCel(state.celements, parentCel);
    }

    return { ...state, celements };
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

function setCel(cels: CustomElement[], toUpdatECel: CustomElement) {
  let updatedCels = [...cels];
  updatedCels = updatedCels.filter((x) => x.id !== toUpdatECel.id);
  updatedCels.push(toUpdatECel);

  return updatedCels;
}

function tryRemoveFromArray<T>(array: T[], elKey: T) {
  let result = false;

  const el = array.find((x) => x === elKey);

  if (el) {
    array.splice(array.indexOf(el), 1);
    result = true;
  }

  return result;
}
