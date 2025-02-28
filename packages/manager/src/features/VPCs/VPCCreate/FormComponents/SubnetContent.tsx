import { Notice } from '@linode/ui';
import { getQueryParamsFromQueryString } from '@linode/utilities';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { useLocation } from 'react-router-dom';

import { Link } from 'src/components/Link';
import { sendLinodeCreateFormInputEvent } from 'src/utilities/analytics/formEventAnalytics';

import { VPC_CREATE_FORM_SUBNET_HELPER_TEXT } from '../../constants';
import { MultipleSubnetInput } from '../MultipleSubnetInput';
import {
  StyledBodyTypography,
  StyledHeaderTypography,
} from './VPCCreateForm.styles';

import type { CreateVPCPayload } from '@linode/api-v4';
import type { LinodeCreateType } from 'src/features/Linodes/LinodeCreate/types';
import type { LinodeCreateQueryParams } from 'src/features/Linodes/types';

interface Props {
  disabled?: boolean;
  isDrawer?: boolean;
}

export const SubnetContent = (props: Props) => {
  const { disabled, isDrawer } = props;

  const location = useLocation();
  const isFromLinodeCreate = location.pathname.includes('/linodes/create');
  const queryParams = getQueryParamsFromQueryString<LinodeCreateQueryParams>(
    location.search
  );

  const {
    formState: { errors },
  } = useFormContext<CreateVPCPayload>();

  return (
    <>
      <StyledHeaderTypography isDrawer={isDrawer} variant="h2">
        Subnets
      </StyledHeaderTypography>
      <StyledBodyTypography isDrawer={isDrawer} variant="body1">
        {VPC_CREATE_FORM_SUBNET_HELPER_TEXT}{' '}
        <Link
          onClick={() =>
            isFromLinodeCreate &&
            sendLinodeCreateFormInputEvent({
              createType: (queryParams.type as LinodeCreateType) ?? 'OS',
              headerName: 'Create VPC',
              interaction: 'click',
              label: 'Learn more',
              subheaderName: 'Subnets',
            })
          }
          to="https://techdocs.akamai.com/cloud-computing/docs/manage-vpc-subnets"
        >
          Learn more
        </Link>
        .
      </StyledBodyTypography>
      {errors.root?.subnetLabel && (
        <Notice
          spacingBottom={8}
          text={errors.root.subnetLabel.message}
          variant="error"
        />
      )}
      {errors.root?.subnetIPv4 && (
        <Notice
          spacingBottom={8}
          text={errors.root.subnetIPv4.message}
          variant="error"
        />
      )}
      <MultipleSubnetInput disabled={disabled} isDrawer={isDrawer} />
    </>
  );
};
