import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

const useStyles = makeStyles((theme: Theme) => ({
  dialog: {
    '& .dialog-title': {
      paddingTop: theme.spacing(3) - 4,
      paddingBottom: theme.spacing(3) - 4
    },
    '& .MuiTypography-h6': {
      color: '#6b7380',
      fontSize: '1.125rem'
    },
    '& .dialog-content': {
      paddingTop: 0,
      paddingBottom: 0
    },
    '& p': {
      lineHeight: '1.25rem'
    },
    '& p:first-child': {
      marginBottom: theme.spacing(2)
    }
  }
}));

interface Props {
  open: boolean;
  error?: string;
  loading: boolean;
  onClose: () => void;
}

type CombinedProps = Props;

const ThirdPartyAuthenticationDialog: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { error, loading, open, onClose } = props;

  return (
    // TODO: missing 'X' button in the upper right
    <ConfirmationDialog
      className={classes.dialog}
      open={open}
      title={'Enable GitHub Authentication'}
      onClose={onClose}
      actions={() => renderActions(loading, onClose)}
    >
      {error && <Notice error text={error} />}
      <Typography>
        After you enable GitHub authentication, your Linode account password
        will be disabled and any trusted devices will be removed from your
        account. If you’ve enabled Two-Factor Authentication (TFA) with your
        Linode account, that will also be disabled. You should enable TFA via
        GitHub for extra security.
      </Typography>
      <Typography>
        Do you want to go to GitHub and enable Third-Party Authentication?
      </Typography>
    </ConfirmationDialog>
  );
};

const renderActions = (loading: boolean, onClose: () => void) => {
  return (
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        buttonType="cancel"
        onClick={onClose}
        data-qa-cancel
        data-testid={'dialog-cancel'}
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        loading={loading}
        onClick={}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Go to GitHub
      </Button>
    </ActionsPanel>
  );
};

export default React.memo(ThirdPartyAuthenticationDialog);
