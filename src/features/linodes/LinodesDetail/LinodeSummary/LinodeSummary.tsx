import * as React from 'react';

import Typography from 'material-ui/Typography';


interface Props {
  linode: Linode.Linode & { recentEvent?: Linode.Event };
}

type FinalProps = Props;

class LinodeSummary extends React.Component<FinalProps> {

  render() {
    const { linode } = this.props;
    return (
      <React.Fragment>
        <Typography variant="headline">
          Linode Summary for {linode.label}
        </Typography>
      </React.Fragment>
    );
  }
}

export default LinodeSummary;
