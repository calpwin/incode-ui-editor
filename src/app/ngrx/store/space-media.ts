import { IdeMediaType } from './../../services/models/rittry-ide-command';
export enum MediaType {
  None = 0,
  Desktop = 1,
  Laptop = 2,
  Tablet = 3,
  Phone = 4,
}

export enum CElementLayoutAlign {
  Left = 0,
  Right = 1,
  Horizontal = 2,
  Vertical = 3,
}

export class MediaHelper {
  static convertToIdeMedia(media: MediaType) {
    switch (media) {
      case MediaType.Desktop:
        return IdeMediaType.desktop;
      case MediaType.Laptop:
        return IdeMediaType.laptop;
      case MediaType.Phone:
        return IdeMediaType.phone;
      case MediaType.Tablet:
        return IdeMediaType.tablet;
      case MediaType.None:
        return IdeMediaType.none;
      default:
        throw Error(`Current media type: ${media} not supported`);
    }
  }

  static convertFromIdeMedia(media: IdeMediaType) {
    switch (media) {
      case IdeMediaType.desktop:
        return MediaType.Desktop;
      case IdeMediaType.laptop:
        return MediaType.Laptop;
      case IdeMediaType.phone:
        return MediaType.Phone;
      case IdeMediaType.tablet:
        return MediaType.Tablet;
      case IdeMediaType.none:
        return MediaType.None;
      default:
        throw Error(`Current media type: ${media} not supported`);
    }
  }
}
