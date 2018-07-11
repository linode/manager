import { Subject } from 'rxjs/Subject';

export interface Toast {
  id: number;
  message: string;
  level?: string;
  open: boolean;
}

const toast$ = new Subject<Toast>();

let id = 0;
export const createToast = (message: string, level = 'notice'): Toast => {
  id += 1;

  return {
    id,
    message,
    level,
    open: false,
  };
};

export const sendToast = (message: string, level = 'notice'): void => {
  if (!message) { return; }
  toast$.next(createToast(message, level));
};

export default toast$;
