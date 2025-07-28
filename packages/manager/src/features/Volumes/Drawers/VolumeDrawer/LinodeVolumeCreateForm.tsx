import {
  useCreateVolumeMutation,
  useRegionsQuery,
  useVolumeTypesQuery,
} from '@linode/queries';
import { ActionsPanel, Box, Notice, TextField, Typography } from '@linode/ui';
import { doesRegionSupportFeature } from '@linode/utilities';
import { maybeCastToNumber } from '@linode/utilities';
import { CreateVolumeSchema } from '@linode/validation/lib/volumes.schema';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import {
  BLOCK_STORAGE_ENCRYPTION_GENERAL_DESCRIPTION,
  BLOCK_STORAGE_ENCRYPTION_OVERHEAD_CAVEAT,
  BLOCK_STORAGE_ENCRYPTION_UNAVAILABLE_IN_LINODE_REGION_COPY,
  BLOCK_STORAGE_USER_SIDE_ENCRYPTION_CAVEAT,
} from 'src/components/Encryption/constants';
import { Encryption } from 'src/components/Encryption/Encryption';
import { useIsBlockStorageEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { TagsInput } from 'src/components/TagsInput/TagsInput';
import { MAX_VOLUME_SIZE } from 'src/constants';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useEventsPollingActions } from 'src/queries/events/events';
import { sendCreateVolumeEvent } from 'src/utilities/analytics/customEventAnalytics';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';

import { ConfigSelect } from './ConfigSelect';
import { PricePanel } from './PricePanel';
import { SizeField } from './SizeField';

import type {
  APIError,
  Linode,
  Volume,
  VolumeEncryption,
} from '@linode/api-v4';

interface Props {
  linode: Linode;
  linodeSupportsBlockStorageEncryption: boolean | undefined;
  onClose: () => void;
  openDetails: (volume: Volume) => void;
  setClientLibraryCopyVisible: (visible: boolean) => void;
}

interface FormState {
  config_id: number;
  encryption: undefined | VolumeEncryption;
  label: string;
  linode_id: number;
  region: string;
  size: number;
  tags: string[];
}

const initialValues: FormState = {
  config_id: -1,
  encryption: 'disabled',
  label: '',
  linode_id: -1,
  region: 'none',
  size: 20,
  tags: [],
};

export const LinodeVolumeCreateForm = (props: Props) => {
  const {
    linode,
    linodeSupportsBlockStorageEncryption,
    onClose,
    openDetails,
    setClientLibraryCopyVisible,
  } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: createVolume } = useCreateVolumeMutation();
  const { data: types, isError, isLoading } = useVolumeTypesQuery();

  const { checkForNewEvents } = useEventsPollingActions();

  const isVolumesGrantReadOnly = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_volumes',
  });

  const { isBlockStorageEncryptionFeatureEnabled } =
    useIsBlockStorageEncryptionFeatureEnabled();

  const { data: regions } = useRegionsQuery();

  const regionSupportsBlockStorageEncryption = doesRegionSupportFeature(
    linode.region,
    regions ?? [],
    'Block Storage Encryption'
  );

  if (
    isBlockStorageEncryptionFeatureEnabled &&
    regionSupportsBlockStorageEncryption
  ) {
    initialValues.encryption = 'enabled';
    setClientLibraryCopyVisible(true);
  }

  const toggleVolumeEncryptionEnabled = (
    encryption: undefined | VolumeEncryption
  ) => {
    if (encryption === 'enabled') {
      setFieldValue('encryption', 'disabled');
      setClientLibraryCopyVisible(false);
    } else {
      setFieldValue('encryption', 'enabled');
      setClientLibraryCopyVisible(true);
    }
  };

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
      const { config_id, encryption, label, size, tags } = values;

      /** Status holds our a general error message */
      setStatus(undefined);

      // If the BSE feature is not enabled or the selected region does not support BSE, set `encryption` in the payload to undefined.
      // Otherwise, set it to `enabled` if the checkbox is checked, or `disabled` if it is not
      const blockStorageEncryptionPayloadValue =
        !isBlockStorageEncryptionFeatureEnabled ||
        !regionSupportsBlockStorageEncryption
          ? undefined
          : encryption;

      try {
        const volume = await createVolume({
          config_id:
            // If the config_id still set to default value of -1, set this to undefined, so volume gets created on back-end according to the API logic
            config_id === -1 ? undefined : maybeCastToNumber(config_id),
          encryption: blockStorageEncryptionPayloadValue,
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
        data-qa-volume-attach-help
        style={{ marginTop: 24 }}
        sx={(theme) => ({
          marginBottom: theme.spacing(1.25),
        })}
        variant="body1"
      >
        {`This volume will be immediately scheduled for attachment to ${linode.label} and available to other Linodes in the ${linode.region} data-center.`}
      </Typography>
      <Typography
        data-qa-volume-size-help
        sx={(theme) => ({
          marginBottom: theme.spacing(1.25),
        })}
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
        disabled={isVolumesGrantReadOnly}
        label="Tags"
        name="tags"
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
                  errors.tags as unknown as APIError[],
                  'Unable to tag volume.'
                )
              : undefined
            : undefined
        }
        value={values.tags.map((tag) => ({ label: tag, value: tag }))}
      />
      {isBlockStorageEncryptionFeatureEnabled && (
        <Box paddingTop={2}>
          <Encryption
            descriptionCopy={BLOCK_STORAGE_ENCRYPTION_GENERAL_DESCRIPTION}
            disabled={!regionSupportsBlockStorageEncryption}
            disabledReason={
              BLOCK_STORAGE_ENCRYPTION_UNAVAILABLE_IN_LINODE_REGION_COPY
            }
            entityType="Volume"
            isEncryptEntityChecked={values.encryption === 'enabled'}
            notices={
              values.encryption === 'enabled'
                ? [
                    BLOCK_STORAGE_ENCRYPTION_OVERHEAD_CAVEAT,
                    BLOCK_STORAGE_USER_SIDE_ENCRYPTION_CAVEAT,
                  ]
                : []
            }
            onChange={() => toggleVolumeEncryptionEnabled(values.encryption)}
            sx={{ paddingLeft: '0px' }}
          />
        </Box>
      )}
      <PricePanel
        currentSize={10}
        regionId={linode.region}
        value={values.size}
      />
      <ActionsPanel
        primaryButtonProps={{
          disabled:
            isVolumesGrantReadOnly ||
            isInvalidPrice ||
            (!linodeSupportsBlockStorageEncryption &&
              values.encryption === 'enabled'),
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
