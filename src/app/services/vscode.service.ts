import { MediaType, MediaHelper } from './../ngrx/store/space-media';
import {
  RitCommand,
  RitCommandType,
  RitMessage,
  RitPathType,
  RitReadWriteCommand,
} from './models/rittry-ide-command';
import { CodeEditorService } from 'src/app/services/code-editor.service';
import { Injectable } from '@angular/core';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class VsCodeService {
  private _socket!: Socket<DefaultEventsMap, DefaultEventsMap>;

  constructor(private readonly _htmlEditorService: CodeEditorService) {}

  connect() {
    this._socket = io('ws://localhost:3653');

    this.bindEvents();
  }

  readAllFromVsCode() {
    console.log('connect');
    this.readHtmlFile(MediaType.None);
    this.readCssFile(MediaType.None);
    this.readCssFile(MediaType.Desktop);
    this.readCssFile(MediaType.Laptop);
    this.readCssFile(MediaType.Tablet);
    this.readCssFile(MediaType.Phone);
  }

  readCssFile(media: MediaType) {
    const cmd = new RitReadWriteCommand(
      RitCommandType.readCss,
      MediaHelper.convertToIdeMedia(media),
      RitPathType.root,
      undefined
    );

    this._socket.emit(
      RitCommand.commandCode,
      JSON.stringify(new RitMessage([cmd]))
    );
  }

  readHtmlFile(media: MediaType) {
    const cmd = new RitReadWriteCommand(
      RitCommandType.readHtml,
      MediaHelper.convertToIdeMedia(media),
      RitPathType.root,
      undefined
    );

    this._socket.emit(
      RitCommand.commandCode,
      JSON.stringify(new RitMessage([cmd]))
    );
  }

  writeToFile(cmd: RitReadWriteCommand) {
    this._socket.emit(
      RitCommand.commandCode,
      JSON.stringify(new RitMessage([cmd]))
    );
  }

  writeCssToFile(media: MediaType) {
    const css = this._htmlEditorService.getCss(media);

    const cmd = new RitReadWriteCommand(
      RitCommandType.writeCss,
      MediaHelper.convertToIdeMedia(media),
      RitPathType.root,
      css
    );

    this._socket.emit(
      RitCommand.commandCode,
      JSON.stringify(new RitMessage([cmd]))
    );
  }

  private bindEvents() {
    this._socket.on(RitCommand.commandCode, (message: RitMessage) => {
      message.cmds.forEach((cmd) => {
        this.readCmd(<RitReadWriteCommand>cmd);
      });
    });
  }

  private readCmd(cmd: RitReadWriteCommand) {
    if (cmd.code === RitCommandType.readHtml) {
      this._htmlEditorService.parseHtml(cmd.content ?? '');
    }

    if (cmd.code === RitCommandType.readCss) {
      this._htmlEditorService.parseCss(
        cmd.content ?? '',
        MediaHelper.convertFromIdeMedia(cmd.media)
      );
    }
  }
}
