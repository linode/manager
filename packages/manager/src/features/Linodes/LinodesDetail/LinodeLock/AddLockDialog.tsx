import { useCreateLockMutation } from '@linode/queries';
import {
  ActionsPanel,
  FormControlLabel,
  Notice,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@linode/ui';
import { styled, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { LockType } from '@linode/api-v4';

interface Props {
  linodeId: number | undefined;
  linodeLabel: string | undefined;
  onClose: () => void;
  open: boolean;
}

export const AddLockDialog = (props: Props) => {
  const { linodeId, linodeLabel, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();

  const [lockType, setLockType] = React.useState<LockType>('cannot_delete');

  const { error, isPending, mutateAsync, reset } = useCreateLockMutation();

  const handleLockTypeChange = (
    _e: React.ChangeEvent<HTMLInputElement>,
    value: string
  ) => {
    setLockType(value as LockType);
  };

  React.useEffect(() => {
    if (open) {
      reset();
      setLockType('cannot_delete');
    }
  }, [open, reset]);

  const handleSubmit = async () => {
    if (!linodeId) {
      return;
    }

    await mutateAsync({
      entity_id: linodeId,
      entity_type: 'linode',
      lock_type: lockType,
    });

    enqueueSnackbar(`Lock applied to ${linodeLabel}.`, {
      variant: 'success',
    });
    onClose();
  };

  const errorMessage = error
    ? getAPIErrorOrDefault(error, 'Failed to apply lock.')[0].reason
    : undefined;

  return (
    <ConfirmationDialog
      actions={
        <ActionsPanel
          primaryButtonProps={{
            disabled: isPending,
            label: 'Apply Lock',
            loading: isPending,
            onClick: handleSubmit,
          }}
          secondaryButtonProps={{
            disabled: isPending,
            label: 'Cancel',
            onClick: onClose,
          }}
          sx={{ padding: 0 }}
        />
      }
      onClose={onClose}
      open={open}
      title={`Add lock to ${linodeLabel ?? ''}?`}
    >
      {errorMessage && <Notice text={errorMessage} variant="error" />}
      <StyledHeading>Choose the type of lock to apply.</StyledHeading>
      <RadioGroup
        name="lock-type"
        onChange={handleLockTypeChange}
        value={lockType}
      >
        <Stack alignItems="flex-start" direction="column" spacing={2}>
          <RadioButtonAlignedFormControlLabel
            control={<Radio />}
            label={
              <LockOptionLabel
                description="Prevents this Linode from being deleted or rebuilt."
                title="Prevent deletion"
              />
            }
            value="cannot_delete"
          />
          <RadioButtonAlignedFormControlLabel
            control={<Radio />}
            label={
              <LockOptionLabel
                description="Prevents this Linode and its attached resources (Disks, Configurations, IP Addresses, and Subinterfaces) from being deleted or rebuilt."
                title="Prevent deletion (including attached resources)"
              />
            }
            value="cannot_delete_with_subresources"
          />
        </Stack>
      </RadioGroup>
    </ConfirmationDialog>
  );
};

interface LockOptionLabelProps {
  description: string;
  title: string;
}

const LockOptionLabel = ({ description, title }: LockOptionLabelProps) => {
  const theme = useTheme();

  return (
    <span>
      <Typography sx={{ font: theme.tokens.alias.Typography.Body.Semibold }}>
        {title}
      </Typography>
      <Typography
        sx={{ color: theme.tokens.alias.Content.Text.Secondary.Default }}
      >
        {description}
      </Typography>
    </span>
  );
};

/**
 * Custom styled FormControlLabel to align the radio button with multi-line labels.
 * Since our labels have a title and description (two lines), the MUI default alignment doesn't work for us.
 * We use `alignItems: flex-start` to position the radio button at the top. The `marginTop: 10` on the label
 * compensates for the radio button's internal padding, ensuring the label text aligns visually
 * with the radio button.
 */
const RadioButtonAlignedFormControlLabel = styled(FormControlLabel)(
  ({ theme }) => ({
    alignItems: 'flex-start',
    '& .MuiFormControlLabel-label': {
      marginTop: 10,
    },
  })
);

const StyledHeading = styled(Typography)(({ theme }) => ({
  font: theme.tokens.alias.Typography.Heading.S,
  marginBottom: theme.tokens.spacing.S20,
}));
