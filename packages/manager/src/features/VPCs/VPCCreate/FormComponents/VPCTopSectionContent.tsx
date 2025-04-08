import { useIsGeckoEnabled } from '@linode/shared';
import { TextField } from '@linode/ui';
import { getQueryParamsFromQueryString } from '@linode/utilities';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useLocation } from 'react-router-dom';

import { Link } from 'src/components/Link';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useFlags } from 'src/hooks/useFlags';
import { sendLinodeCreateFormInputEvent } from 'src/utilities/analytics/formEventAnalytics';

import { VPC_CREATE_FORM_VPC_HELPER_TEXT } from '../../constants';
import { StyledBodyTypography } from './VPCCreateForm.styles';

import type { Region } from '@linode/api-v4';
import type { CreateVPCPayload } from '@linode/api-v4';
import type { LinodeCreateType } from '@linode/utilities';
import type { LinodeCreateQueryParams } from 'src/features/Linodes/types';

interface Props {
  disabled?: boolean;
  isDrawer?: boolean;
  regions: Region[];
}

export const VPCTopSectionContent = (props: Props) => {
  const { disabled, isDrawer, regions } = props;
  const location = useLocation();
  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );
  const isFromLinodeCreate = location.pathname.includes('/linodes/create');
  const queryParams = getQueryParamsFromQueryString<LinodeCreateQueryParams>(
    location.search
  );

  const { control } = useFormContext<CreateVPCPayload>();

  return (
    <>
      <StyledBodyTypography isDrawer={isDrawer} variant="body1">
        {VPC_CREATE_FORM_VPC_HELPER_TEXT}{' '}
        <Link
          onClick={() =>
            isFromLinodeCreate &&
            sendLinodeCreateFormInputEvent({
              createType: (queryParams.type as LinodeCreateType) ?? 'OS',
              headerName: 'Create VPC',
              interaction: 'click',
              label: 'Learn more',
            })
          }
          to="https://techdocs.akamai.com/cloud-computing/docs/vpc"
        >
          Learn more
        </Link>
        .
      </StyledBodyTypography>
      <Controller
        render={({ field, fieldState }) => (
          <RegionSelect
            aria-label="Choose a region"
            currentCapability="VPCs"
            disabled={isDrawer ? true : disabled}
            errorText={fieldState.error?.message}
            isGeckoLAEnabled={isGeckoLAEnabled}
            onBlur={field.onBlur}
            onChange={(_, region) => field.onChange(region?.id ?? '')}
            regions={regions}
            value={field.value}
          />
        )}
        control={control}
        name="region"
      />
      <Controller
        render={({ field, fieldState }) => (
          <TextField
            aria-label="Enter a label"
            disabled={disabled}
            errorText={fieldState.error?.message}
            label="VPC Label"
            onBlur={field.onBlur}
            onChange={field.onChange}
            value={field.value}
          />
        )}
        control={control}
        name="label"
      />
      <Controller
        render={({ field, fieldState }) => (
          <TextField
            disabled={disabled}
            errorText={fieldState.error?.message}
            label="Description"
            maxRows={1}
            multiline
            onBlur={field.onBlur}
            onChange={field.onChange}
            optional
            value={field.value}
          />
        )}
        control={control}
        name="description"
      />
    </>
  );
};
