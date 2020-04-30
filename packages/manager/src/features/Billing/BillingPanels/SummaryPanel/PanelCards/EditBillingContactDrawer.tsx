import { IPAddress, updateIP } from 'linode-js-sdk/lib/networking';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormHelperText from 'src/components/core/FormHelperText';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import TextField from 'src/components/TextField';
import AccountContainer, {
  Props as AccountProps
} from 'src/containers/account.container';
import { arePropsEqual } from 'src/utilities/arePropsEqual';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import UpdateContactInformationPanel from 'src/features/Billing/BillingPanels/UpdateContactInformationPanel';

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

type CombinedProps = Props & AccountProps;

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
      <UpdateContactInformationPanel 
        onCancel={onClose}
      />
    </Drawer>
  );
};

export default BillingContactDrawer;
