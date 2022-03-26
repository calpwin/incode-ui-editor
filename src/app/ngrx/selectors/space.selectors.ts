import { AppState } from './../store/initial.state';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppConstants } from 'src/app/services/app.constant';

export const uiEditorSpaceFeatureSelector = createFeatureSelector<AppState>(
  AppConstants.uiEditorFeatureName
);

export const currentRootElSelector = createSelector(
  uiEditorSpaceFeatureSelector,
  (state: AppState) => state.currentRootCElementId
);

export const currentMediaSelector = createSelector(
  uiEditorSpaceFeatureSelector,
  (state: AppState) => state.currentMedia
);

export const currentSelectedCELSelector = createSelector(
  uiEditorSpaceFeatureSelector,
  (state: AppState) => state.currentSelectedCelId
);
