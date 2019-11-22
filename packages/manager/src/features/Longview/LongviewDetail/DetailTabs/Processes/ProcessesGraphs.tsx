import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
// import { makeStyles, Theme } from 'src/components/core/styles';
import { ExtendedProcess } from './ProcessesTable';

// const useStyles = makeStyles((theme: Theme) => ({
//   root: {}
// }));

interface Props {
  processesData: ExtendedProcess[];
  processesLoading: boolean;
  processesError?: APIError[];
  selectedRow: string | null;
}

type CombinedProps = Props;

const ProcessesGraphs: React.FC<CombinedProps> = props => {
  // const classes = useStyles();

  const { processesData, selectedRow } = props;

  const selected = processesData.find(p => p.id === selectedRow);

  return (
    <>
      <Paper>{selected && `${selected.name} ${selected.user}`} </Paper>
    </>
  );
};

export default ProcessesGraphs;
