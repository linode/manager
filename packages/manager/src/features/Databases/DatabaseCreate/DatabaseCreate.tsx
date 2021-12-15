import * as React from 'react';
import useFlags from 'src/hooks/useFlags';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

type CombinedProps = Props;

const DatabaseCreate: React.FC<CombinedProps> = () => {
  // @TODO: Remove when Database goes to GA
  const flags = useFlags();
  if (!flags.databases) {
    return null;
  }

  return <>Database Create</>;
};

export default DatabaseCreate;
