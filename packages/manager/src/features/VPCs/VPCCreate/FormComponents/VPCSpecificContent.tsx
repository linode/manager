import { Region } from '@linode/api-v4';
import { FormikErrors } from 'formik';
import * as React from 'react';

import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { Link } from 'src/components/Link';
import { TextField } from 'src/components/TextField';
import { CreateVPCFieldState } from 'src/hooks/useCreateVPC';

import { StyledBodyTypography } from './VPCCreateForm.styles';

interface Props {
  disabled?: boolean;
  errors: FormikErrors<CreateVPCFieldState>;
  isDrawer?: boolean;
  onChangeField: (field: string, value: string) => void;
  regions: Region[];
  values: CreateVPCFieldState;
}

export const VPCSpecificContent = (props: Props) => {
  const { disabled, errors, isDrawer, onChangeField, regions, values } = props;
  return (
    <>
      <StyledBodyTypography isDrawer={isDrawer} variant="body1">
        A virtual private cloud (VPC) is an isolated network which allows for
        control over how resources are networked and can communicate.
        <Link to="#"> Learn more</Link>.{/* @TODO VPC: learn more link here */}
      </StyledBodyTypography>
      <RegionSelect
        disabled={isDrawer ? true : disabled}
        errorText={errors.region}
        handleSelection={(region: string) => onChangeField('region', region)}
        isClearable
        regions={regions}
        selectedID={values.region}
      />
      <TextField
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChangeField('label', e.target.value)
        }
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
        multiline
        optional
        value={values.description}
      />
    </>
  );
};
