import { Box, Button, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import React from 'react';

import { Avatar } from 'src/components/Avatar/Avatar';

import { AvatarColorPickerDialog } from './AvatarColorPickerDialog';

export const AvatarForm = () => {
  const [
    isColorPickerDialogOpen,
    setAvatarColorPickerDialogOpen,
  ] = React.useState(false);

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        gap: 2,
        marginTop: theme.spacing(),
      })}
    >
      <Avatar height={88} width={88} />
      <div>
        <Typography sx={{ fontSize: '1rem' }} variant="h2">
          Avatar
        </Typography>
        <StyledProfileCopy variant="body1">
          Your avatar is automatically generated using the first character of
          your username.
        </StyledProfileCopy>
        <Button
          buttonType="outlined"
          onClick={() => setAvatarColorPickerDialogOpen(true)}
        >
          Change Avatar Color
        </Button>
      </div>
      <AvatarColorPickerDialog
        handleClose={() => setAvatarColorPickerDialogOpen(false)}
        open={isColorPickerDialogOpen}
      />
    </Box>
  );
};

const StyledProfileCopy = styled(Typography, {
  label: 'StyledProfileCopy',
})(({ theme }) => ({
  marginBottom: theme.spacing(2),
  marginTop: 4,
  maxWidth: 360,
}));
