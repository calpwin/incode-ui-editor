import { CElementLayoutAlign, MediaType } from "./space-media";

export class KeyValuePairModel {
  constructor(public name: string, public value: string) {}

  equals = (obj: KeyValuePairModel) => {
    return this.name === obj.name && this.value === obj.value;
  };

  static override(styles: KeyValuePairModel[], newStyles: KeyValuePairModel[]) {
    let stylesChanged = false;

    const overrideStyles = [...styles];

    newStyles.forEach((newStyle) => {
      const style = overrideStyles.find((x) => x.name === newStyle.name);

      if (style) {
        if (!style.equals(newStyle)) stylesChanged = true;

        overrideStyles.splice(overrideStyles.indexOf(style));
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

export class MediaElementStyles extends Map<MediaType, ElementStyle[]> {
  getStyles(media: MediaType) {
    return this.get(media)!;
  }

  static override(fromStyles: MediaElementStyles, toStyles: MediaElementStyles) {
    toStyles.set(MediaType.None, fromStyles.get(MediaType.None) ?? []);
    toStyles.set(MediaType.Desktop, fromStyles.get(MediaType.Desktop) ?? []);
    toStyles.set(MediaType.Laptop, fromStyles.get(MediaType.Laptop) ?? []);
    toStyles.set(MediaType.Tablet, fromStyles.get(MediaType.Tablet) ?? []);
    toStyles.set(MediaType.Phone, fromStyles.get(MediaType.Phone) ?? []);
  }
}
