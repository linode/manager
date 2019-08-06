import * as React from 'react';

import Promotion from 'src/assets/icons/promotion.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import formatDate from 'src/utilities/formatDate';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '6em'
  },
  expires: {
    color: '#10A632'
  }
}));

interface Props {
  header: string;
  description: string;
  expiry: string;
}

export const PromotionDisplay: React.FC<Props> = props => {
  const { expiry, description, header } = props;
  const classes = useStyles();
  return (
    <Grid
      container
      direction="row"
      wrap="nowrap"
      alignItems="center"
      className={classes.root}
    >
      <Grid container item xs={1} justify="center">
        <Grid item>
          <Promotion />
        </Grid>
      </Grid>
      <Grid container direction="column" item xs={8}>
        <Grid item>
          <Typography variant="subtitle1">
            <strong>{header}</strong>
          </Typography>
        </Grid>
        <Grid item>
          <Typography>{description}</Typography>
        </Grid>
      </Grid>
      <Grid container item xs={3} justify="flex-end">
        <Grid>
          <Typography className={classes.expires}>
            <em>Expires {formatDate(expiry, { format: 'D-MMM-YYYY' })}</em>
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default PromotionDisplay;
