import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import Paper from 'src/components/core/Paper';

const useStyles = makeStyles((theme: Theme) => ({
  emptyImagePanelText: {
    marginTop: theme.spacing(1),
    padding: `${theme.spacing(1)} 0`,
  },
}));

interface Props {
  className?: string;
  errorText: string | undefined;
}

export const ImageEmptyState: React.FC<Props> = (props) => {
  const { className, errorText } = props;
  const classes = useStyles();

  return (
    <Paper className={className}>
      {errorText ? <Notice error text={errorText} /> : null}
      <Typography data-qa-tp="Select Image" variant="h2">
        Select Image
      </Typography>
      <Typography
        className={classes.emptyImagePanelText}
        data-qa-no-compatible-images
        variant="body1"
      >
        No Compatible Images Available
      </Typography>
    </Paper>
  );
};

export default ImageEmptyState;
