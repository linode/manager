import { useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import { Autocomplete, Box, Paper, Typography } from '@linode/ui';
import * as React from 'react';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
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

import { useGetLinodeCreateType } from './Tabs/utils/useGetLinodeCreateType';

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
  onChange: (region: null | RegionType) => void;
}

type CombinedProps = Props & Omit<Partial<RegionSelectProps>, 'onChange'>;

export const TwoStepRegion = (props: CombinedProps) => {
  const { disabled, disabledRegions, errorText, onChange, value } = props;

  const [tabIndex, setTabIndex] = React.useState(0);

  const [regionFilter, setRegionFilter] =
    React.useState<RegionFilterValue>('distributed-ALL');

  const { data: regions } = useRegionsQuery();
  const createType = useGetLinodeCreateType();
  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );

  return (
    <Paper data-qa-linode-region data-testid="region">
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="h2">Region</Typography>
        <DocsLink
          href="https://www.linode.com/pricing"
          label={DOCS_LINK_LABEL_DC_PRICING}
          onClick={() =>
            sendLinodeCreateFormInputEvent({
              createType: createType ?? 'OS',
              headerName: 'Region',
              interaction: 'click',
              label: DOCS_LINK_LABEL_DC_PRICING,
            })
          }
        />
      </Box>
      <Tabs
        onChange={(index) => {
          if (index !== tabIndex) {
            setTabIndex(index);
            // M3-9469: Reset region selection when switching between site types
            onChange(null);
          }
        }}
      >
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
              currentCapability="Linodes"
              disableClearable
              disabled={disabled}
              disabledRegions={disabledRegions}
              errorText={errorText}
              isGeckoLAEnabled={isGeckoLAEnabled}
              onChange={(e, region) => onChange(region)}
              regionFilter="core"
              regions={regions ?? []}
              value={value ?? null}
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
              clearIcon={null}
              defaultValue={GEOGRAPHICAL_AREA_OPTIONS[0]}
              label="Geographical Area"
              onChange={(_, selectedOption) => {
                if (selectedOption?.value) {
                  setRegionFilter(selectedOption.value);
                }
              }}
              options={GEOGRAPHICAL_AREA_OPTIONS}
              value={
                GEOGRAPHICAL_AREA_OPTIONS.find(
                  (option) => option.value === regionFilter
                ) ?? null
              }
            />
            <RegionSelect
              currentCapability="Linodes"
              disableClearable
              disabled={disabled}
              disabledRegions={disabledRegions}
              errorText={errorText}
              isGeckoLAEnabled={isGeckoLAEnabled}
              onChange={(e, region) => onChange(region)}
              regionFilter={regionFilter}
              regions={regions ?? []}
              value={value ?? null}
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </Paper>
  );
};
