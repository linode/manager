import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import UpdateContactInformationForm from 'src/features/Billing/BillingPanels/UpdateContactInformationPanel';

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    '& .MuiDrawer-paper': {
      [theme.breakpoints.up('md')]: {
        width: 480
      },
      overflowX: 'hidden'
    },
    '& .MuiGrid-root': {
      marginBottom: 0
    }
  }
}));

export interface Props {
  open: boolean;
  onClose: () => void;
}

type CombinedProps = Props;

export const BillingContactDrawer: React.FC<CombinedProps> = props => {
  const { open, onClose } = props;

  const classes = useStyles();

  return (
    <Drawer
      title="Edit Billing Contact Info"
      className={classes.drawer}
      open={open}
      onClose={onClose}
    >
      <UpdateContactInformationForm 
        onClose={onClose}
      />
    </Drawer>
  );
};

export default BillingContactDrawer;
