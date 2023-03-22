import * as React from 'react';
import { makeStyles } from 'tss-react/mui';
import Drawer from 'src/components/Drawer';
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
  open: boolean;
  onClose: () => void;
  focusEmail: boolean;
}

export const BillingContactDrawer = (props: Props) => {
  const { open, onClose, focusEmail } = props;

  const { classes } = useStyles();

  return (
    <Drawer
      title="Edit Billing Contact Info"
      className={classes.drawer}
      open={open}
      onClose={onClose}
    >
      <UpdateContactInformationForm
        open={open}
        onClose={onClose}
        focusEmail={focusEmail}
      />
    </Drawer>
  );
};

export default BillingContactDrawer;
