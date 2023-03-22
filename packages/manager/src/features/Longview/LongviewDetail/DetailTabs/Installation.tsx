import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import Paper from 'src/components/core/Paper';

import Instructions from '../../shared/InstallationInstructions';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3),
  },
}));

interface Props {
  clientInstallationKey: string;
  clientAPIKey: string;
}

type CombinedProps = Props;

const Installation: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  return (
    <>
      <DocumentTitleSegment segment="Installation" />
      <Paper data-testid="longview-clients" className={classes.root}>
        <Instructions
          data-qa-instructions
          APIKey={props.clientAPIKey}
          installationKey={props.clientInstallationKey}
        />
      </Paper>
    </>
  );
};

export default React.memo(Installation);
