import {
  useAllAccountAvailabilitiesQuery,
  useRegionsQuery,
} from '@linode/queries';
import { Autocomplete, Box, Paper, Typography } from '@linode/ui';
import * as React from 'react';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { Flag } from 'src/components/Flag';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { useFlags } from 'src/hooks/useFlags';
import { sendLinodeCreateDocsEvent } from 'src/utilities/analytics/customEventAnalytics';
import { sendLinodeCreateFormInputEvent } from 'src/utilities/analytics/formEventAnalytics';
import { DOCS_LINK_LABEL_DC_PRICING } from 'src/utilities/pricing/constants';

import { useLinodeCreateQueryParams } from './utilities';

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

  const { data: regions } = useRegionsQuery();
  const { params } = useLinodeCreateQueryParams();
  const flags = useFlags();

  const {
    data: accountAvailabilityData,
    isLoading: accountAvailabilityLoading,
  } = useAllAccountAvailabilitiesQuery();

  return (
    <Paper data-qa-linode-region data-testid="region">
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="h2">Region</Typography>
        <DocsLink
          onClick={() =>
            sendLinodeCreateFormInputEvent({
              createType: params.type ?? 'OS',
              headerName: 'Region',
              interaction: 'click',
              label: DOCS_LINK_LABEL_DC_PRICING,
            })
          }
          href="https://www.linode.com/pricing"
          label={DOCS_LINK_LABEL_DC_PRICING}
        />
      </Box>
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
                showCoreHelperText
              />
            </Box>
            <RegionSelect
              FlagComponent={Flag}
              accountAvailabilityData={accountAvailabilityData}
              accountAvailabilityLoading={accountAvailabilityLoading}
              currentCapability="Linodes"
              disableClearable
              disabled={disabled}
              disabledRegions={disabledRegions}
              errorText={errorText}
              flags={flags}
              onChange={(e, region) => onChange(region)}
              regionFilter="core"
              regions={regions ?? []}
              value={value}
            />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <Box mt={2}>
              <Typography>
                Data centers in distributed locations enable you to place
                workloads closer to users.
              </Typography>
            </Box>
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
              FlagComponent={Flag}
              accountAvailabilityData={accountAvailabilityData}
              accountAvailabilityLoading={accountAvailabilityLoading}
              currentCapability="Linodes"
              disableClearable
              disabled={disabled}
              disabledRegions={disabledRegions}
              errorText={errorText}
              flags={flags}
              onChange={(e, region) => onChange(region)}
              regionFilter={regionFilter}
              regions={regions ?? []}
              value={value}
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </Paper>
  );
};
