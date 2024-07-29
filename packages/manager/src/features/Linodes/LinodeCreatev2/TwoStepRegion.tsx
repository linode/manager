import { useQueryClient } from '@tanstack/react-query';
import { useFlags } from 'launchdarkly-react-client-sdk';
import * as React from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { useIsDiskEncryptionFeatureEnabled } from 'src/components/DiskEncryption/utils';
import { Paper } from 'src/components/Paper';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { isDistributedRegionSupported } from 'src/components/RegionSelect/RegionSelect.utils';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { Typography } from 'src/components/Typography';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useImageQuery } from 'src/queries/images';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { sendLinodeCreateDocsEvent } from 'src/utilities/analytics/customEventAnalytics';

import { getDisabledRegions } from './Region.utils';
import {
  getGeneratedLinodeLabel,
  useLinodeCreateQueryParams,
} from './utilities';

import type { LinodeCreateFormValues } from './utilities';
import type { Region as RegionType } from '@linode/api-v4';
import type { RegionFilterValue } from 'src/components/RegionSelect/RegionSelect.types';

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

export const TwoStepRegion = () => {
  const {
    isDiskEncryptionFeatureEnabled,
  } = useIsDiskEncryptionFeatureEnabled();

  const flags = useFlags();
  const queryClient = useQueryClient();

  const { params } = useLinodeCreateQueryParams();

  const {
    control,
    formState: {
      dirtyFields: { label: isLabelFieldDirty },
    },
    getValues,
    setValue,
  } = useFormContext<LinodeCreateFormValues>();

  const { field, fieldState } = useController({
    control,
    name: 'region',
  });

  const [selectedImage] = useWatch({
    control,
    name: ['image'],
  });

  const { data: image } = useImageQuery(
    selectedImage ?? '',
    Boolean(selectedImage)
  );

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const [regionFilter, setRegionFilter] = React.useState<RegionFilterValue>(
    'distributed'
  );

  const { data: regions } = useRegionsQuery();

  const onChange = async (region: RegionType) => {
    const values = getValues();

    field.onChange(region.id);

    if (values.hasSignedEUAgreement) {
      // Reset the EU agreement checkbox if they checked it so they have to re-agree when they change regions
      setValue('hasSignedEUAgreement', false);
    }

    if (values.interfaces?.[0].vpc_id) {
      // If a VPC is selected, clear it because VPCs are region specific
      setValue('interfaces.0.vpc_id', null);
      setValue('interfaces.0.subnet_id', null);
    }

    if (values.interfaces?.[1].label) {
      // If a VLAN is selected, clear it because VLANs are region specific
      setValue('interfaces.1.label', null);
      setValue('interfaces.1.ipam_address', null);
    }

    if (
      values.metadata?.user_data &&
      !region.capabilities.includes('Metadata')
    ) {
      // Clear metadata only if the new region does not support it
      setValue('metadata.user_data', null);
    }

    if (values.placement_group?.id) {
      // If a placement group is selected, clear it because they are region specific
      setValue('placement_group.id', 0);
    }

    // Because distributed regions do not support some features,
    // we must disable those features here. Keep in mind, we should
    // prevent the user from enabling these features in their respective components.
    if (region.site_type === 'distributed') {
      setValue('backups_enabled', false);
      setValue('private_ip', false);
    }

    if (isDiskEncryptionFeatureEnabled) {
      // Enable disk encryption by default if the region supports it
      const defaultDiskEncryptionValue = region.capabilities.includes(
        'Disk Encryption'
      )
        ? 'enabled'
        : undefined;

      setValue('disk_encryption', defaultDiskEncryptionValue);
    }

    if (!isLabelFieldDirty) {
      // Auto-generate the Linode label because the region is included in the generated label
      const label = await getGeneratedLinodeLabel({
        queryClient,
        tab: params.type ?? 'OS',
        values: { ...values, region: region.id },
      });

      setValue('label', label);
    }
  };

  const hideDistributedRegions =
    !flags.gecko2?.enabled ||
    flags.gecko2?.ga ||
    !isDistributedRegionSupported(params.type ?? 'OS');

  const disabledRegions = getDisabledRegions({
    linodeCreateTab: params.type,
    regions: regions ?? [],
    selectedImage: image,
  });

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
              regionFilter={
                // We don't want the Image Service Gen2 work to abide by Gecko feature flags
                hideDistributedRegions && params.type !== 'Images'
                  ? 'core'
                  : undefined
              }
              currentCapability="Linodes"
              disableClearable
              disabled={isLinodeCreateRestricted}
              disabledRegions={disabledRegions}
              errorText={fieldState.error?.message}
              onChange={(e, region) => onChange(region)}
              regions={regions ?? []}
              showDistributedRegionIconHelperText={false}
              value={field.value}
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
              disabled={isLinodeCreateRestricted}
              disabledRegions={disabledRegions}
              errorText={fieldState.error?.message}
              onChange={(e, region) => onChange(region)}
              regionFilter={regionFilter}
              regions={regions ?? []}
              showDistributedRegionIconHelperText={false}
              value={field.value}
            />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </Paper>
  );
};
