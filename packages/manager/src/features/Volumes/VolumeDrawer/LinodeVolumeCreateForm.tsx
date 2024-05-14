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
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useEventsPollingActions } from 'src/queries/events/events';
import {
  useCreateVolumeMutation,
  useVolumeTypesQuery,
} from 'src/queries/volumes/volumes';
import { sendCreateVolumeEvent } from 'src/utilities/analytics/customEventAnalytics';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { maybeCastToNumber } from 'src/utilities/maybeCastToNumber';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';

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

  const { mutateAsync: createVolume } = useCreateVolumeMutation();
  const { data: types, isError, isLoading } = useVolumeTypesQuery();

  const { checkForNewEvents } = useEventsPollingActions();

  const isVolumesGrantReadOnly = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_volumes',
  });

  const isInvalidPrice = !types || isError;

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
    async onSubmit(values, { setErrors, setStatus }) {
      const { config_id, label, size, tags } = values;

      /** Status holds our a general error message */
      setStatus(undefined);

      try {
        const volume = await createVolume({
          config_id:
            // If the config_id still set to default value of -1, set this to undefined, so volume gets created on back-end according to the API logic
            config_id === -1 ? undefined : maybeCastToNumber(config_id),
          label,
          linode_id: maybeCastToNumber(linode.id),
          size: maybeCastToNumber(size),
          tags,
        });
        checkForNewEvents();
        enqueueSnackbar(`Volume scheduled for creation.`, {
          variant: 'success',
        });
        onClose();
        openDetails(volume);
        // Analytics Event
        sendCreateVolumeEvent(`Size: ${size}GB`, origin);
      } catch (error) {
        handleFieldErrors(setErrors, error);
        handleGeneralErrors(
          setStatus,
          error,
          `Unable to create a volume at this time. Please try again later.`
        );
      }
    },
    validationSchema: CreateVolumeSchema,
  });

  return (
    <form onSubmit={handleSubmit}>
      {isVolumesGrantReadOnly && (
        <Notice
          text={
            "You don't have permissions to create a new Volume. Please contact an account administrator for details."
          }
          variant="error"
        />
      )}
      {error && <Notice text={error} variant="error" />}
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
        <span>
          A single Volume can range from 10 to {MAX_VOLUME_SIZE} GB in size. Up
          to eight Volumes can be attached to a single Linode.
        </span>
      </Typography>
      <TextField
        data-qa-volume-label
        disabled={isVolumesGrantReadOnly}
        errorText={touched.label ? errors.label : undefined}
        label="Label"
        name="label"
        onBlur={handleBlur}
        onChange={handleChange}
        required
        value={values.label}
      />
      <SizeField
        disabled={isVolumesGrantReadOnly}
        error={touched.size ? errors.size : undefined}
        isFromLinode
        name="size"
        onBlur={handleBlur}
        onChange={handleChange}
        regionId={linode.region}
        value={values.size}
      />
      <ConfigSelect
        disabled={isVolumesGrantReadOnly}
        error={touched.config_id ? errors.config_id : undefined}
        key={linode.id}
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
        disabled={isVolumesGrantReadOnly}
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
          disabled: isVolumesGrantReadOnly || isInvalidPrice,
          label: 'Create Volume',
          loading: isSubmitting,
          tooltipText:
            !isLoading && isInvalidPrice ? PRICES_RELOAD_ERROR_NOTICE_TEXT : '',
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
