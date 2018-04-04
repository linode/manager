import * as React from 'react';
import Typography from 'material-ui/Typography';

interface Props {
  linode: Linode.Linode;
}

interface State {
}

type FinalProps = Props;

class LinodeSummary extends React.Component<FinalProps, State> {
  render() {
    const { linode } = this.props;
    return (
      <Typography variant="headline">
        Linode Summary for {linode.label}
      </Typography>
    );
  }
}

export default LinodeSummary;
