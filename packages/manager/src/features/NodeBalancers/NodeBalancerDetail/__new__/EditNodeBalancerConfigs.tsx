import * as React from 'react';
import { compose } from 'recompose';
// import { makeStyles, Theme } from 'src/components/core/styles';

// const useStyles = makeStyles((theme: Theme) => ({
//   root: {}
// }));

/* tslint:disable-next-line */
interface Props {}

type CombinedProps = Props;

const EditNodeBalancerConfigs: React.FC<CombinedProps> = props => {
  // const classes = useStyles();

  return <div>hello world</div>;
};

export default compose<CombinedProps, {}>(React.memo)(EditNodeBalancerConfigs);
