import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { sendLinodeCreateDocsEvent } from 'src/utilities/analytics/customEventAnalytics';

import type {
  DisableRegionOption,
  RegionFilterValue,
} from './RegionSelect.types';
import type { Region } from '@linode/api-v4';
import type { SelectRegionPanelProps } from 'src/components/SelectRegionPanel/SelectRegionPanel';

interface TwoStepRegionSelectProps
  extends Omit<SelectRegionPanelProps, 'selectedId'> {
  disabledRegions: Record<string, DisableRegionOption>;
  regions: Region[];
  value?: string;
}

interface GeographicalAreaOption {
  label: string;
  value: RegionFilterValue;
}

const GEOGRAPHICAL_AREA_OPTIONS: GeographicalAreaOption[] = [
  {
    label: 'All',
    value: 'distributed-ALL',
  },
  {
    label: 'North America',
    value: 'distributed-NA',
  },
  {
    label: 'Africa',
    value: 'distributed-AF',
  },
  {
    label: 'Asia',
    value: 'distributed-AS',
  },
  {
    label: 'Europe',
    value: 'distributed-EU',
  },
  {
    label: 'Oceania',
    value: 'distributed-OC',
  },
  {
    label: 'South America',
    value: 'distributed-SA',
  },
];

export const TwoStepRegionSelect = (props: TwoStepRegionSelectProps) => {
  const {
    RegionSelectProps,
    currentCapability,
    disabled,
    disabledRegions,
    error,
    handleSelection,
    helperText,
    regions,
    value,
  } = props;

  const [regionFilter, setRegionFilter] = React.useState<RegionFilterValue>(
    'distributed'
  );

  return (
    <Tabs>
      <TabList>
        <Tab>Core</Tab>
        <Tab>Distributed</Tab>
      </TabList>
      <TabPanels>
        <SafeTabPanel index={0}>
          <Box marginTop={2}>
            <RegionHelperText
              onClick={() => sendLinodeCreateDocsEvent('Speedtest')}
            />
          </Box>
          <RegionSelect
            currentCapability={currentCapability}
            disableClearable
            disabled={disabled}
            disabledRegions={disabledRegions}
            errorText={error}
            helperText={helperText}
            onChange={(e, region: Region) => handleSelection(region.id)}
            regionFilter="core"
            regions={regions ?? []}
            showDistributedRegionIconHelperText={false}
            value={value}
            {...RegionSelectProps}
          />
        </SafeTabPanel>
        <SafeTabPanel index={1}>
          <Autocomplete
            onChange={(_, selectedOption) => {
              if (selectedOption?.value) {
                setRegionFilter(selectedOption.value);
              }
            }}
            defaultValue={GEOGRAPHICAL_AREA_OPTIONS[0]}
            disableClearable
            label="Geographical Area"
            options={GEOGRAPHICAL_AREA_OPTIONS}
          />
          <RegionSelect
            currentCapability={currentCapability}
            disableClearable
            disabled={disabled}
            disabledRegions={disabledRegions}
            errorText={error}
            helperText={helperText}
            onChange={(e, region: Region) => handleSelection(region.id)}
            regionFilter={regionFilter}
            regions={regions ?? []}
            showDistributedRegionIconHelperText={false}
            value={value}
            {...RegionSelectProps}
          />
        </SafeTabPanel>
      </TabPanels>
    </Tabs>
  );
};
