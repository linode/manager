import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
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

const Installation = (props: Props) => {
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
