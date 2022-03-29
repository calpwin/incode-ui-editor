import { CustomElement } from './custom-element.state';
import {  MediaType } from './space-media';
import { AppConstants } from 'src/app/services/app.constant';
import { KeyValuePairModel } from './element-style';

export class AppState {
  constructor(
    public currentRootCElementId: string,
    public lastCelementStylesChanged?: {
      celId: string;
      styles: KeyValuePairModel[];
    },
    // Any html or css changed and not saved
    public existNotSavedCodeChanges = false,
    public currentMedia = MediaType.None,
    public currentSelectedCelId?: string,
    public celements: CustomElement[] = []
  ) {}
}

export const initialState: AppState = {
  currentRootCElementId: AppConstants.HtmlRootSpaceElementId,
  lastCelementStylesChanged: undefined,
  existNotSavedCodeChanges: false,
  currentMedia: MediaType.None,
  currentSelectedCelId: undefined,
  celements: [],
};
