import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Link } from 'src/components/Link';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { TextField } from 'src/components/TextField';
import { sendLinodeCreateFormInputEvent } from 'src/utilities/analytics/formEventAnalytics';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import { VPC_CREATE_FORM_VPC_HELPER_TEXT } from '../../constants';
import { StyledBodyTypography } from './VPCCreateForm.styles';

import type { Region } from '@linode/api-v4';
import type { FormikErrors } from 'formik';
import type { LinodeCreateType } from 'src/features/Linodes/LinodesCreate/types';
import type { LinodeCreateQueryParams } from 'src/features/Linodes/types';
import type { CreateVPCFieldState } from 'src/hooks/useCreateVPC';

interface Props {
  disabled?: boolean;
  errors: FormikErrors<CreateVPCFieldState>;
  isDrawer?: boolean;
  onChangeField: (field: string, value: string) => void;
  regions: Region[];
  values: CreateVPCFieldState;
}

export const VPCTopSectionContent = (props: Props) => {
  const { disabled, errors, isDrawer, onChangeField, regions, values } = props;
  const location = useLocation();
  const isFromLinodeCreate = location.pathname.includes('/linodes/create');
  const queryParams = getQueryParamsFromQueryString<LinodeCreateQueryParams>(
    location.search
  );

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
      <RegionSelect
        aria-label="Choose a region"
        currentCapability="VPCs"
        disabled={isDrawer ? true : disabled}
        errorText={errors.region}
        onChange={(e, region) => onChangeField('region', region?.id ?? '')}
        regions={regions}
        value={values.region}
      />
      <TextField
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChangeField('label', e.target.value)
        }
        aria-label="Enter a label"
        disabled={disabled}
        errorText={errors.label}
        label="VPC Label"
        value={values.label}
      />
      <TextField
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChangeField('description', e.target.value)
        }
        disabled={disabled}
        errorText={errors.description}
        label="Description"
        maxRows={1}
        multiline
        optional
        value={values.description}
      />
    </>
  );
};
