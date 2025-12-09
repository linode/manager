import { Drawer } from '@linode/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import UpdateContactInformationForm from './UpdateContactInformationForm';

const useStyles = makeStyles()(() => ({
  drawer: {
    '& .MuiDrawer-paper': {
      overflowX: 'hidden',
    },
    '& .MuiGrid-root': {
      marginBottom: 0,
    },
  },
}));

export interface Props {
  focusEmail: boolean;
  onClose: () => void;
  open: boolean;
}

export const BillingContactDrawer = (props: Props) => {
  const { focusEmail, onClose, open } = props;

  const { classes } = useStyles();

  return (
    <Drawer
      className={classes.drawer}
      onClose={onClose}
      open={open}
      title="Edit Billing Contact Info"
    >
      <UpdateContactInformationForm focusEmail={focusEmail} onClose={onClose} />
    </Drawer>
  );
};

export default BillingContactDrawer;
