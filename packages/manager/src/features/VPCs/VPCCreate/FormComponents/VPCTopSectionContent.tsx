import { Region } from '@linode/api-v4';
import { FormikErrors } from 'formik';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { TextField } from 'src/components/TextField';
import { CreateVPCFieldState } from 'src/hooks/useCreateVPC';

import { VPC_CREATE_FORM_VPC_HELPER_TEXT } from '../../constants';
import { StyledBodyTypography } from './VPCCreateForm.styles';

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
  return (
    <>
      <StyledBodyTypography isDrawer={isDrawer} variant="body1">
        {VPC_CREATE_FORM_VPC_HELPER_TEXT}{' '}
        <Link to="https://www.linode.com/docs/products/networking/vpc/">
          Learn more
        </Link>
        .
      </StyledBodyTypography>
      <RegionSelect
        aria-label="Choose a region"
        currentCapability="VPCs"
        disabled={isDrawer ? true : disabled}
        errorText={errors.region}
        handleSelection={(region: string) => onChangeField('region', region)}
        isClearable
        regions={regions}
        selectedId={values.region}
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
