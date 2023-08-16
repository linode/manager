import { SxProps, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { Paper } from 'src/components/Paper';

interface Props {
  sx?: SxProps;
  className?: string;
  errorText: string | undefined;
}

export const ImageEmptyState = (props: Props) => {
  const { className, errorText, sx } = props;
  const theme = useTheme();

  return (
    <Paper sx={sx} className={className}>
      {errorText ? <Notice error text={errorText} /> : null}
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
