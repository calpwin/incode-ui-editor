import { ElementStyle } from "./element-style";

export enum CelementPositionType {
  Absolute = 0,
  Relative = 1,
}

export class CelementPosition {
  static stylesFromPositionType(type: CelementPositionType) {
    switch (type) {
      case CelementPositionType.Absolute:
        return [
          new ElementStyle('position', 'absolute'),
          new ElementStyle('left', '40%'),
          new ElementStyle('top', '30%'),];
      case CelementPositionType.Relative:
        return [
          new ElementStyle('position', 'relative'),
          new ElementStyle('left', '0'),
          new ElementStyle('top', '0'),
        ];
      default:
        throw Error(
          `Noy supported position with type: ${CelementPositionType[type]}`
        );
    }
  }
}
