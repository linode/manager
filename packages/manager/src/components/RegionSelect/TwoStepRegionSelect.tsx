import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { SelectRegionPanelProps } from 'src/components/SelectRegionPanel/SelectRegionPanel';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { sendLinodeCreateDocsEvent } from 'src/utilities/analytics';

interface TwoStepRegionSelectProps
  extends Omit<SelectRegionPanelProps, 'selectedId'> {
  regions: any;
  selectedId?: null | string;
}

const GEOGRAPHICAL_AREA_OPTIONS = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'North America',
    value: 'NA',
  },
  {
    label: 'Africa',
    value: 'AF',
  },
  {
    label: 'Asia',
    value: 'AS',
  },
  {
    label: 'Europe',
    value: 'EU',
  },
  {
    label: 'Oceania',
    value: 'OC',
  },
  {
    label: 'South America',
    value: 'SA',
  },
];

export const TwoStepRegionSelect = React.memo(
  (props: TwoStepRegionSelectProps) => {
    const {
      RegionSelectProps,
      currentCapability,
      disabled,
      error,
      handleSelection,
      helperText,
      regions,
      selectedId,
    } = props;

    const [regionFilter, setRegionFilter] = React.useState<string>('edge');

    return (
      <Tabs>
        <TabList>
          <Tab>Core</Tab>
          <Tab>Edge</Tab>
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
              disabled={disabled}
              errorText={error}
              handleSelection={handleSelection}
              helperText={helperText}
              regionFilter="core"
              regions={regions ?? []}
              selectedId={selectedId || null}
              showEdgeIconHelperText={false}
              {...RegionSelectProps}
            />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <Autocomplete
              onChange={(_, selectedOption) => {
                if (selectedOption?.value) {
                  setRegionFilter(`edge-${selectedOption?.value}`);
                }
              }}
              defaultValue={GEOGRAPHICAL_AREA_OPTIONS[0]}
              label="Geographical Area"
              options={GEOGRAPHICAL_AREA_OPTIONS}
            />
            <RegionSelect
              currentCapability={currentCapability}
              disabled={disabled}
              errorText={error}
              handleSelection={handleSelection}
              helperText={helperText}
              regionFilter={regionFilter}
              regions={regions ?? []}
              selectedId={selectedId || null}
              showEdgeIconHelperText={false}
              {...RegionSelectProps}
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    );
  }
);
