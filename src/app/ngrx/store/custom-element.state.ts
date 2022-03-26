import { KeyValuePairModel } from "./initial.state";

export class CustomElement {
  constructor(
    public id: string,
    public tagName: string,
    public styles: KeyValuePairModel[] = []) {}
}

export class NewCustomElement extends CustomElement {
  constructor(tagName: string) {
    super(`rit${Date.now().toString()}`, tagName);
  }
}
