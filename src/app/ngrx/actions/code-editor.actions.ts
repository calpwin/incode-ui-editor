import { createAction } from "@ngrx/store";

export const changeHtmlAction = createAction(
  'Html was changed'
);

export const changeCssAction = createAction(
  'Css was changed'
);

export const saveCodeAction = createAction(
  'Save html and css'
);
