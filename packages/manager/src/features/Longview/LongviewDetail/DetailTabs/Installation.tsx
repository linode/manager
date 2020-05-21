import * as React from 'react';
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

type CombinedProps = Props;

const Installation: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  return (
    <Paper
      data-testid="longview-clients"
      className={classes.root}
      id="tabpanel-installation"
      role="tabpanel"
      aria-labelledby="tab-installation"
    >
      <Instructions
        data-qa-instructions
        APIKey={props.clientAPIKey}
        installationKey={props.clientInstallationKey}
      />
    </Paper>
  );
};

export default React.memo(Installation);
