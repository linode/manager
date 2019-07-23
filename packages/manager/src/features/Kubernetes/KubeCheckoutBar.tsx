import * as React from 'react';
import { Sticky, StickyProps } from 'react-sticky';

import CheckoutBar from 'src/components/CheckoutBar';
import renderGuard from 'src/components/RenderGuard';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { getTotalClusterMemoryAndCPU, getTotalClusterPrice } from './kubeUtils';
import { PoolNodeWithPrice } from './types';

interface Props {
  label: string;
  region?: string;
  pools: PoolNodeWithPrice[];
  submitting: boolean;
  typesData: ExtendedType[];
  createCluster: () => void;
}

const priceHelperText =
  'This is an estimate. Deploying additional services or resizing may impact your recurring cost.';

export const KubeCheckoutBar: React.FunctionComponent<Props> = props => {
  const { label, region, pools, submitting, createCluster, typesData } = props;
  return (
    <Sticky topOffset={-24} disableCompensation>
      {(stickyProps: StickyProps) => {
        const displaySections = getDisplaySections(
          label,
          region,
          pools,
          typesData
        );

        return (
          <div>
            <CheckoutBar
              data-qa-checkout-bar
              heading="Cluster Summary"
              calculatedPrice={getTotalClusterPrice(pools)}
              isMakingRequest={submitting}
              disabled={false}
              onDeploy={createCluster}
              displaySections={displaySections}
              priceHelperText={priceHelperText}
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
  pools: PoolNodeWithPrice[],
  typesData: ExtendedType[]
) => {
  const displaySections = [];

  const { RAM: totalRAM, CPU: totalCPU } = getTotalClusterMemoryAndCPU(
    pools,
    typesData
  );

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
      details: `${totalCPU}${totalCPU === 1 ? ' CPU' : ' CPUs'}`
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

export default renderGuard(KubeCheckoutBar);
