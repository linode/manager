import * as React from 'react';
import { Sticky, StickyProps } from 'react-sticky';

import CheckoutBar from 'src/components/CheckoutBar';
import { getTotalClusterMemoryAndCPU, getTotalClusterPrice } from './kubeUtils';
import { PoolNode } from './types';

interface Props {
  label: string;
  region?: string;
  pools: PoolNode[];
  createCluster: () => void;
}

export const KubeCheckoutBar: React.FunctionComponent<Props> = props => {
  const { label, region, pools, createCluster } = props;
  return (
    <Sticky topOffset={-24} disableCompensation>
      {(stickyProps: StickyProps) => {
        const displaySections = getDisplaySections(label, region, pools);

        return (
          <div>
            <CheckoutBar
              data-qa-checkout-bar
              heading="Cluster Summary"
              calculatedPrice={getTotalClusterPrice(pools)}
              isMakingRequest={false}
              disabled={false}
              onDeploy={createCluster}
              displaySections={displaySections}
            />
            {/* {this.props.documentation.length > 0 && (
              <DocsSidebar docs={this.props.documentation} />
            )} */}
          </div>
        );
      }}
    </Sticky>
  );
};

export const getDisplaySections = (
  label: string,
  region: string | undefined,
  pools: PoolNode[]
) => {
  const displaySections = [];

  const { RAM: totalRAM, CPU: totalCPU } = getTotalClusterMemoryAndCPU(pools);

  if (region) {
    displaySections.push({
      title: 'Region',
      details: region
    });
  }

  if (totalRAM) {
    displaySections.push({
      title: 'Total RAM',
      details: `${totalRAM / 1024}GB`
    });
  }

  if (totalCPU) {
    displaySections.push({
      title: 'Total CPU',
      details: `${totalCPU}${totalCPU === 1 ? 'CPU' : 'CPUs'}`
    });
  }

  if (label) {
    displaySections.push({
      title: 'Cluster Label',
      details: label
    });
  }
  return displaySections;
};

export default KubeCheckoutBar;
