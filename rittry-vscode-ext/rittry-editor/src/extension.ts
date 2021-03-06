import { IdeMediaType, RitMessage } from "./rittry-ide-command";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import * as express from "express";
import * as cors from "cors";
import * as http from "http";
import { Server, Socket } from "socket.io";
import { TextEncoder } from "util";
import {
  RitReadWriteCommand,
  RitPathType,
  RitCommand,
  RitCommandType,
} from "./rittry-ide-command";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { RitConstants } from "./rit.constants";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
  },
});

io.on("connection", async (socket) => {
  socket.on(RitCommand.commandCode, async (msg: string) => {
    const message = <RitMessage>JSON.parse(msg);
  
    message.cmds.forEach(async (cmd) => {
      switch (cmd.code) {
        case RitCommandType.writeHtml:
        case RitCommandType.writeCss:
          writeToFile(cmd as RitReadWriteCommand);
          break;
        case RitCommandType.readHtml:
          await sendToClientAsync(socket, RitCommandType.readHtml, cmd.media);
        case RitCommandType.readCss:
          await sendToClientAsync(socket, RitCommandType.readCss, cmd.media);
          break;
        default:
          vscode.window.showWarningMessage(
            `Get rit ide command with unsuppported code: ${cmd.code}`
          );
          break;
      }
    });
  });

  await ensureProjectStructureAsync(IdeMediaType.desktop);
  await ensureProjectStructureAsync(IdeMediaType.laptop);
  await ensureProjectStructureAsync(IdeMediaType.phone);
  await ensureProjectStructureAsync(IdeMediaType.tablet);
  await ensureProjectStructureAsync(IdeMediaType.none);

  await sendToClientAsync(socket, RitCommandType.readHtml, IdeMediaType.none);
  await sendToClientAsync(socket, RitCommandType.readCss, IdeMediaType.none);  
  await sendToClientAsync(socket, RitCommandType.readCss, IdeMediaType.desktop);  
  await sendToClientAsync(socket, RitCommandType.readCss, IdeMediaType.laptop);  
  await sendToClientAsync(socket, RitCommandType.readCss, IdeMediaType.tablet);  
  await sendToClientAsync(socket, RitCommandType.readCss, IdeMediaType.phone);    
});

async function writeToFile(cmd: RitReadWriteCommand) {
  const { uri } = generateFileUri(cmd.code, RitPathType.root, cmd.media);

  await vscode.workspace.fs.writeFile(
    uri,
    new TextEncoder().encode(cmd.content)
  );
}

function generateFileUri(
  cmdCode: RitCommandType,
  pathType: RitPathType,
  media: IdeMediaType
) {
  let path = vscode.workspace.workspaceFolders![0].uri.toString();
  let fileName;

  if (
    cmdCode === RitCommandType.writeHtml ||
    cmdCode === RitCommandType.readHtml
  ) {
    fileName = "layout.component.html";
  } else if (
    cmdCode === RitCommandType.writeCss ||
    cmdCode === RitCommandType.readCss
  ) {
    fileName = `layout.component.${IdeMediaType[media]}.autogenerated.css`;
  } else {
    throw Error(`Not supported write coe ${cmdCode}`);
  }

  const fileFolder =
    cmdCode === RitCommandType.writeCss || cmdCode === RitCommandType.readCss
      ? `${RitConstants.cssFolder}/`
      : "";

  path +=
    pathType === RitPathType.root
      ? `/src/app/components/rittry-layout/${fileFolder}${fileName}`
      : <string>"";

  const uri = vscode.Uri.parse(path);

  return { uri, fileName: fileName };
}

async function ensureProjectStructureAsync(media: IdeMediaType) {
  const { uri } = generateFileUri(
    RitCommandType.writeCss,
    RitPathType.root,
    media
  );

  try {
    await vscode.workspace.fs.stat(uri);
  } catch (err) {
    vscode.workspace.fs.writeFile(uri, new TextEncoder().encode(""));
  }
}

async function sendToClientAsync(
  socket: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> | Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  cmdType: RitCommandType,
  media: IdeMediaType
) {
  const { uri } = generateFileUri(cmdType, RitPathType.root, media);

  const content = await vscode.workspace.fs.readFile(uri);

  socket.emit(
    RitCommand.commandCode,
    new RitMessage([
      new RitReadWriteCommand(
        cmdType,
        media,
        RitPathType.root,
        content.toString()
      ),
    ])
  );
}

server.listen(3653, () => {
  console.log("listening on *:3653");
});

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "rittry-editor" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "rittry-editor.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from rittry-editor!");
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
