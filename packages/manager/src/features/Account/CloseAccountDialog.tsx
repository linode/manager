import { cancelAccount } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import Notice from 'src/components/Notice';
import Typography from 'src/components/core/Typography';
import TypeToConfirm from 'src/components/TypeToConfirm';
import TextField from 'src/components/TextField';
import { useProfile } from 'src/queries/profile';

interface Props {
  open: boolean;
  closeDialog: () => void;
}

const useStyles = makeStyles()((theme: Theme) => ({
  dontgo: {
    marginTop: theme.spacing(2),
  },
}));

const CloseAccountDialog = ({ closeDialog, open }: Props) => {
  const [isClosingAccount, setIsClosingAccount] = React.useState<boolean>(
    false
  );
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [comments, setComments] = React.useState<string>('');
  const [inputtedUsername, setUsername] = React.useState<string>('');
  const [canSubmit, setCanSubmit] = React.useState<boolean>(false);

  const { classes } = useStyles();
  const history = useHistory();
  const { data: profile } = useProfile();

  React.useEffect(() => {
    if (open) {
      /**
       * reset error state, username, and disabled status when we open the modal
       * intentionally not resetting comments
       */
      setErrors(undefined);
      setUsername('');
      setCanSubmit(false);
    }
  }, [open]);

  /**
   * enable the submit button if the user entered their
   * username correctly
   */
  React.useEffect(() => {
    if (inputtedUsername === profile?.username) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [inputtedUsername, profile]);

  const inputRef = React.useCallback(
    (node) => {
      /**
       * focus on first textfield when modal is opened
       */
      if (node && node.focus && open === true) {
        node.focus();
      }
    },
    [open]
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

  if (!profile?.username) {
    return null;
  }

  return (
    <Dialog
      open={open}
      title="Are you sure you want to close your Linode account?"
      onClose={closeDialog}
      error={errors ? errors[0].reason : ''}
      actions={
        <Actions
          onClose={closeDialog}
          isCanceling={isClosingAccount}
          onSubmit={handleCancelAccount}
          disabled={!canSubmit}
        />
      }
    >
      <Notice warning>
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong> Please note this is an extremely destructive
          action. Closing your account means that all services including
          Linodes, Volumes, DNS Records, etc will be lost and may not be able to
          be restored.
        </Typography>
      </Notice>
      <TypeToConfirm
        label={`Please enter your username (${profile.username}) to confirm.`}
        onChange={(input) => setUsername(input)}
        inputRef={inputRef}
        aria-label="username field"
        value={inputtedUsername}
        visible
        hideInstructions
        placeholder="Username"
      />
      <Typography className={classes.dontgo}>
        We&rsquo;d hate to see you go. Please let us know what we could be doing
        better in the comments section below. After your account is closed,
        you&rsquo;ll be directed to a quick survey so we can better gauge your
        feedback.
      </Typography>
      <TextField
        label="Comments"
        multiline
        onChange={(e) => setComments(e.target.value)}
        optional
        placeholder="Provide Feedback"
        rows={1}
        value={comments}
        aria-label="Optional comments field"
      />
    </Dialog>
  );
};

interface ActionsProps {
  onClose: () => void;
  onSubmit: () => void;
  isCanceling: boolean;
  disabled: boolean;
}

const Actions = ({
  disabled,
  isCanceling,
  onClose,
  onSubmit,
}: ActionsProps) => {
  return (
    <ActionsPanel>
      <Button buttonType="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={onSubmit}
        disabled={disabled}
        loading={isCanceling}
      >
        Close Account
      </Button>
    </ActionsPanel>
  );
};

export default React.memo(CloseAccountDialog);
