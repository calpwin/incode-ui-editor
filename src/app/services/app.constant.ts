import { MediaType } from './../ngrx/store/space-media';
export class AppConstants {
  static readonly HtmlRootSpaceElementId = 'root-element';
  static readonly HtmlElementClassName = 'rittry-element';
  static readonly uiEditorFeatureName = 'ui-editor-feature';

  static readonly MediaCssClassPrefix = 'rit-media-';

  static getMediaCssClass(media: MediaType) {
    return this.MediaCssClassPrefix + MediaType[media].toLowerCase()
  }
}
