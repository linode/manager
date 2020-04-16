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
  provider: string;
  onClose: () => void;
}

type CombinedProps = Props;

const ThirdPartyDialog: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { open, error, loading, provider, onClose } = props;

  const enableTPALink =
    `http://login.testing.linode.com/tpa/enable/` + `${provider}`.toLowerCase();

  return (
    // TODO: missing 'X' button in the upper right
    <ConfirmationDialog
      className={classes.dialog}
      open={open}
      title={`Enable ` + `${provider}` + ` Authentication`}
      onClose={onClose}
      actions={() => renderActions(enableTPALink, loading, provider, onClose)}
    >
      {error && <Notice error text={error} />}
      <Typography>
        After you enable {provider} authentication, your Linode account password
        will be disabled and any trusted devices will be removed from your
        account. If you’ve enabled Two-Factor Authentication (TFA) with your
        Linode account, that will also be disabled. You should enable TFA via
        {` `}
        {provider} for extra security.
      </Typography>
      <Typography>
        Do you want to go to {provider} and enable Third-Party Authentication?
      </Typography>
    </ConfirmationDialog>
  );
};

const renderActions = (
  enableTPALink: string,
  loading: boolean,
  provider: string,
  onClose: () => void
) => {
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
        aria-describedby="external-site"
        buttonType="primary"
        loading={loading}
        onClick={() => window.open(enableTPALink, '_blank', 'noopener')}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Go to {provider}
      </Button>
    </ActionsPanel>
  );
};

export default React.memo(ThirdPartyDialog);
