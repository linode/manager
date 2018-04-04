import * as React from 'react';

import SummaryPanel from './SummaryPanel';


interface Props {
  linode: Linode.Linode & { recentEvent?: Linode.Event };
}

type FinalProps = Props;

class LinodeSummary extends React.Component<FinalProps> {

  render() {
    const { linode } = this.props;
    return (
      <SummaryPanel linode={linode}/>
    );
  }
}

export default LinodeSummary;
