import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {}
}));

interface Props {}

type CombinedProps = Props & RouteComponentProps<{}>;

const BucketDetail: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  return <>Bucket Detail</>;
};

export default BucketDetail;
