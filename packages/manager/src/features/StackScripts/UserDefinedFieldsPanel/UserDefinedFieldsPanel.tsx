import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { Divider } from 'src/components/Divider';
import { Notice } from 'src/components/Notice/Notice';
import { RenderGuard } from 'src/components/RenderGuard';
import { ShowMoreExpansion } from 'src/components/ShowMoreExpansion';
import { Typography } from 'src/components/Typography';

import { AppInfo } from '../../Linodes/LinodesCreate/AppInfo';
import UserDefinedMultiSelect from './FieldTypes/UserDefinedMultiSelect';
import { UserDefinedSelect } from './FieldTypes/UserDefinedSelect';
import UserDefinedText from './FieldTypes/UserDefinedText';
import { StyledBox, StyledPaper } from './UserDefinedFieldsPanel.styles';

interface Props {
  appLogo?: JSX.Element;
  errors?: APIError[];
  handleChange: (key: string, value: any) => void;
  openDrawer?: (stackScriptLabel: string) => void;
  selectedLabel: string;
  selectedUsername: string;
  setNumberOfNodesForAppCluster?: (num: number) => void;
  udf_data: any;
  userDefinedFields?: UserDefinedField[];
}

const renderField = (
  udf_data: any,
  handleChange: Props['handleChange'],
  field: UserDefinedField,
  error?: string
) => {
  // if the 'default' key is returned from the API, the field is optional
  const isOptional = field.hasOwnProperty('default');

  if (isHeader(field)) {
    return (
      <Grid key={field.name} lg={5} style={{ marginTop: 24 }} xs={12}>
        <Divider />
        <Typography variant="h2">{field.label}</Typography>
      </Grid>
    );
  }

  if (isMultiSelect(field)) {
    return (
      <Grid key={field.name} lg={5} xs={12}>
        <UserDefinedMultiSelect
          error={error}
          field={field}
          isOptional={isOptional}
          key={field.name}
          updateFor={[field.label, udf_data[field.name], error]}
          updateFormState={handleChange}
          value={udf_data[field.name] || ''}
        />
      </Grid>
    );
  }
  if (isOneSelect(field)) {
    return (
      <Grid key={field.name} lg={5} xs={12}>
        <UserDefinedSelect
          error={error}
          field={field}
          isOptional={isOptional}
          key={field.name}
          updateFormState={handleChange}
          value={udf_data[field.name] || ''}
        />{' '}
      </Grid>
    );
  }
  if (isPasswordField(field.name)) {
    const isTokenPassword = field.name === 'token_password';
    return (
      <Grid key={field.name} lg={5} xs={12}>
        <UserDefinedText
          tooltip={
            isTokenPassword ? (
              <>
                {' '}
                To create an API token, go to{' '}
                <Link to="/profile/tokens">your profile.</Link>
              </>
            ) : undefined
          }
          error={error}
          field={field}
          isOptional={isOptional}
          isPassword={true}
          placeholder={isTokenPassword ? 'Enter your token' : field.example}
          tooltipInteractive={isTokenPassword}
          updateFor={[field.label, udf_data[field.name], error]}
          updateFormState={handleChange}
          /**
           * we are explicitly passing the value to solve for the situation
           * where you're switching between stackscripts or one-click-apps
           * and the same UDF with the same label appears in both stackscripts.
           *
           * The problem here is that unless we explicitly pass the value,
           * the form state will be reset but because MUI handles the
           * value internally, the pre-inputted value will still exist in the
           * textfield
           *
           * To test the incorrect behavior, try removing the "value" prop here,
           * navigate to the One-Click app creation flow, click on MERN, fill out
           * a DB password, then switch to LAMP. You'll see the value will
           * still be in the form field.
           *
           * This comment is wordy as heck but it's important that we never remove this
           * prop or that bug will return
           */
          value={udf_data[field.name] || ''}
        />
      </Grid>
    );
  }
  return (
    <Grid key={field.name} lg={5} xs={12}>
      <UserDefinedText
        error={error}
        field={field}
        isOptional={isOptional}
        placeholder={field.example}
        updateFor={[field.label, udf_data[field.name], error]}
        updateFormState={handleChange}
        /** see comment above for why we're passing the value prop */
        value={udf_data[field.name] || ''}
      />
    </Grid>
  );
};

const handleOpenDrawer = (
  openDrawer: Props['openDrawer'],
  selectedLabel: string
) => () => {
  openDrawer?.(selectedLabel);
};

const UserDefinedFieldsPanel = (props: Props) => {
  const {
    appLogo,
    errors,
    handleChange,
    openDrawer,
    selectedLabel,
    setNumberOfNodesForAppCluster,
    udf_data,
    userDefinedFields,
  } = props;

  const [requiredUDFs, optionalUDFs] = separateUDFsByRequiredStatus(
    userDefinedFields!
  );

  const isCluster = userDefinedFields?.some(
    (udf) => udf.name === 'cluster_size'
  );
  const numberOfNodes =
    udf_data['cluster_size'] !== undefined && udf_data['cluster_size'] !== null
      ? Number(udf_data['cluster_size'])
      : 0;

  React.useEffect(() => {
    if (setNumberOfNodesForAppCluster) {
      setNumberOfNodesForAppCluster(numberOfNodes);
    }
  }, [setNumberOfNodesForAppCluster, numberOfNodes]);

  const isDrawerOpenable = openDrawer !== undefined;

  return (
    <StyledPaper
      data-testid="user-defined-fields-panel"
      isDrawerOpenable={isDrawerOpenable}
    >
      <StyledBox>
        {appLogo}
        <Typography data-qa-user-defined-field-header variant="h2">
          <span>{`${selectedLabel} Setup`}</span>
        </Typography>
        {isDrawerOpenable ? (
          <AppInfo onClick={handleOpenDrawer(openDrawer, selectedLabel)} />
        ) : null}
      </StyledBox>

      {isCluster ? (
        <Box data-testid="create-cluster-notice" sx={{ paddingTop: '1rem' }}>
          <Notice variant="success">
            <strong>
              You are creating a cluster with {numberOfNodes} nodes.
            </strong>
          </Notice>
        </Box>
      ) : null}

      {/* Required Fields */}
      {requiredUDFs.map((field: UserDefinedField) => {
        const error = getError(field, errors);
        return renderField(udf_data, handleChange, field, error);
      })}
      {/* Optional Fields */}
      {optionalUDFs.length !== 0 && (
        <ShowMoreExpansion defaultExpanded={true} name="Advanced Options">
          <>
            <Typography
              sx={(theme) => ({ margin: `${theme.spacing(2)} 0px` })}
              variant="body1"
            >
              These fields are additional configuration options and are not
              required for creation.
            </Typography>
            <div>
              {optionalUDFs.map((field: UserDefinedField) => {
                const error = getError(field, errors);
                return renderField(udf_data, handleChange, field, error);
              })}
            </div>
          </>
        </ShowMoreExpansion>
      )}
    </StyledPaper>
  );
};

const getError = (field: UserDefinedField, errors?: APIError[]) => {
  if (!errors) {
    return;
  }
  const error = errors.find((thisError) => thisError.field === field.name);
  return error ? error.reason.replace('the UDF', '') : undefined;
};

const isPasswordField = (udfName: string) => {
  return udfName.toLowerCase().includes('password');
};

const isOneSelect = (udf: UserDefinedField) => {
  return !!udf.oneof; // if we have a oneof prop, it's a radio button
};

const isMultiSelect = (udf: UserDefinedField) => {
  return !!udf.manyof; // if we have a manyof prop, it's a checkbox
};

const isHeader = (udf: UserDefinedField) => {
  return udf.header?.toLowerCase() === 'yes';
};

/**
 * Used to separate required UDFs from non-required ones
 *
 * @return nested array [[...requiredUDFs], [...nonRequiredUDFs]]
 */
const separateUDFsByRequiredStatus = (udfs: UserDefinedField[] = []) => {
  return udfs.reduce(
    (accum, eachUDF) => {
      /**
       * if the "default" key exists, it's optional
       */
      if (
        eachUDF.hasOwnProperty('default') &&
        !eachUDF.hasOwnProperty('required')
      ) {
        return [[...accum[0]], [...accum[1], eachUDF]];
      } else {
        return [[...accum[0], eachUDF], [...accum[1]]];
      }
    },
    [[], []]
  );
};

export default RenderGuard(UserDefinedFieldsPanel);
