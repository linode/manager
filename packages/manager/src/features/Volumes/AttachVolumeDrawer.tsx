import { Volume } from '@linode/api-v4';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { number, object } from 'yup';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Drawer } from 'src/components/Drawer';
import { FormControl } from 'src/components/FormControl';
import { FormHelperText } from 'src/components/FormHelperText';
import { Notice } from 'src/components/Notice/Notice';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';
import { useEventsPollingActions } from 'src/queries/events/events';
import { useAllLinodeConfigsQuery } from 'src/queries/linodes/configs';
import { useGrants } from 'src/queries/profile';
import { useAttachVolumeMutation } from 'src/queries/volumes/volumes';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

interface ConfigOption {
  label: string;
  value: string;
}
interface Props {
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
  const { open, volume } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { checkForNewEvents } = useEventsPollingActions();

  const { data: grants } = useGrants();
  const [selectedOption, setSelectedOption] = React.useState<ConfigOption>({
    label: '',
    value: '',
  });

  const { error, mutateAsync: attachVolume } = useAttachVolumeMutation();

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

  const { data, isLoading: configsLoading } = useAllLinodeConfigsQuery(
    formik.values.linode_id,
    formik.values.linode_id !== -1
  );

  const configs = data ?? [];

  const configChoices = configs.map((config) => {
    return { label: config.label, value: `${config.id}` };
  });

  React.useEffect(() => {
    if (configs.length === 1) {
      formik.setFieldValue('config_id', configs[0].id);
      setSelectedOption({ label: configs[0].label, value: `${configs[0].id}` });
    }
  }, [configs]);

  const reset = () => {
    formik.resetForm();
  };

  const handleClose = () => {
    reset();
    setSelectedOption({
      label: '',
      value: '',
    });
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
      onClose={handleClose}
      open={open}
      title={`Attach Volume ${volume?.label}`}
    >
      <form onSubmit={formik.handleSubmit}>
        {isReadOnly && (
          <Notice
            text="You don't have permission to edit this volume."
            variant="error"
          />
        )}
        {generalError && <Notice text={generalError} variant="error" />}
        <LinodeSelect
          onSelectionChange={(linode) => {
            if (linode !== null) {
              formik.setFieldValue('linode_id', linode.id);
            }
          }}
          clearable={false}
          disabled={isReadOnly}
          errorText={formik.errors.linode_id ?? linodeError}
          filter={{ region: volume?.region }}
          noMarginTop
          value={formik.values.linode_id}
        />
        {!linodeError && (
          <FormHelperText>
            Only Linodes in this Volume&rsquo;s region are displayed.
          </FormHelperText>
        )}
        {/* Config Selection */}
        <FormControl fullWidth>
          <Autocomplete
            errorText={
              formik.touched.config_id && formik.errors.config_id
                ? formik.errors.config_id
                : configError
            }
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
            onChange={(_, selected) => {
              if (selected) {
                formik.setFieldValue('config_id', Number(selected.value));
              }
            }}
            placeholder={
              configsLoading ? 'Loading Config...' : 'Select a Config'
            }
            disableClearable
            disabled={isReadOnly || formik.values.linode_id === -1}
            id="config_id"
            label="Config"
            loading={configsLoading}
            options={!configsLoading ? configChoices : []}
            value={selectedOption}
          />
        </FormControl>
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
