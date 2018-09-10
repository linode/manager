import { Props } from 'react-select/lib/Select';

declare module 'react-select' {
  export interface Props {
    classes: any;
    textFieldProps: any;
  }
  export interface Creatable {
    classes: any;
    textFieldProps: any;
  }
}
