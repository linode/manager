import { cancelAccount } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import TextField from 'src/components/TextField';
import useProfile from 'src/hooks/useProfile';
import useReduxLoad from 'src/hooks/useReduxLoad';

interface Props {
  open: boolean;
  closeDialog: () => void;
}

type CombinedProps = Props;

const useStyles = makeStyles((theme: Theme) => ({
  dontgo: {
    marginTop: theme.spacing(2),
  },
}));

const CloseAccountDialog: React.FC<CombinedProps> = (props) => {
  const [isClosingAccount, setIsClosingAccount] = React.useState<boolean>(
    false
  );
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [comments, setComments] = React.useState<string>('');
  const [inputtedUsername, setUsername] = React.useState<string>('');
  const [canSubmit, setCanSubmit] = React.useState<boolean>(false);

  const classes = useStyles();
  const history = useHistory();
  const { profile } = useProfile();
  useReduxLoad(['profile']);

  React.useEffect(() => {
    if (props.open) {
      /**
       * reset error state, username, and disabled status when we open the modal
       * intentionally not resetting comments
       */
      setErrors(undefined);
      setUsername('');
      setCanSubmit(false);
    }
  }, [props.open]);

  /**
   * enable the submit button if the user entered their
   * username correctly
   */
  React.useEffect(() => {
    if (inputtedUsername === profile.data?.username) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [inputtedUsername]);

  const inputRef = React.useCallback(
    (node) => {
      /**
       * focus on first textfield when modal is opened
       */
      if (node && node.focus && props.open === true) {
        node.focus();
      }
    },
    [props.open]
  );

  const handleCancelAccount = () => {
    setIsClosingAccount(true);
    return cancelAccount({
      /**
       * we don't care about soliciting comments from the user
       * since they're about to get redirected to a survey.
       */
      comments,
    })
      .then((response) => {
        setIsClosingAccount(false);
        /** shoot the user off to survey monkey to answer some questions */
        history.push('/cancel', { survey_link: response.survey_link });
      })
      .catch((e: APIError[]) => {
        setIsClosingAccount(false);
        setErrors(e);
      });
  };

  if (!profile.data?.username) {
    return null;
  }

  return (
    <Dialog
      open={props.open}
      title="Are you sure you want to close your Linode account?"
      onClose={props.closeDialog}
      error={errors ? errors[0].reason : ''}
      actions={
        <Actions
          onClose={props.closeDialog}
          isCancelling={isClosingAccount}
          onSubmit={handleCancelAccount}
          disabled={!canSubmit}
        />
      }
    >
      <Typography>
        Please note this is an extremely destructive action. Closing your
        account means that all services including Linodes, Volumes, DNS Records,
        etc will be lost and may not be able to be restored.
      </Typography>
      <TextField
        label={`Please enter your username (${profile.data?.username}) to confirm.`}
        placeholder="Username"
        aria-label="username field"
        value={inputtedUsername}
        onChange={(e) => setUsername(e.target.value)}
        inputRef={inputRef}
      />
      <Typography className={classes.dontgo}>
        We'd hate to see you go. Please let us know what we could be doing
        better in the comments section below. After your account is closed,
        you'll be directed to a quick survey so we can better gauge your
        feedback.
      </Typography>
      <TextField
        multiline
        value={comments}
        aria-label="Optional comments field"
        rows={2}
        label="Comments (optional)"
        placeholder="Provide Feedback"
        onChange={(e) => setComments(e.target.value)}
      />
    </Dialog>
  );
};

interface ActionsProps {
  onClose: () => void;
  onSubmit: () => void;
  isCancelling: boolean;
  disabled: boolean;
}

const Actions: React.FC<ActionsProps> = (props) => {
  return (
    <ActionsPanel>
      <Button onClick={props.onClose} buttonType="cancel">
        Cancel
      </Button>
      <Button
        disabled={props.disabled}
        onClick={props.onSubmit}
        loading={props.isCancelling}
        destructive
        buttonType="primary"
      >
        Close Account
      </Button>
    </ActionsPanel>
  );
};

export default compose<CombinedProps, Props>(React.memo)(CloseAccountDialog);
