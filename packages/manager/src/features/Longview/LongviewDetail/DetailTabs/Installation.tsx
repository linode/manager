import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';

import Paper from 'src/components/core/Paper';

import Instructions from '../../shared/InstallationInstructions';

import TimeRangeSelect from '../../shared/TimeRangeSelect';

import get from '../../request';
import { LongviewCPU } from '../../request.types';

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
    <Paper className={classes.root}>
      <TimeRangeSelect<LongviewCPU>
        lastUpdated={123}
        request={() =>
          get(props.clientAPIKey, 'getValues', {
            fields: ['cpu']
          })
        }
      >
        {stats => {
          // console.log(stats);
          return <div>hello world</div>;
        }}
      </TimeRangeSelect>
      <Instructions
        APIKey={props.clientAPIKey}
        installationKey={props.clientInstallationKey}
      />
    </Paper>
  );
};

export default React.memo(Installation);
