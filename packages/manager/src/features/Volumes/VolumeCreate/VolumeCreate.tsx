import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose as recompose } from 'recompose';

interface Props {}

type CombinedProps = Props & RouteComponentProps<{}>;

class VolumeCreate extends React.Component<CombinedProps> {
  render() {
    return <p>Create a Volume</p>;
  }
}

export default recompose<CombinedProps, {}>(withRouter)(VolumeCreate);
