import { Notice, Paper, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import type { SxProps, Theme } from '@mui/material/styles';

interface Props {
  className?: string;
  errorText: string | undefined;
  sx?: SxProps<Theme>;
}

export const ImageEmptyState = (props: Props) => {
  const { className, errorText, sx } = props;
  const theme = useTheme();

  return (
    <Paper className={className} sx={sx}>
      {errorText ? <Notice text={errorText} variant="error" /> : null}
      <Typography data-qa-tp="Select Image" variant="h2">
        Select Image
      </Typography>
      <Typography
        sx={{
          marginTop: theme.spacing(1),
          padding: `${theme.spacing(1)} 0`,
        }}
        data-qa-no-compatible-images
        variant="body1"
      >
        No Compatible Images Available
      </Typography>
    </Paper>
  );
};
