import * as React from 'react';
import TextField from 'src/components/TextField';

export const BucketSSL: React.FC<{}> = _ => {
  return (
    <div>
      <TextField value={0} label="SSL Cert" />
    </div>
  );
};

export default React.memo(BucketSSL);
