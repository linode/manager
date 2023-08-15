import { cancelAccount } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { Theme, styled } from '@mui/material/styles';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Typography } from 'src/components/Typography';
import { useProfile } from 'src/queries/profile';

interface Props {
  closeDialog: () => void;
  open: boolean;
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
      entity={{
        name: profile.username,
        primaryBtnText: 'Close Account',
        subType: 'CloseAccount',
        type: 'AccountSetting',
      }}
      disabled={!canSubmit}
      inputRef={inputRef}
      label={`Please enter your Username (${profile.username}) to confirm.`}
      loading={isClosingAccount}
      onClick={handleCancelAccount}
      onClose={closeDialog}
      open={open}
      textFieldStyle={{ maxWidth: '415px' }}
      title="Are you sure you want to close your Linode account?"
    >
      {errors ? (
        <Notice variant="error" text={errors ? errors[0].reason : ''} />
      ) : null}
      <StyledNoticeWrapper>
        <Notice spacingBottom={12} variant="warning">
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
          aria-label="Optional comments field"
          label="Comments"
          multiline
          onChange={(e) => setComments(e.target.value)}
          optional
          placeholder="Provide Feedback"
          rows={1}
          value={comments}
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
