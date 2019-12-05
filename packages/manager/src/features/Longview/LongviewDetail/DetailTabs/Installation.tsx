import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';

import Paper from 'src/components/core/Paper';

import Instructions from '../../shared/InstallationInstructions';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3)
  }
}));

interface Props {
  clientInstallationKey: string;
  clientAPIKey: string;
}

type CombinedProps = RouteComponentProps & Props;

const Installation: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  return (
    <Paper
      className={classes.root}
      id="tabpanel-longview-installation"
      role="tabpanel"
      aria-labelledby="tab-longview-installation"
    >
      <Instructions
        APIKey={props.clientAPIKey}
        installationKey={props.clientInstallationKey}
      />
    </Paper>
  );
};

export default React.memo(Installation);
