import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Paper from 'src/components/core/Paper';

import Instructions from '../../shared/InstallationInstructions';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3),
  },
}));

interface Props {
  clientAPIKey: string;
  clientInstallationKey: string;
}

type CombinedProps = Props;

const Installation: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  return (
    <>
      <DocumentTitleSegment segment="Installation" />
      <Paper className={classes.root} data-testid="longview-clients">
        <Instructions
          APIKey={props.clientAPIKey}
          data-qa-instructions
          installationKey={props.clientInstallationKey}
        />
      </Paper>
    </>
  );
};

export default React.memo(Installation);
