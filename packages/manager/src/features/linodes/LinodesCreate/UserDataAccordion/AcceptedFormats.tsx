import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';

const AcceptedFormats = () => (
  <Typography>
    <br /> Accepted formats are YAML and bash.{' '}
    <Link to="https://www.linode.com/docs">Learn more.</Link>
  </Typography>
);

export default AcceptedFormats;
