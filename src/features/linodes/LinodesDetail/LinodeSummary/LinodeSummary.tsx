import * as React from 'react';

import SummaryPanel from './SummaryPanel';

import LinodeBusyStatus from './LinodeBusyStatus';
import transitionStatus from 'src/features/linodes/linodeTransitionStatus';

interface Props {
  linode: Linode.Linode & { recentEvent?: Linode.Event };
  type?: Linode.LinodeType;
  image?: Linode.Image;
  volumes: Linode.Volume[];
}

type FinalProps = Props;

class LinodeSummary extends React.Component<FinalProps> {

  render() {
    const { linode, type, image, volumes } = this.props;
    return (
      <React.Fragment>
        {transitionStatus.includes(linode.status) &&
          <LinodeBusyStatus linode={linode} />
        }
        <SummaryPanel linode={linode} type={type} image={image} volumes={volumes} />
      </React.Fragment>
    );
  }
}

export default LinodeSummary;
