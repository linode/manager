import { CreateNameSpacePayload } from '@linode/api-v4/lib/cloudview/types';
import { createCloudViewNamespaceSchema } from '@linode/validation';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { TextField } from 'src/components/TextField';
import { useCreateCloudViewNamespace } from 'src/queries/cloudview/namespaces';
import { useRegionsQuery } from 'src/queries/regions';
import { getErrorMap } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

export interface CreateNamespaceDrawerProps {
  onClose: () => void;
  open: boolean;
}

export interface dataTypeOptions {
  id: null | string;
  label: null | string;
}

const initialValues: CreateNameSpacePayload = {
  label: '',
  region: '',
  type: 'metric',
};

export const CreateNamespaceDrawer = React.memo(
  (props: CreateNamespaceDrawerProps) => {
    const { onClose, open } = props;
    const { mutateAsync } = useCreateCloudViewNamespace();

    const { enqueueSnackbar } = useSnackbar();
    const { data: regions } = useRegionsQuery();
    const optionsMap = new Map<string | undefined, string>();
    optionsMap.set('Metrics', 'metric');
    const options = [{ label: 'Metrics' }];

    const {
      errors,
      handleBlur,
      handleChange,
      handleSubmit,
      isSubmitting,
      resetForm,
      setFieldValue,
      status,
      values,
    } = useFormik({
      initialValues,
      onSubmit(
        values: CreateNameSpacePayload,
        { setErrors, setStatus, setSubmitting }
      ) {
        // Clear drawer error state
        setStatus(undefined);
        setErrors({});
        const payload = { ...values };

        mutateAsync(payload)
          .then(() => {
            setSubmitting(false);
            enqueueSnackbar(`Namespace ${payload.label} successfully created`, {
              variant: 'success',
            });
            onClose();
          })
          .catch((err) => {
            const mapErrorToStatus = () =>
              setStatus({ generalError: getErrorMap([], err).none });

            setSubmitting(false);
            handleFieldErrors(setErrors, err);
            handleGeneralErrors(
              mapErrorToStatus,
              err,
              'Error creating Namespace.'
            );
          });
      },
      validateOnBlur: false,
      validateOnChange: false,
      validationSchema: createCloudViewNamespaceSchema,
    });
    React.useEffect(() => {
      if (open) {
        resetForm();
      }
    }, [open, resetForm]);

    const generalError = status?.generalError;

    return (
      <Drawer onClose={onClose} open={open} title="Create Namespace">
        <form onSubmit={handleSubmit}>
          {generalError && (
            <Notice
              data-qa-error
              key={status}
              text={status?.generalError ?? 'An unexpected error occurred'}
              variant="error"
            />
          )}
          <TextField
            inputProps={{
              autoFocus: true,
            }}
            aria-label="Label for your new Namespace"
            errorText={errors.label}
            label="Label"
            name="label"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.label}
          />
          <Autocomplete
            isOptionEqualToValue={(option, value) =>
              option.label === value.label
            }
            onChange={(event, value) => {
              setFieldValue('type', optionsMap.get(value?.label));
            }}
            defaultValue={options[0]}
            disabled={true}
            label={'Data Type'}
            options={options}
            placeholder="Select a Data type"
          />
          <RegionSelect
            handleSelection={(value) => {
              setFieldValue('region', value);
            }}
            regions={
              regions ? regions.filter((region) => region.id === 'us-iad') : []
            }
            currentCapability={undefined}
            errorText={errors.region}
            isClearable
            label="Deployment Region"
            onBlur={handleBlur}
            selectedId={values.region}
          />
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              label: 'Create',
              loading: isSubmitting,
              type: 'submit',
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: onClose,
            }}
          />
        </form>
      </Drawer>
    );
  }
);
