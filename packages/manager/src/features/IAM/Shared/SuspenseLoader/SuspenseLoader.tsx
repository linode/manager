import * as React from 'react';

import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';

interface Props {
  /**
   * Ammount of time before the LoadingSpinner shows
   * @default 300
   */
  delay?: number;
}

export const SuspenseLoader = (props: Props) => {
  const { delay } = props;
  const [show, setShow] = React.useState<boolean>(false);

  React.useEffect(() => {
    const timeout = setTimeout(() => setShow(true), delay ?? 300);
    return () => {
      clearTimeout(timeout);
    };
  }, [delay]);

  return <>{show && <LoadingSpinner size="extra-large" />}</>;
};
