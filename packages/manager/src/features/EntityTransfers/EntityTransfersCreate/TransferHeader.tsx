import * as React from 'react';
import Typography from 'src/components/core/Typography';

export const TransferHeader: React.FC<{}> = (_) => {
  return (
    <Typography variant="body1">
      To transfer ownership of an entity make your selections below then click
      Generate Transfer Token.
    </Typography>
  );
};

export default React.memo(TransferHeader);
