import * as qrcode from 'qrcode.react'; 

declare module 'qrcode.react' {
  export interface QRCodeProps {
    className: any;
  }
}