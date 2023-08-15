import { SxProps, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';

interface Props {
  className?: string;
  errorText: string | undefined;
  sx?: SxProps;
}

export const ImageEmptyState = (props: Props) => {
  const { className, errorText, sx } = props;
  const theme = useTheme();

  return (
    <Paper className={className} sx={sx}>
      {errorText ? <Notice variant="error" text={errorText} /> : null}
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
