import * as React from 'react';
import Notice from 'src/components/Notice';

const LinodePermissionsError = () => (
  <Notice
    error
    text="You don't have permissions to modify this Linode. Please, contact account administrator for details."
  />
);

export default LinodePermissionsError;
