import * as React from 'react';
import Typography from 'src/components/core/Typography';

export const TransferHistory: React.FC<{}> = _ => {
  return (
    <>
      <Typography style={{ marginBottom: '8px' }}>
        <strong>Network Transfer 30-Day History (Kb/s)</strong>
      </Typography>
      <div
        style={{
          padding: '3em',
          backgroundColor: 'pink',
          color: 'black',
          width: '544px'
        }}
      >
        THIS IS A STUB
      </div>
    </>
  );
};

export default React.memo(TransferHistory);
