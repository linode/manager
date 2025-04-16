import {
  useAttachVolumeMutation,
  useGrants,
  useVolumeQuery,
} from '@linode/queries';
import { ActionsPanel, Notice } from '@linode/ui';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { number, object } from 'yup';

import { useEventsPollingActions } from 'src/queries/events/events';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';

import { ConfigSelect } from './ConfigSelect';
import { VolumeSelect } from './VolumeSelect';

import type { Linode } from '@linode/api-v4';
import type { Grant } from '@linode/api-v4/lib/account';

interface Props {
  linode: Linode;
  onClose: () => void;
  readOnly?: boolean;
  setClientLibraryCopyVisible: (visible: boolean) => void;
}

/**
 * I had to provide a separate validation schema since the linode_id (which is required by API) is
 * provided as a prop and not a user input value.
 */
const AttachVolumeValidationSchema = object({
  config_id: number()
    .min(0, 'Config is required.')
    .required('Config is required.'),
  volume_id: number()
    .min(0, 'Volume is required.')
    .required('Volume is required.'),
});

const initialValues = { config_id: -1, volume_id: -1 };

export const LinodeVolumeAttachForm = (props: Props) => {
  const { linode, onClose, setClientLibraryCopyVisible } = props;

  const { data: grants } = useGrants();

  const { enqueueSnackbar } = useSnackbar();

  const { checkForNewEvents } = useEventsPollingActions();

  const linodeGrant = grants?.linode.find(
    (grant: Grant) => grant.id === linode.id
  );

  const isReadOnly = linodeGrant?.permissions === 'read_only';

  const { mutateAsync: attachVolume } = useAttachVolumeMutation();

  const {
    errors,
    handleBlur,
    handleSubmit,
    isSubmitting,
    resetForm,
    setFieldValue,
    status: error,
    touched,
    values,
  } = useFormik({
    initialValues,
    async onSubmit(values, { setErrors, setStatus, setSubmitting }) {
      try {
        await attachVolume({
          config_id: values.config_id,
          linode_id: linode.id,
          volumeId: values.volume_id,
        });
        onClose();
        checkForNewEvents();
        enqueueSnackbar(`Volume attachment started`, {
          variant: 'info',
        });
      } catch (error) {
        setSubmitting(false);
        handleFieldErrors(setErrors, error);
        handleGeneralErrors(
          setStatus,
          error,
          `Unable to attach this volume at this time. Please try again later.`
        );
      }
    },
    validationSchema: AttachVolumeValidationSchema,
  });

  const { data: volume } = useVolumeQuery(
    values.volume_id,
    values.volume_id !== -1
  );

  const linodeRequiresClientLibraryUpdate =
    volume?.encryption === 'enabled' &&
    Boolean(!linode.capabilities?.includes('Block Storage Encryption'));

  React.useEffect(() => {
    // When the volume is encrypted but the linode requires a client library update, we want to show the client library copy
    setClientLibraryCopyVisible(linodeRequiresClientLibraryUpdate);
  }, [volume]);

  return (
    <form onSubmit={handleSubmit}>
      {isReadOnly && (
        <Notice
          important
          text={
            "You don't have permissions to add a Volume for this Linode. Please contact an account administrator for details."
          }
          variant="error"
        />
      )}
      {error && <Notice text={error} variant="error" />}
      <VolumeSelect
        disabled={isReadOnly}
        error={touched.volume_id ? errors.volume_id : undefined}
        name="volume_id"
        onBlur={handleBlur}
        onChange={(v) => setFieldValue('volume_id', v)}
        region={linode.region}
        value={values.volume_id}
      />
      <ConfigSelect
        disabled={isReadOnly}
        error={touched.config_id ? errors.config_id : undefined}
        linodeId={linode.id}
        name="config_id"
        onBlur={handleBlur}
        onChange={(id) => setFieldValue('config_id', id)}
        value={values.config_id}
      />
      <ActionsPanel
        primaryButtonProps={{
          disabled: isReadOnly || linodeRequiresClientLibraryUpdate,
          label: 'Attach Volume',
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
