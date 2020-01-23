import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';

interface Props {
  className?: string;
}

const CancelNotice: React.FC<Props> = ({ className }) => {
  return (
    <Typography className={className}>
      <strong>Please note:</strong> you will still be billed for Object Storage
      unless you cancel it in your{' '}
      <Link to="/account/settings">Account Settings.</Link>
    </Typography>
  );
};

export default React.memo(CancelNotice);
