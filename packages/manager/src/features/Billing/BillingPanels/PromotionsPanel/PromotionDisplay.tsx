import * as React from 'react';

import Promotion from 'src/assets/icons/promotion.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import formatDate from 'src/utilities/formatDate';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '&:not(:first-child)': {
      marginTop: theme.spacing(2),
      paddingTop: theme.spacing(1),
      borderTop: `1px solid ${theme.palette.divider}`
    }
  },
  container: {
    flex: 1
  },
  expires: {
    color: '#10A632'
  }
}));

interface Props {
  description: string;
  summary?: string;
  expiry: string;
}

export const PromotionDisplay: React.FC<Props> = props => {
  const { expiry, description, summary } = props;
  const classes = useStyles();
  return (
    <Grid
      container
      direction="row"
      wrap="nowrap"
      alignItems="center"
      className={classes.root}
    >
      <Grid item>
        <Grid item>
          <Promotion />
        </Grid>
      </Grid>
      <Grid item className={classes.container}>
        {summary && (
          <Typography variant="subtitle2">
            <strong>{summary}</strong>
          </Typography>
        )}
        <Typography>{description}</Typography>
      </Grid>
      <Grid item>
        <Typography className={classes.expires}>
          <em>Expires {formatDate(expiry, { format: 'D-MMM-YYYY' })}</em>
        </Typography>
      </Grid>
    </Grid>
  );
};

export default PromotionDisplay;
