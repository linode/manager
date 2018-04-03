import * as React from 'react';
import Typography from 'material-ui/Typography';

interface Props {
}

interface State {
}

type FinalProps = Props;

class LinodeSummary extends React.Component<FinalProps, State> {
  render() {
    return (
      <Typography variant="headline">
        Linode Summary
      </Typography>
    );
  }
}

export default LinodeSummary;
