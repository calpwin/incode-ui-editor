import { ElementStyle } from './../store/element-style';
import { createAction, props } from '@ngrx/store';
import { NewCustomElement } from '../store/custom-element.state';
import { CelementPositionType } from '../store/celement-position';
import { ElementStyles, FlexboxCelPosition, KeyValuePairModel } from '../store/element-style';

export const selectCElAction = createAction(
  'Select custom element on dom',
  props<{
    celId: string;
    parentCelId: string;
    celTag: string;
    celStyles: ElementStyles;
    children: { celId: string; tagName: string }[];
  }>()
);

export const addCElementAction = createAction(
  'Add custom element',
  props<{ cel: NewCustomElement }>()
);

export const removeCElementAction = createAction(
  'Remove custom element',
  props<{ celId: string }>()
);

export const changeCElementStyleAction = createAction(
  'Change custom element styles',
  props<{ celId: string; styles: ElementStyles }>()
);

export const removeCElementStylesAction = createAction(
  'Remove custom element styles',
  props<{ celId: string; styles: ElementStyle[] }>()
);

export const changeCElementPositionAction = createAction(
  'Change custom element position',
  props<{ celId: string; position: CelementPositionType }>()
);

export const changeCElementFlexboxColAction = createAction(
  'Change custom element flexbox position in cols',
  props<{ celId: string; position?: FlexboxCelPosition }>()
);
