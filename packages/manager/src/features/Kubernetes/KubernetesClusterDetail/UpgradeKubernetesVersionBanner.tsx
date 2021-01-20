import * as React from 'react';

import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    fontSize: '1rem',
    borderLeft: `solid 6px ${theme.color.green}`,
    padding: theme.spacing(1)
  },
  upgradeMessage: {
    marginLeft: theme.spacing()
  }
}));

interface Props {
  currentVersion: string;
}

export type CombinedProps = Props;

export const UpgradeKubernetesVersionBanner: React.FC<Props> = props => {
  const { currentVersion } = props;
  const classes = useStyles();
  return (
    <Paper className={classes.root}>
      <Grid
        container
        direction="row"
        alignItems="center"
        justify="space-between"
      >
        <Grid item>
          <Typography className={classes.upgradeMessage}>
            A new version of Kubernetes is available. {currentVersion}
          </Typography>
        </Grid>
        <Grid item>
          <Button onClick={() => null} buttonType="primary">
            Upgrade Version
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(UpgradeKubernetesVersionBanner);
