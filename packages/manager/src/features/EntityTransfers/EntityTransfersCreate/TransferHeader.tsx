import * as React from 'react';

import { Typography } from 'src/components/Typography';

export const TransferHeader = React.memo(() => {
  return (
    <Typography variant="body1">
      To transfer ownership of one or more Linodes make your selections below
      then click Generate Token.
    </Typography>
  );
});
