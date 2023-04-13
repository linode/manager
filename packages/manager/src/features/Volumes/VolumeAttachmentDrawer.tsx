import { Grant } from '@linode/api-v4/lib/account';
import { useFormik } from 'formik';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import Drawer from 'src/components/Drawer';
import Select, { Item } from 'src/components/EnhancedSelect';
import Notice from 'src/components/Notice';
import { resetEventsPolling } from 'src/eventsPolling';
import LinodeSelect from 'src/features/linodes/LinodeSelect';
import { useAllLinodeConfigsQuery } from 'src/queries/linodes';
import { useGrants, useProfile } from 'src/queries/profile';
import { useAttachVolumeMutation } from 'src/queries/volumes';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import { number, object } from 'yup';

interface Props {
  open: boolean;
  volumeId: number;
  volumeLabel: string;
  linodeRegion: string;
  onClose: () => void;
  disabled?: boolean;
}

const AttachVolumeValidationSchema = object({
  linode_id: number()
    .min(0, 'Linode is required.')
    .required('Linode is required.'),
  config_id: number()
    .min(0, 'Config is required.')
    .required('Config is required.'),
});

export const VolumeAttachmentDrawer = React.memo((props: Props) => {
  const { open, volumeLabel, disabled, linodeRegion, volumeId } = props;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const { mutateAsync: attachVolume, error } = useAttachVolumeMutation();

  const formik = useFormik({
    initialValues: { linode_id: -1, config_id: -1 },
    validationSchema: AttachVolumeValidationSchema,
    validateOnBlur: false,
    validateOnChange: false,
    async onSubmit(values) {
      await attachVolume({
        volumeId,
        ...values,
      }).then((_) => {
        resetEventsPolling();
        handleClose();
      });
    },
  });

  const { data, isLoading: configsLoading } = useAllLinodeConfigsQuery(
    formik.values.linode_id,
    formik.values.linode_id !== -1
  );

  const configs = data ?? [];

  const configChoices = configs.map((config) => {
    return { value: `${config.id}`, label: config.label };
  });

  React.useEffect(() => {
    if (configs.length === 1) {
      formik.setFieldValue('config_id', configs[0].id);
    }
  }, [configs]);

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

  const volumesPermissions = grants?.volume;
  const volumePermissions = volumesPermissions?.find(
    (v: Grant) => v.id === volumeId
  );

  const readOnly =
    Boolean(profile?.restricted) &&
    volumePermissions &&
    volumePermissions.permissions === 'read_only';

  const hasErrorFor = getAPIErrorsFor(
    errorResources,
    error === null ? undefined : error
  );
  const linodeError = hasErrorFor('linode_id');
  const configError = hasErrorFor('config_id');
  const generalError = hasErrorFor('none');

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={`Attach Volume ${volumeLabel}`}
    >
      <form onSubmit={formik.handleSubmit}>
        {readOnly && (
          <Notice
            text={`You don't have permissions to edit ${volumeLabel}. Please contact an account administrator for details.`}
            error
            important
          />
        )}
        {generalError && <Notice text={generalError} error={true} />}
        <LinodeSelect
          selectedLinode={formik.values.linode_id}
          region={linodeRegion}
          handleChange={(linode) => {
            if (linode !== null) {
              formik.setFieldValue('linode_id', linode.id);
            }
          }}
          linodeError={formik.errors.linode_id ?? linodeError}
          disabled={disabled || readOnly}
          isClearable={false}
        />
        {!linodeError && (
          <FormHelperText>
            Only Linodes in this Volume&rsquo;s region are displayed.
          </FormHelperText>
        )}
        {/* Config Selection */}
        <FormControl fullWidth>
          <Select
            options={configChoices}
            onChange={(item: Item<string>) =>
              formik.setFieldValue('config_id', Number(item.value))
            }
            value={configChoices.find(
              (item) => item.value === String(formik.values.config_id)
            )}
            name="config_id"
            id="config_id"
            errorText={formik.errors.config_id ?? configError}
            disabled={disabled || readOnly || formik.values.linode_id === -1}
            label="Config"
            placeholder="Select a Config"
            isClearable={false}
            isLoading={configsLoading}
          />
        </FormControl>
        <ActionsPanel>
          <Button buttonType="secondary" onClick={handleClose} data-qa-cancel>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            type="submit"
            loading={formik.isSubmitting}
            disabled={disabled || readOnly}
            data-qa-submit
          >
            Attach
          </Button>
        </ActionsPanel>
      </form>
    </Drawer>
  );
});
