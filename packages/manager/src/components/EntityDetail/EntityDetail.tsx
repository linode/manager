import * as React from 'react';

import Grid from 'src/components/Grid';
import Paper from 'src/components/core/Paper';
// import { makeStyles } from 'src/components/core/styles';

export interface EntityDetailProps {
  header: JSX.Element;
  body: JSX.Element;
  footer: JSX.Element;
}

// const useStyles = makeStyles(() => ({}));

export const EntityDetail: React.FC<EntityDetailProps> = props => {
  const { header, body, footer } = props;
  // const classes = useStyles();

  return (
    <Paper>
      <Grid container direction="column">
        <Grid item xs={12}>
          {header}
        </Grid>
        <Grid item xs={12}>
          {body}
        </Grid>
        <Grid item xs={12}>
          {footer}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default EntityDetail;
