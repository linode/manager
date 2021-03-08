import * as React from 'react';
import Typography from 'src/components/core/Typography';

export const TransferHeader: React.FC<{}> = (_) => {
  return (
    <Typography variant="body1">
      To transfer ownership of one or more Linodes make your selections below
      then click Generate Token.
    </Typography>
  );
};

export default React.memo(TransferHeader);
