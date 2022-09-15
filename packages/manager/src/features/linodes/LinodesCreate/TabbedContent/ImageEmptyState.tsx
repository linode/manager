import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

const useStyles = makeStyles((theme: Theme) => ({
  emptyImagePanelText: {
    marginTop: theme.spacing(1),
    padding: `${theme.spacing(1)}px 0`,
  },
}));

interface Props {
  errorText: string | undefined;
  className?: string;
}

export const ImageEmptyState: React.FC<Props> = (props) => {
  const { errorText, className } = props;
  const classes = useStyles();

  return (
    <Paper className={className}>
      {errorText ? <Notice error text={errorText} /> : null}
      <Typography variant="h2" data-qa-tp="Select Image">
        Select Image
      </Typography>
      <Typography
        variant="body1"
        className={classes.emptyImagePanelText}
        data-qa-no-compatible-images
      >
        No Compatible Images Available
      </Typography>
    </Paper>
  );
};

export default ImageEmptyState;
