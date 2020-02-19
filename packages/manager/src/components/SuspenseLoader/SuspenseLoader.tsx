import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';

interface Props {
  delay?: number;
}

export type CombinedProps = Props;

export const SuspenseLoader: React.FC<Props> = props => {
  const { delay } = props;
  const [show, setShow] = React.useState<boolean>(false);

  React.useEffect(() => {
    const timeout = setTimeout(() => setShow(true), delay ?? 500);
    return () => {
      clearTimeout(timeout);
    };
  }, [delay]);

  return <>{show && <CircleProgress />}</>;
};

export default SuspenseLoader;
