export interface IExchange{

    sendMessage(data: any): void;
 
    addReadEvent(callback: (sender: number, dataroom: string, msg: any) => void): void;

}