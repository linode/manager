import {
  ActionsPanel,
  Box,
  Checkbox,
  FormHelperText,
  Notice,
} from '@linode/ui';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { number, object } from 'yup';

import { Drawer } from 'src/components/Drawer';
import { BLOCK_STORAGE_ENCRYPTION_SETTING_IMMUTABLE_COPY } from 'src/components/Encryption/constants';
import { useIsBlockStorageEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';
import { useEventsPollingActions } from 'src/queries/events/events';
import { useGrants } from '@linode/queries';
import { useAttachVolumeMutation } from 'src/queries/volumes/volumes';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

import { ConfigSelect } from './VolumeDrawer/ConfigSelect';

import type { Volume } from '@linode/api-v4';

interface Props {
  isFetching?: boolean;
  onClose: () => void;
  open: boolean;
  volume: Volume | undefined;
}

const AttachVolumeValidationSchema = object({
  config_id: number()
    .min(0, 'Config is required.')
    .required('Config is required.'),
  linode_id: number()
    .min(0, 'Linode is required.')
    .required('Linode is required.'),
});

export const AttachVolumeDrawer = React.memo((props: Props) => {
  const { isFetching, open, volume } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { checkForNewEvents } = useEventsPollingActions();

  const { data: grants } = useGrants();

  const { error, mutateAsync: attachVolume } = useAttachVolumeMutation();

  const {
    isBlockStorageEncryptionFeatureEnabled,
  } = useIsBlockStorageEncryptionFeatureEnabled();

  const formik = useFormik({
    initialValues: { config_id: -1, linode_id: -1 },
    async onSubmit(values) {
      await attachVolume({
        volumeId: volume?.id ?? -1,
        ...values,
      }).then(() => {
        checkForNewEvents();
        handleClose();
        enqueueSnackbar(`Volume attachment started`, {
          variant: 'info',
        });
      });
    },
    validateOnBlur: false,
    validateOnChange: true,
    validationSchema: AttachVolumeValidationSchema,
  });

  const reset = () => {
    formik.resetForm();
  };

  const handleClose = () => {
    reset();
    props.onClose();
  };

  const errorResources = {
    linode_id: 'Linode',
    overwrite: 'Overwrite',
  };

  const isReadOnly =
    grants !== undefined &&
    grants.volume.find((grant) => grant.id === volume?.id)?.permissions ===
      'read_only';

  const hasErrorFor = getAPIErrorFor(
    errorResources,
    error === null ? undefined : error
  );
  const linodeError = hasErrorFor('linode_id');
  const configError = hasErrorFor('config_id');
  const generalError = hasErrorFor('none');

  return (
    <Drawer
      isFetching={isFetching}
      onClose={handleClose}
      open={open}
      title={`Attach Volume ${volume?.label}`}
    >
      <form onSubmit={formik.handleSubmit}>
        {isReadOnly && (
          <Notice
            text="You don't have permission to attach this volume."
            variant="error"
          />
        )}
        {generalError && <Notice text={generalError} variant="error" />}
        <LinodeSelect
          errorText={
            formik.touched.linode_id && formik.errors.linode_id
              ? formik.errors.linode_id
              : linodeError
          }
          onSelectionChange={(linode) => {
            if (linode !== null) {
              formik.setFieldValue('linode_id', linode.id);
            }
          }}
          clearable={false}
          disabled={isReadOnly}
          filter={{ region: volume?.region }}
          noMarginTop
          value={formik.values.linode_id}
        />
        {!linodeError && (
          <FormHelperText>
            Only Linodes in this Volume&rsquo;s region are displayed.
          </FormHelperText>
        )}
        <StyledConfigSelect
          error={
            formik.touched.config_id && formik.errors.config_id
              ? formik.errors.config_id
              : configError
          }
          linodeId={
            formik.values.linode_id === -1 ? null : formik.values.linode_id
          }
          onChange={(id: number) => {
            formik.setFieldValue('config_id', +id);
          }}
          disabled={isReadOnly || formik.values.linode_id === -1}
          name="configId"
          onBlur={() => null}
          value={formik.values.config_id}
        />
        {isBlockStorageEncryptionFeatureEnabled && (
          <Box
            sx={{
              marginLeft: '2px',
              marginTop: '16px',
            }}
          >
            <Checkbox
              checked={volume?.encryption === 'enabled'}
              disabled
              text="Encrypt Volume"
              toolTipText={BLOCK_STORAGE_ENCRYPTION_SETTING_IMMUTABLE_COPY}
            />
          </Box>
        )}
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            disabled: isReadOnly,
            label: 'Attach',
            loading: formik.isSubmitting,
            type: 'submit',
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: handleClose,
          }}
        />
      </form>
    </Drawer>
  );
});

const StyledConfigSelect = styled(ConfigSelect, {
  label: 'StyledConfigSelect',
})(() => ({
  p: { marginLeft: 0 },
}));
