import * as React from 'react';

export const TransferHistory: React.FC<{}> = _ => {
  return (
    <>
      <div style={{ marginBottom: '8px' }}>
        Network Transfer 30-Day History (Kb/s)
      </div>
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
