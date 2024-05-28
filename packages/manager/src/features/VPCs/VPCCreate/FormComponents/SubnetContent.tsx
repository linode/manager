import { APIError } from '@linode/api-v4';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { sendLinodeCreateFormStepEvent } from 'src/utilities/analytics/formEventAnalytics';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';
import { SubnetFieldState } from 'src/utilities/subnets';

import { VPC_CREATE_FORM_SUBNET_HELPER_TEXT } from '../../constants';
import { MultipleSubnetInput } from '../MultipleSubnetInput';
import {
  StyledBodyTypography,
  StyledHeaderTypography,
} from './VPCCreateForm.styles';

import type { LinodeCreateType } from 'src/features/Linodes/LinodesCreate/types';

interface Props {
  disabled?: boolean;
  isDrawer?: boolean;
  onChangeField: (field: string, value: SubnetFieldState[]) => void;
  subnetErrors?: APIError[];
  subnets: SubnetFieldState[];
}

export const SubnetContent = (props: Props) => {
  const { disabled, isDrawer, onChangeField, subnetErrors, subnets } = props;

  const location = useLocation();
  const isFromLinodeCreate = location.pathname.includes('/linodes/create');
  const queryParams = getQueryParamsFromQueryString(location.search);

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
            sendLinodeCreateFormStepEvent({
              action: 'click',
              category: 'link',
              createType:
                (queryParams.type as LinodeCreateType) ?? 'Distributions',
              formStepName: 'VPC Subnets',
              label: 'Learn more',
              version: 'v1',
            })
          }
          to="https://www.linode.com/docs/products/networking/vpc/guides/subnets/"
        >
          Learn more
        </Link>
        .
      </StyledBodyTypography>
      {subnetErrors
        ? subnetErrors.map((apiError: APIError) => (
            <Notice
              key={apiError.reason}
              spacingBottom={8}
              text={apiError.reason}
              variant="error"
            />
          ))
        : null}
      <MultipleSubnetInput
        disabled={disabled}
        isDrawer={isDrawer}
        onChange={(subnets) => onChangeField('subnets', subnets)}
        subnets={subnets}
      />
    </>
  );
};
