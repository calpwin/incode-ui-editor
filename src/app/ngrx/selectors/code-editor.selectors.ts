import { createSelector } from "@ngrx/store";
import { AppState } from "../store/initial.state";
import { uiEditorSpaceFeatureSelector } from "./space.selectors";

export const existNotSavedCodeChangesSelector = createSelector(
  uiEditorSpaceFeatureSelector,
  (state: AppState) => state.existNotSavedCodeChanges
);
