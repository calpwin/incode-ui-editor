import { MediaElementStyles } from './element-style';
import { MediaType } from './space-media';

export class CustomElement {
  public readonly mediaStyles!: MediaElementStyles;
  public parentCelId!: string;

  constructor(public id: string, public tagName: string) {
    this.mediaStyles = new MediaElementStyles();

    this.mediaStyles.set(MediaType.None, []);
    this.mediaStyles.set(MediaType.Desktop, []);
    this.mediaStyles.set(MediaType.Laptop, []);
    this.mediaStyles.set(MediaType.Phone, []);
    this.mediaStyles.set(MediaType.Tablet, []);
  }
}

export class NewCustomElement extends CustomElement {
  constructor(tagName: string) {
    super(`rit${Date.now().toString()}`, tagName);
  }
}
