import * as React from 'react';

export const SingleLinode: React.FC<{}> = props => {
  return <div>I have one Linode!</div>;
};

export default React.memo(SingleLinode);
