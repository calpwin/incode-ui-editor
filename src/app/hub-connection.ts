import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr'; // or from "@microsoft/signalr" if you are using a new library
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection: signalR.HubConnection = null!;

  constructor(
    private readonly _store: Store<any>,
  ) {}

  public startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:5001/ws')
      .build();
    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.log('Error while starting connection: ' + err));
  };

  public addTransferChartDataListener = () => {
    this.hubConnection.on('Send', (data) => {
      // const customElement = JSON.parse(data) as CustomElement;

      // console.log('Ws get json: ', customElement);

      // this._store.dispatch(addCustomElementAction(customElement));
    });
  };
}
