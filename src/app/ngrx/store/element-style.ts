import { CElementLayoutAlign, MediaType } from './space-media';

export class KeyValuePairModel {
  constructor(public name: string, public value: string) {}

  equals = (obj: KeyValuePairModel) => {
    return this.name === obj.name && this.value === obj.value;
  };

  static override(styles: ElementStyles, newStyles: ElementStyles) {
    let stylesChanged = false;

    const overrideStyles = new ElementStyles(...styles);

    newStyles.forEach((newStyle) => {
      const style = overrideStyles.find((x) => x.name === newStyle.name);

      if (style) {
        if (!style.equals(newStyle)) stylesChanged = true;

        overrideStyles.splice(overrideStyles.indexOf(style), 1);
      } else {
        stylesChanged = true;
      }

      overrideStyles.push(newStyle);
    });

    return { styles: overrideStyles, stylesChanged };
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

export class FlexboxCelPosition {
  constructor(
    // Margine left in css columns
    public marginLeftCols: number,
    // Width in css columns
    public widthCols: number
  ) {}

  get notValid() {
    return (
      this.marginLeftCols < 0 ||
      this.widthCols < 0 ||
      (this.marginLeftCols === 0 && this.widthCols === 0)
    );
  }
}


export class ElementStyles extends Array<ElementStyle> {
  constructor(...items: ElementStyle[]) {
    super(...items);
  }

  flexboxPosition?: FlexboxCelPosition;

  tryRemoveStyle(name: string) {
    const style = this.find(x => x.name === name);

    if (!style) return false;

    this.splice(this.indexOf(style), 1);

    return true;
  }
}

export class MediaElementStyles extends Map<MediaType, ElementStyles> {
  getStyles(media: MediaType) {
    return this.get(media)!;
  }

  static override(
    fromStyles: MediaElementStyles,
    toStyles: MediaElementStyles
  ) {
    toStyles.set(MediaType.None, fromStyles.get(MediaType.None) ?? new ElementStyles());
    toStyles.set(MediaType.Desktop, fromStyles.get(MediaType.Desktop) ?? new ElementStyles());
    toStyles.set(MediaType.Laptop, fromStyles.get(MediaType.Laptop) ?? new ElementStyles());
    toStyles.set(MediaType.Tablet, fromStyles.get(MediaType.Tablet) ?? new ElementStyles());
    toStyles.set(MediaType.Phone, fromStyles.get(MediaType.Phone) ?? new ElementStyles());
  }
}
