import { CElementLayoutAlign, MediaType } from './space-media';
import { AppConstants } from 'src/app/services/app.constant';
import { CElement } from './celement';

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
    public celements: CElement[] = []
  ) {}
}

export const initialState: AppState = {
  currentRootCElementId: AppConstants.HtmlRootSpaceElementId,
  lastCelementStylesChanged: undefined,
  existNotSavedCodeChanges: false,
  currentMedia: MediaType.None,
  currentSelectedCelId: undefined,
  celements: []
};

//#region Models

export class KeyValuePairModel {
  constructor(public name: string, public value: string) {}

  equals = (obj: KeyValuePairModel) => {
    return this.name === obj.name && this.value === obj.value;
  };

  static override(styles: KeyValuePairModel[], newStyles: KeyValuePairModel[]) {
    newStyles.forEach((newStyle) => {
      const style = styles.find((x) => x.name === newStyle.name);

      if (style) {
        styles.splice(styles.indexOf(style));
      }

      styles.push(newStyle);
    });
  }
}

export class ElementStyle extends KeyValuePairModel {
  static fromLayoutAlign(align: CElementLayoutAlign) {
    switch (align) {
      case CElementLayoutAlign.Left:
        return new KeyValuePairModel('justify-content', 'left');
      case CElementLayoutAlign.Right:
        return new KeyValuePairModel('justify-content', 'right');
      case CElementLayoutAlign.Horizontal:
        return new KeyValuePairModel('align-items', 'center');
      case CElementLayoutAlign.Vertical:
        return new KeyValuePairModel('justify-content', 'space-between');
      default:
        throw Error(`Layout ${CElementLayoutAlign[align]} not supported`);
    }
  }
}

//#endregion
