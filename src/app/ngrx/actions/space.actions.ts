import { MediaType, CElementLayoutAlign } from './../store/space-media';
import { createAction, props } from '@ngrx/store';

export const changeRootElAction = createAction(
  'Change root element space',
  props<{ toRootElId: string }>()
);

export const changeMediaAction = createAction(
  'Change current media',
  props<{ fromMedia: MediaType, toMedia: MediaType }>()
);

export const changeRootCElLayoutAlignAction = createAction(
  'Change root element layout align',
  props<{ toLayoutAlign: CElementLayoutAlign }>()
);
