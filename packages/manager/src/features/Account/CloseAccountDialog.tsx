import { cancelAccount } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { makeStyles } from 'tss-react/mui';
import { Theme, styled } from '@mui/material/styles';
import { Notice } from 'src/components/Notice/Notice';
import Typography from 'src/components/core/Typography';
import { TextField } from 'src/components/TextField';
import { useProfile } from 'src/queries/profile';

interface Props {
  open: boolean;
  closeDialog: () => void;
}

const useStyles = makeStyles()((theme: Theme) => ({
  dontgo: {
    marginTop: theme.spacing(2),
    order: 1,
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
    <TypeToConfirmDialog
      title="Are you sure you want to close your Linode account?"
      label={`Please enter your Username (${profile.username}) to confirm.`}
      entity={{
        type: 'AccountSetting',
        subType: 'CloseAccount',
        primaryBtnText: 'Close Account',
      }}
      open={open}
      onClose={closeDialog}
      onClick={handleCancelAccount}
      loading={isClosingAccount}
      inputRef={inputRef}
      disabled={!canSubmit}
      textFieldStyle={{ maxWidth: '415px' }}
    >
      {errors ? <Notice error text={errors ? errors[0].reason : ''} /> : null}
      <StyledNoticeWrapper>
        <Notice warning spacingBottom={12}>
          <Typography sx={{ fontSize: '0.875rem' }}>
            <strong>Warning:</strong> Please note this is an extremely
            destructive action. Closing your account means that all services
            Linodes, Volumes, DNS Records, etc will be lost and may not be able
            be restored.
          </Typography>
        </Notice>
      </StyledNoticeWrapper>
      <Typography className={classes.dontgo}>
        We&rsquo;d hate to see you go. Please let us know what we could be doing
        better in the comments section below. After your account is closed,
        you&rsquo;ll be directed to a quick survey so we can better gauge your
        feedback.
      </Typography>
      <StyledCommentSectionWrapper>
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
      </StyledCommentSectionWrapper>
    </TypeToConfirmDialog>
  );
};

// The order property helps inject the TypeToConfirm input field in the TypeToConfirmDialog when the components
// below are passed in as the children prop.
const StyledNoticeWrapper = styled('div')(() => ({
  order: 0,
}));

const StyledCommentSectionWrapper = styled('div')(() => ({
  order: 2,
}));

export default React.memo(CloseAccountDialog);
