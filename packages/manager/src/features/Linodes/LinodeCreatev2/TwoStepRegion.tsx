import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Paper } from 'src/components/Paper';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { sendLinodeCreateDocsEvent } from 'src/utilities/analytics/customEventAnalytics';

import type { Region as RegionType } from '@linode/api-v4';
import type {
  RegionFilterValue,
  RegionSelectProps,
} from 'src/components/RegionSelect/RegionSelect.types';

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

interface Props {
  onChange: (region: RegionType) => void;
}

type CombinedProps = Props & Omit<Partial<RegionSelectProps>, 'onChange'>;

export const TwoStepRegion = (props: CombinedProps) => {
  const { disabled, disabledRegions, errorText, onChange, value } = props;

  const [regionFilter, setRegionFilter] = React.useState<RegionFilterValue>(
    'distributed'
  );

  const { data: regions } = useRegionsQuery(true);

  return (
    <Paper>
      <Typography variant="h2">Region</Typography>
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
              currentCapability="Linodes"
              disableClearable
              disabled={disabled}
              disabledRegions={disabledRegions}
              errorText={errorText}
              onChange={(e, region) => onChange(region)}
              regionFilter="core"
              regions={regions ?? []}
              showDistributedRegionIconHelperText={false}
              value={value}
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
              currentCapability="Linodes"
              disableClearable
              disabled={disabled}
              disabledRegions={disabledRegions}
              errorText={errorText}
              onChange={(e, region) => onChange(region)}
              regionFilter={regionFilter}
              regions={regions ?? []}
              showDistributedRegionIconHelperText={false}
              value={value}
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </Paper>
  );
};
