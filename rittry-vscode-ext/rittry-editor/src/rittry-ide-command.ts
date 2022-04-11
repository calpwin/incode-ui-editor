export enum RitCommandType {
  readHtml = 1,
  readCss = 2,

  writeHtml = 3,
  writeCss = 4,
}

export enum RitPathType {
  root = 1,
}

export enum IdeMediaType {
  none = 0,
  desktop = 1,
  laptop = 2,
  tablet = 3,
  phone = 4,
}

export class RitMessage {
  constructor(public cmds: RitCommand[]) {}
}

export class RitCommand {
  public readonly uid;

  constructor(
      public code: RitCommandType,
      public media: IdeMediaType) {
        this.uid = Date.now().toString();
      }

  static commandCode = 'rit-command';
}

export class RitReadWriteCommand extends RitCommand {
  constructor(
    code: RitCommandType,
    media: IdeMediaType,
    public path: RitPathType | string,
    public content?: string
  ) {
    super(code, media);
  }
}
