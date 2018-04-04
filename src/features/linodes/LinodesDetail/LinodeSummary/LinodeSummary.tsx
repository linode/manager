import * as React from 'react';

import SummaryPanel from './SummaryPanel';

interface Props {
  linode: Linode.Linode & { recentEvent?: Linode.Event };
  type: Linode.LinodeType;
  image: Linode.Image;
}

type FinalProps = Props;

class LinodeSummary extends React.Component<FinalProps> {

  render() {
    const { linode, type, image } = this.props;
    return (
      <SummaryPanel linode={linode} type={type} image={image} />
    );
  }
}

export default LinodeSummary;
