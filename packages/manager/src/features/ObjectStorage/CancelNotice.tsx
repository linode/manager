import * as React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

interface Props {
  className?: string;
}

export const CancelNotice = React.memo(({ className }: Props) => {
  return (
    <Typography className={className}>
      <strong>Please note:</strong> you will still be billed for Object Storage
      unless you cancel it in your{' '}
      <Link to="/account/settings">Account Settings.</Link>
    </Typography>
  );
});
