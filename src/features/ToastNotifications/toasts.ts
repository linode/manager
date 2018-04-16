import { Subject } from 'rxjs/Rx';

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

// const toast$ = Observable.from([
//   createToast('something or other'),
//   createToast('who cares', 'warn'),
//   createToast('whatever', 'error'),
// ]);

export default toast$;
