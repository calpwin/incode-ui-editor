import { createSelector } from "@ngrx/store";
import { AppState } from "../store/initial.state";
import { uiEditorSpaceFeatureSelector } from "./space.selectors";

export const celementsSelector = createSelector(
  uiEditorSpaceFeatureSelector,
  (state: AppState) => state.celements
);

export const lastCelementStyleChangedSelector = createSelector(
  uiEditorSpaceFeatureSelector,
  (state: AppState) => state.lastCelementStylesChanged
);
