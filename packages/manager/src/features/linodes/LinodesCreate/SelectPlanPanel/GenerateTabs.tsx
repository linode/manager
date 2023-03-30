import * as React from 'react';
import { LinodeTypeClass } from '@linode/api-v4/lib/linodes';
import { Capabilities } from '@linode/api-v4/lib/regions/types';
import { filterPlanSelectionTypes } from './utils';
import { PlanSelectionType } from './SelectPlanPanel';
import { Tab } from 'src/components/TabbedPanel/TabbedPanel';
import { isEmpty } from 'ramda';
import Notice from 'src/components/Notice';
import RenderPlanContainer from './RenderPlanContainer';
import Typography from 'src/components/core/Typography';
import { useSelectPlanPanelStyles } from './SelectPlanPanelStyles';
import { Region } from '@linode/api-v4/lib/regions';
import arrayToList from 'src/utilities/arrayToDelimiterSeparatedList';

interface Props {
  types: PlanSelectionType[];
  header?: string;
  isCreate?: boolean;
  showTransfer?: boolean;
  selectedDiskSize?: number | undefined;
  currentPlanHeading?: string;
  disabledClasses?: LinodeTypeClass[];
  disabled?: boolean;
  selectedID?: string;
  linodeID?: number | undefined;
  regionsData: Region[];
  onSelect: (key: string) => void;
}

const GenerateTabs = ({
  types,
  header,
  isCreate,
  showTransfer,
  selectedDiskSize,
  currentPlanHeading,
  selectedID,
  linodeID,
  disabledClasses,
  disabled,
  regionsData,
  onSelect,
}: Props) => {
  const classes = useSelectPlanPanelStyles();
  const {
    nanodes,
    standards,
    highmem,
    proDedicated,
    dedicated,
    gpu,
    metal,
    premium,
  } = filterPlanSelectionTypes(types);
  const tabs: Tab[] = [];

  const shared = [...nanodes, ...standards];

  const plansTabContent = [
    {
      typography:
        'Pro Dedicated CPU instances are for very demanding workloads. They only have AMD 2nd generation processors or newer.',
      plans: proDedicated,
      title: 'Pro Dedicated CPU',
      key: 'prodedicated',
      dataId: 'data-qa-prodedi',
    },
    {
      typography:
        'Dedicated CPU instances are good for full-duty workloads where consistent performance is important.',
      plans: dedicated,
      title: 'Dedicated CPU',
      key: 'dedicated',
      dataId: 'data-qa-dedicated',
    },
    {
      typography:
        ' Shared CPU instances are good for medium-duty workloads and are a good mix of performance, resources, and price.',
      plans: shared,
      title: 'Shared CPU',
      key: 'shared',
      dataId: 'data-qa-standard',
    },
    {
      typography:
        'High Memory instances favor RAM over other resources, and can be good for memory hungry use cases like caching and in-memory databases. All High Memory plans use dedicated CPU cores.',
      plans: highmem,
      title: 'High Memory',
      key: 'highmem',
      dataId: 'data-qa-highmem',
    },
    {
      typography:
        'Linodes with dedicated GPUs accelerate highly specialized applications such as machine learning, AI, and video transcoding.',
      plans: gpu,
      title: 'GPU',
      key: 'gpu',
      dataId: 'data-qa-gpu',
    },
    {
      typography:
        'Bare Metal Linodes give you full, dedicated access to a single physical machine. Some services, including backups, VLANs, and disk management, are not available with these plans.',
      plans: metal,
      title: 'Bare Metal',
      key: 'metal',
      dataId: 'data-qa-gpu',
    },
    {
      typography:
        'Premium CPU instances guarantee a minimum processor model, AMD Epyc\u2122 7713 or higher, to ensure consistent high performance for more demanding workloads.',
      notice: 'This plan is only available in the Washington, DC region.',
      plans: premium,
      title: 'Premium',
      key: 'premium',
      dataId: 'data-qa-premium',
    },
  ];

  const isClassDisabled = (thisClass: string) => {
    // Get an array of disabled classes, or an empty array if none are provided
    const disabledClassList = (disabledClasses as string[]) ?? [];
    return disabledClassList.includes(thisClass);
  };

  const getRegionsWithCapability = (capability: Capabilities) => {
    const regions = regionsData ?? [];
    const withCapability = regions
      .filter(({ capabilities }) => capabilities.includes(capability))
      .map(({ label }) => label);
    return arrayToList(withCapability);
  };

  const GPUNotice = () => {
    const programInfo = isClassDisabled('gpu') ? (
      <>
        GPU instances are not available in the selected region. Currently these
        plans are only available in {getRegionsWithCapability('GPU Linodes')}.
      </>
    ) : (
      <div className={classes.gpuGuideLink}>
        Linode GPU plans have limited availability and may not be available at
        the time of your request. Some additional verification may be required
        to access these services.
        <a
          href="https://www.linode.com/docs/platform/linode-gpu/getting-started-with-gpu/"
          target="_blank"
          aria-describedby="external-site"
          rel="noopener noreferrer"
        >
          {` `}Here is a guide
        </a>{' '}
        with information on getting started.
      </div>
    );
    return <Notice warning>{programInfo}</Notice>;
  };

  const MetalNotice = () => {
    const programInfo = isClassDisabled('metal') ? (
      // Until BM-426 is merged, we aren't filtering for regions in getDisabledClass
      // so this branch will never run.
      <Typography>
        Bare Metal instances are not available in the selected region. Currently
        these plans are only available in{' '}
        {getRegionsWithCapability('Bare Metal')}.
      </Typography>
    ) : (
      <Typography className={classes.gpuGuideLink}>
        Bare Metal Linodes have limited availability and may not be available at
        the time of your request. Some additional verification may be required
        to access these services.
      </Typography>
    );
    return <Notice warning>{programInfo}</Notice>;
  };

  plansTabContent.forEach(
    ({ typography, notice, plans, title, key, dataId }) => {
      if (!isEmpty(plans)) {
        tabs.push({
          render: () => {
            return (
              <>
                {key === 'gpu' ? <GPUNotice /> : null}
                {key === 'metal' ? <MetalNotice /> : null}
                {key !== 'gpu' && key !== 'metal' && notice ? (
                  <Notice warning>{notice}</Notice>
                ) : null}
                <Typography {...[dataId]} className={classes.copy}>
                  {typography}
                </Typography>
                <RenderPlanContainer
                  header={header}
                  isCreate={isCreate}
                  plans={plans}
                  showTransfer={showTransfer}
                  selectedDiskSize={selectedDiskSize}
                  currentPlanHeading={currentPlanHeading}
                  disabledClasses={disabledClasses}
                  disabled={disabled}
                  selectedID={selectedID}
                  linodeID={linodeID}
                  onSelect={onSelect}
                />
              </>
            );
          },
          title,
        });
      }
    }
  );

  return [tabs];
};

export default GenerateTabs;
