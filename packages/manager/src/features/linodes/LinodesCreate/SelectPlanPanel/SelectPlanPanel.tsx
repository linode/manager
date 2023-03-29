import { LinodeTypeClass, BaseType } from '@linode/api-v4/lib/linodes';
import { Capabilities } from '@linode/api-v4/lib/regions/types';
import { LDClient } from 'launchdarkly-js-client-sdk';
import { isEmpty, pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import TabbedPanel from 'src/components/TabbedPanel';
import { Tab } from 'src/components/TabbedPanel/TabbedPanel';
import withRegions, {
  DefaultProps as RegionsProps,
} from 'src/containers/regions.container';
import arrayToList from 'src/utilities/arrayToDelimiterSeparatedList';
import { ExtendedType } from 'src/utilities/extendType';
import { filterPlanSelectionTypes } from './utils';
import RenderPlanContainer from './RenderPlanContainer';
import { useSelectPlanPanelStyles } from './SelectPlanPanelStyles';

export interface PlanSelectionType extends BaseType {
  formattedLabel: ExtendedType['formattedLabel'];
  class: ExtendedType['class'];
  heading: ExtendedType['heading'];
  subHeadings: ExtendedType['subHeadings'];
  price: ExtendedType['price'];
  transfer?: ExtendedType['transfer'];
  network_out?: ExtendedType['network_out'];
}

interface Props {
  types: PlanSelectionType[];
  error?: string;
  onSelect: (key: string) => void;
  selectedID?: string;
  linodeID?: number | undefined;
  selectedDiskSize?: number;
  currentPlanHeading?: string;
  disabled?: boolean;
  header?: string;
  copy?: string;
  disabledClasses?: LinodeTypeClass[];
  tabbedPanelInnerClass?: string;
  ldClient?: LDClient;
  isCreate?: boolean;
  className?: string;
  showTransfer?: boolean;
  docsLink?: JSX.Element;
}

type CombinedProps = Props & RegionsProps;

export const SelectPlanPanel: React.FC<CombinedProps> = (props) => {
  const {
    selectedID,
    currentPlanHeading,
    disabled,
    isCreate,
    header,
    linodeID,
    showTransfer,
    types,
    className,
    copy,
    error,
    docsLink,
  } = props;

  const classes = useSelectPlanPanelStyles();

  const onSelect = (id: string) => props.onSelect(id);

  const getDisabledClass = (thisClass: string) => {
    const disabledClasses = (props.disabledClasses as string[]) ?? []; // Not a big fan of the casting here but it works
    return disabledClasses.includes(thisClass);
  };

  const getRegionsWithCapability = (capability: Capabilities) => {
    const regions = props.regionsData ?? [];
    const withCapability = regions
      .filter((thisRegion) => thisRegion.capabilities.includes(capability))
      .map((thisRegion) => thisRegion.label);
    return arrayToList(withCapability);
  };

  const GPUNotice = () => {
    const programInfo = getDisabledClass('gpu') ? (
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
    const programInfo = getDisabledClass('metal') ? (
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

  const createTabs = (): [Tab[], LinodeTypeClass[]] => {
    const tabs: Tab[] = [];
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

    const tabOrder: LinodeTypeClass[] = [];

    const shared = [...nanodes, ...standards];

    // type plansTabContentTypes = {
    //   typography: string;
    //   plans: PlanSelectionType[];
    //   title: string;
    //   key: LinodeTypeClass;
    //   dataId: string;
    //   notice?: string;
    // };

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
                    selectedDiskSize={props.selectedDiskSize}
                    currentPlanHeading={currentPlanHeading}
                    disabledClasses={props.disabledClasses}
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
          // tabOrder.push(key);
        }
      }
    );

    return [tabs, tabOrder];
  };

  const [tabs, tabOrder] = createTabs();

  // Determine initial plan category tab based on current plan selection
  // (if there is one).
  let selectedTypeClass: LinodeTypeClass = pathOr(
    'dedicated', // Use `dedicated` by default
    ['class'],
    types.find(
      (type) => type.id === selectedID || type.heading === currentPlanHeading
    )
  );

  // We don't have a "Nanodes" tab anymore, so use `standard` (labeled as "Shared CPU").
  if (selectedTypeClass === 'nanode') {
    selectedTypeClass = 'standard';
  }

  const initialTab = tabOrder.indexOf(selectedTypeClass);

  return (
    <TabbedPanel
      rootClass={`${classes.root} ${className} tabbedPanel`}
      innerClass={props.tabbedPanelInnerClass}
      error={error}
      header={header || 'Linode Plan'}
      copy={copy}
      tabs={tabs}
      initTab={initialTab >= 0 ? initialTab : 0}
      docsLink={docsLink}
      data-qa-select-plan
    />
  );
};

export default compose<CombinedProps, Props & RenderGuardProps>(
  RenderGuard,
  withRegions
)(SelectPlanPanel);
