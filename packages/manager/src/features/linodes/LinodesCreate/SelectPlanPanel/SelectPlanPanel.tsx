import { LinodeTypeClass, BaseType } from '@linode/api-v4/lib/linodes';
import { LDClient } from 'launchdarkly-js-client-sdk';
import * as React from 'react';
import { compose } from 'recompose';
import { pathOr } from 'ramda';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import TabbedPanel from 'src/components/TabbedPanel';
import withRegions, {
  DefaultProps as RegionsProps,
} from 'src/containers/regions.container';
import { ExtendedType } from 'src/utilities/extendType';
import { useSelectPlanPanelStyles } from './SelectPlanPanelStyles';
import GenerateTabs from './GenerateTabs';

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

export const SelectPlanPanel = (props: CombinedProps) => {
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
    disabledClasses,
  } = props;

  const classes = useSelectPlanPanelStyles();

  const onSelect = (id: string) => props.onSelect(id);

  const [tabs] = GenerateTabs({
    types,
    showTransfer,
    isCreate,
    disabled,
    disabledClasses,
    selectedID,
    linodeID,
    regionsData: props.regionsData,
    onSelect,
  });

  const tabOrder: LinodeTypeClass[] = [
    'prodedicated',
    'dedicated',
    'standard',
    'highmem',
    'gpu',
    'metal',
    'premium',
  ];

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
