import * as React from 'react';
/**
 * @param [ref] {React.RefObject<any>} - If provided with a React Ref Object we will scroll to the
 * top of it.
 */
export const scrollTo = (ref?: React.RefObject<any>) => {
  window.scroll({
    behavior: 'smooth',
    left: 0,
    top: ref ? ref.current.offsetTop : 0,
  });
};
