import { APIError } from '@linode/api-v4';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { SubnetFieldState } from 'src/utilities/subnets';

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
        A subnet divides a VPC into multiple logically defined networks to allow
        for controlled access to VPC resources. Subnets within a VPC are
        routable regardless of the address spaces they are in.
        <Link to="#"> Learn more</Link>.
        {/* @TODO VPC: subnet learn more link here */}
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
