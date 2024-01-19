import { APIError } from '@linode/api-v4';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { SubnetFieldState } from 'src/utilities/subnets';

import { VPC_CREATE_FORM_SUBNET_HELPER_TEXT } from '../../constants';
import { MultipleSubnetInput } from '../MultipleSubnetInput';
import {
  StyledBodyTypography,
  StyledHeaderTypography,
} from './VPCCreateForm.styles';

interface Props {
  disabled?: boolean;
  isDrawer?: boolean;
  onChangeField: (field: string, value: SubnetFieldState[]) => void;
  subnetErrors?: APIError[];
  subnets: SubnetFieldState[];
}

export const SubnetContent = (props: Props) => {
  const { disabled, isDrawer, onChangeField, subnetErrors, subnets } = props;

  return (
    <>
      <StyledHeaderTypography isDrawer={isDrawer} variant="h2">
        Subnets
      </StyledHeaderTypography>
      <StyledBodyTypography isDrawer={isDrawer} variant="body1">
        {VPC_CREATE_FORM_SUBNET_HELPER_TEXT}{' '}
        <Link to="https://www.linode.com/docs/products/networking/vpc/guides/subnets/">
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
