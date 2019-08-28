import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
// import { makeStyles, Theme } from 'src/components/core/styles';

// const useStyles = makeStyles((theme: Theme) => ({
//   root: {}
// }));

type CombinedProps = RouteComponentProps<{
  regionId: string;
  bucketName: string;
}>;

const BucketDetail: React.FC<CombinedProps> = props => {
  // const classes = useStyles();

  return <>Bucket Detail for {props.match.params.bucketName}</>;
};

export default BucketDetail;
