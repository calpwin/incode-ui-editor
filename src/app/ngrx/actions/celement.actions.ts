import { KeyValuePairModel } from '../store/initial.state';
import { createAction, props } from '@ngrx/store';
import { NewCustomElement } from '../store/custom-element.state';
import { CelementPositionType } from '../store/celement-position';


export const selectCElAction = createAction(
  'Select custom element on dom',
  props<{ celId: string, celTag: string, celStyles: KeyValuePairModel[] }>()
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
  props<{ celId: string; styles: KeyValuePairModel[] }>()
);

export const changeCElementPositionAction = createAction(
  'Change custom element position',
  props<{ celId: string; position: CelementPositionType }>()
);
