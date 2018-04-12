import * as React from 'react';

import SummaryPanel from './SummaryPanel';

import transitionStatus from 'src/features/linodes/linodeTransitionStatus';
import ExpansionPanel from 'src/components/ExpansionPanel';

import LinodeBusyStatus from './LinodeBusyStatus';

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
        <ExpansionPanel
          heading="CPU %"
        >
          CPU Chart
        </ExpansionPanel>
        <ExpansionPanel
          heading="IPv4 Traffic"
        >
          IPv4 Chart
        </ExpansionPanel>
        <ExpansionPanel
          heading="IPv6 Traffic"
        >
          IPv6 Chart
        </ExpansionPanel>
      </React.Fragment>
    );
  }
}

export default LinodeSummary;
