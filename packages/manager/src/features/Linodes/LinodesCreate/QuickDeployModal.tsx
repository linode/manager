import { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';
import { Typography } from '@mui/material';
import React from 'react';

import { Button } from 'src/components/Button/Button';
import { Dialog } from 'src/components/Dialog/Dialog';
import { TextField } from 'src/components/TextField';
import { useMutatePreferences, usePreferences } from 'src/queries/preferences';

export interface QuickDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: CreateLinodeRequest;
}

export const QuickDeployModal = (props: QuickDeployModalProps) => {
  const { isOpen, onClose, payload } = props;
  const [label, setLabel] = React.useState('');
  const { isLoading, mutateAsync } = useMutatePreferences();
  const { data } = usePreferences();

  const handleSubmit = () => {
    if (!label) {
      return;
    }
    mutateAsync({
      quick_deploy_options: {
        ...data?.quick_deploy_options,
        linodes: [
          ...(data?.quick_deploy_options?.linodes ?? []),
          { quickDeployLabel: label, ...payload },
        ],
      },
    }).then(() => {
      onClose();
    });
  };

  return (
    <Dialog
      sx={{
        overflowX: 'hidden',
        paddingBottom: '0px',
      }}
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={isOpen}
      title="Save as Quick Deploy"
    >
      <Typography>
        This Linode configuration will be available as a Quick Deploy option
      </Typography>
      <TextField
        fullWidth
        label="Quick Deploy Label"
        onChange={(e) => setLabel(e.target.value)}
        sx={{ width: '100%' }}
        value={label}
      />
      <Button
        buttonType="primary"
        disabled={label === ''}
        loading={isLoading}
        onClick={handleSubmit}
        style={{ marginTop: 16 }}
      >
        Save
      </Button>
    </Dialog>
  );
};
