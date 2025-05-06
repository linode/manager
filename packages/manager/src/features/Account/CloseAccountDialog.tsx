import { cancelAccount } from '@linode/api-v4/lib/account';
import { useProfile } from '@linode/queries';
import { Notice, TextField, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import {
  CANCELLATION_DATA_LOSS_WARNING,
  CANCELLATION_DIALOG_TITLE,
} from 'src/features/Account/constants';

import type { APIError } from '@linode/api-v4/lib/types';

interface Props {
  closeDialog: () => void;
  open: boolean;
}

const CloseAccountDialog = ({ closeDialog, open }: Props) => {
  const [isClosingAccount, setIsClosingAccount] =
    React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [comments, setComments] = React.useState<string>('');
  const history = useHistory();
  const { data: profile } = useProfile();

  React.useEffect(() => {
    if (open) {
      /**
       * reset error state, username, and disabled status when we open the modal
       * intentionally not resetting comments
       */
      setErrors(undefined);
    }
  }, [open]);

  const inputRef = React.useCallback(
    (node: any) => {
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

  if (!profile?.email) {
    return null;
  }

  return (
    <TypeToConfirmDialog
      entity={{
        name: profile.email,
        primaryBtnText: 'Close Account',
        subType: 'CloseAccount',
        type: 'AccountSetting',
      }}
      expand
      inputRef={inputRef}
      label={`Enter your email address (${profile.email})`}
      loading={isClosingAccount}
      onClick={handleCancelAccount}
      onClose={closeDialog}
      open={open}
      reversePrimaryButtonPosition
      title={CANCELLATION_DIALOG_TITLE}
      typographyStyleSx={(theme) => ({
        borderTop: `1px solid ${theme.tokens.alias.Border.Normal}`,
        marginBottom: theme.tokens.spacing.S8,
        marginTop: theme.tokens.spacing.S16,
        paddingTop: theme.tokens.spacing.S16,
        width: '100%',
      })}
    >
      {errors ? (
        <Notice text={errors ? errors[0].reason : ''} variant="error" />
      ) : null}
      <StyledNoticeWrapper>
        <Notice
          spacingBottom={12}
          sx={(theme) => ({
            border: `1px solid ${theme.tokens.alias.Action.Negative.Default}`,
          })}
          variant="error"
        >
          <Typography sx={{ fontSize: '0.875rem' }}>
            <strong>Warning:</strong> {CANCELLATION_DATA_LOSS_WARNING}
          </Typography>
        </Notice>
      </StyledNoticeWrapper>
      <Typography
        sx={(theme) => ({
          marginTop: theme.tokens.spacing.S16,
          order: 1,
        })}
      >
        Please let us know what we could be doing better in the comments section
        below. After your account is closed, you&rsquo;ll be directed to a quick
        survey that will help us understand your experience.
      </Typography>
      <StyledCommentSectionWrapper>
        <TextField
          aria-label="Optional comments field"
          expand
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
