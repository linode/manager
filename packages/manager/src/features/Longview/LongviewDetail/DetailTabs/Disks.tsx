import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
// import { makeStyles, Theme } from 'src/components/core/styles'

// import getStats from '../../request'

// const useStyles = makeStyles((theme: Theme) => ({
//   root: {}
// }))

interface Props extends RouteComponentProps<{}> {
  clientAPIKey: string;
  clientID: number;
}

type CombinedProps = Props;

const Disks: React.FC<CombinedProps> = props => {
  // const classes = useStyles();

  return <div>hello world</div>;
};

export default compose<CombinedProps, Props>(React.memo)(Disks);
