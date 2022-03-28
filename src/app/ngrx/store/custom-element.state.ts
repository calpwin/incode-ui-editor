import { ElementStyles, MediaElementStyles } from './element-style';
import { MediaType } from './space-media';

export class CustomElement {
  public readonly mediaStyles!: MediaElementStyles;
  public parentCelId!: string;

  constructor(public id: string, public tagName: string) {
    this.mediaStyles = new MediaElementStyles();

    this.mediaStyles.set(MediaType.None, new ElementStyles());
    this.mediaStyles.set(MediaType.Desktop, new ElementStyles());
    this.mediaStyles.set(MediaType.Laptop, new ElementStyles());
    this.mediaStyles.set(MediaType.Phone, new ElementStyles());
    this.mediaStyles.set(MediaType.Tablet, new ElementStyles());
  }
}

export class NewCustomElement extends CustomElement {
  constructor(tagName: string) {
    super(`rit${Date.now().toString()}`, tagName);
  }
}
