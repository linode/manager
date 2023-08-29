import { APIError, Linode, Volume } from '@linode/api-v4';
import { CreateVolumeSchema } from '@linode/validation/lib/volumes.schema';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Notice } from 'src/components/Notice/Notice';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { MAX_VOLUME_SIZE } from 'src/constants';
import { resetEventsPolling } from 'src/eventsPolling';
import { useGrants, useProfile } from 'src/queries/profile';
import { useCreateVolumeMutation } from 'src/queries/volumes';
import { sendCreateVolumeEvent } from 'src/utilities/analytics';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { maybeCastToNumber } from 'src/utilities/maybeCastToNumber';

import { ConfigSelect } from './ConfigSelect';
import { PricePanel } from './PricePanel';
import { SizeField } from './SizeField';

interface Props {
  linode: Linode;
  onClose: () => void;
  openDetails: (volume: Volume) => void;
}

interface FormState {
  config_id: number;
  label: string;
  linode_id: number;
  region: string;
  size: number;
  tags: string[];
}

const initialValues: FormState = {
  config_id: -1,
  label: '',
  linode_id: -1,
  region: 'none',
  size: 20,
  tags: [],
};

export const LinodeVolumeCreateForm = (props: Props) => {
  const { linode, onClose, openDetails } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { mutateAsync: createVolume } = useCreateVolumeMutation();

  const disabled = profile?.restricted && !grants?.global.add_volumes;

  const {
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    resetForm,
    setFieldValue,
    status: error,
    touched,
    values,
  } = useFormik({
    initialValues,
    onSubmit: (values, { setErrors, setStatus, setSubmitting }) => {
      const { config_id, label, size, tags } = values;

      setSubmitting(true);

      /** Status holds our success and generalError messages. */
      setStatus(undefined);

      createVolume({
        config_id:
          // If the config_id still set to default value of -1, set this to undefined, so volume gets created on back-end according to the API logic
          config_id === -1 ? undefined : maybeCastToNumber(config_id),
        label,
        linode_id: maybeCastToNumber(linode.id),
        size: maybeCastToNumber(size),
        tags,
      })
        .then((volume) => {
          resetEventsPolling();
          enqueueSnackbar(`Volume scheduled for creation.`, {
            variant: 'success',
          });
          onClose();
          openDetails(volume);
          // Analytics Event
          sendCreateVolumeEvent(`Size: ${size}GB`, origin);
        })
        .catch((errorResponse) => {
          setSubmitting(false);
          handleFieldErrors(setErrors, errorResponse);
          handleGeneralErrors(
            setStatus,
            errorResponse,
            `Unable to create a volume at this time. Please try again later.`
          );
        });
    },
    validationSchema: CreateVolumeSchema,
  });

  return (
    <form onSubmit={handleSubmit}>
      {error && <Notice text={error} variant="error" />}
      {disabled && (
        <Notice
          text={
            "You don't have permissions to create a new Volume. Please contact an account administrator for details."
          }
          important
        />
      )}
      <Typography
        sx={(theme) => ({
          marginBottom: theme.spacing(1.25),
        })}
        data-qa-volume-attach-help
        style={{ marginTop: 24 }}
        variant="body1"
      >
        {`This volume will be immediately scheduled for attachment to ${linode.label} and available to other Linodes in the ${linode.region} data-center.`}
      </Typography>
      <Typography
        sx={(theme) => ({
          marginBottom: theme.spacing(1.25),
        })}
        data-qa-volume-size-help
        variant="body1"
      >
        A single Volume can range from 10 to {MAX_VOLUME_SIZE} gigabytes in size
        and costs $0.10/GB per month. Up to eight volumes can be attached to a
        single Linode.
      </Typography>
      <TextField
        data-qa-volume-label
        disabled={disabled}
        errorText={touched.label ? errors.label : undefined}
        label="Label"
        name="label"
        onBlur={handleBlur}
        onChange={handleChange}
        required
        value={values.label}
      />
      <SizeField
        disabled={disabled}
        error={touched.size ? errors.size : undefined}
        isFromLinode
        name="size"
        onBlur={handleBlur}
        onChange={handleChange}
        regionId={linode.region}
        value={values.size}
      />
      <ConfigSelect
        disabled={disabled}
        error={touched.config_id ? errors.config_id : undefined}
        linodeId={linode.id}
        name="configId"
        onBlur={handleBlur}
        onChange={(id: number) => setFieldValue('config_id', id)}
        value={values.config_id}
      />
      <TagsInput
        onChange={(items) =>
          setFieldValue(
            'tags',
            items.map((t) => t.value)
          )
        }
        tagError={
          touched.tags
            ? errors.tags
              ? getErrorStringOrDefault(
                  (errors.tags as unknown) as APIError[],
                  'Unable to tag volume.'
                )
              : undefined
            : undefined
        }
        disabled={disabled}
        label="Tags"
        name="tags"
        value={values.tags.map((tag) => ({ label: tag, value: tag }))}
      />
      <PricePanel
        currentSize={10}
        regionId={linode.region}
        value={values.size}
      />
      <ActionsPanel
        primaryButtonProps={{
          disabled,
          label: 'Create Volume',
          loading: isSubmitting,
          type: 'submit',
        }}
        secondaryButtonProps={{
          label: 'Cancel',
          onClick: () => {
            resetForm();
            onClose();
          },
        }}
      />
    </form>
  );
};
