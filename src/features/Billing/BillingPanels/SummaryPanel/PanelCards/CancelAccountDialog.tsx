import * as React from 'react';
import { compose } from 'recompose';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Dialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import TextField from 'src/components/TextField';

import { cancelAccount } from 'src/services/account';

interface Props {
  open: boolean;
  closeDialog: () => void;
}

type CombinedProps = Props;

const CancelAccountDialog: React.FC<CombinedProps> = props => {
  const [isCancelling, setCancelling] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<
    Linode.ApiFieldError[] | undefined
  >(undefined);
  const [comments, setComments] = React.useState<string>('');

  React.useEffect(() => {
    if (props.open) {
      /** reset error state when we open the modal */
      setErrors(undefined);
    }
  }, [props.open]);

  const handleCancelAccount = () => {
    setCancelling(true);
    return cancelAccount({
      /**
       * we don't care about soliciting comments from the user
       * since they're about to get redirected to a survey.
       */
      comments
    })
      .then(response => {
        setCancelling(false);
        /** shoot the user off to survey monkey to answer some questions */
        window.location.assign(response.survey_link);
      })
      .catch((e: Linode.ApiFieldError[]) => {
        setCancelling(false);
        setErrors(e);
      });
  };

  return (
    <Dialog
      open={props.open}
      title="Are you sure you want to close your Linode account?"
      onClose={props.closeDialog}
      error={errors ? errors[0].reason : ''}
      actions={
        <Actions
          onClose={props.closeDialog}
          isCancelling={isCancelling}
          onSubmit={handleCancelAccount}
        />
      }
    >
      <Typography>
        We'd hate to see you go. Please let us know what we could be doing
        better in the comments section below. After your account is cancelled,
        you'll be directed to a quick survey so we can better gauge your
        feedback.
      </Typography>
      <TextField
        multiline
        rows={2}
        label="Comments (optional)"
        placeholder="Provide Feedback"
        onChange={e => setComments(e.target.value)}
      />
    </Dialog>
  );
};

interface ActionsProps {
  onClose: () => void;
  onSubmit: () => void;
  isCancelling: boolean;
}

const Actions: React.FC<ActionsProps> = props => {
  return (
    <ActionsPanel>
      <Button onClick={props.onClose} buttonType="secondary">
        Cancel
      </Button>
      <Button
        onClick={props.onSubmit}
        loading={props.isCancelling}
        destructive
        buttonType="secondary"
      >
        Close Account
      </Button>
    </ActionsPanel>
  );
};

export default compose<CombinedProps, Props>(React.memo)(CancelAccountDialog);
