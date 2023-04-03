import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';

const UserDataExplanatory = () => (
  <Typography>
    <Link to="https://cloudinit.readthedocs.io/en/latest/reference/examples.html">
      User Data
    </Link>{' '}
    is part of a virtual machine&rsquo;s cloud-init metadata that contains
    anything related to a user&rsquo;s local account, including username and
    user group(s).
  </Typography>
);

export default UserDataExplanatory;
