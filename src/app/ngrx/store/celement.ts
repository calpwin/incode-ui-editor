import { KeyValuePairModel } from './initial.state';
export class CElement {
  constructor(
    public celId: string,
    public celTag: string,
    public styles: KeyValuePairModel[] = []) {

  }
}
