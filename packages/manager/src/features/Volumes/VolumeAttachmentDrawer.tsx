import { Grant } from '@linode/api-v4/lib/account';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormControl from 'src/components/core/FormControl';
import FormHelperText from 'src/components/core/FormHelperText';
import Drawer from 'src/components/Drawer';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import { resetEventsPolling } from 'src/eventsPolling';
import LinodeSelect from 'src/features/linodes/LinodeSelect';
import { getGrants } from 'src/features/Profile/permissionsHelpers';
import { useAllLinodeConfigsQuery } from 'src/queries/linodes';
import { useGrants, useProfile } from 'src/queries/profile';
import { useAttachVolumeMutation } from 'src/queries/volumes';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

interface Props {
  open: boolean;
  volumeId: number;
  volumeLabel: string;
  linodeRegion: string;
  onClose: () => void;
  disabled?: boolean;
}

export const VolumeAttachmentDrawer = (props: Props) => {
  const { open, volumeLabel, disabled, linodeRegion, volumeId } = props;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const {
    mutateAsync: attachVolume,
    error,
    isLoading,
  } = useAttachVolumeMutation();

  const [selectedLinode, setSelectedLinode] = React.useState<number>(-1);
  const [selectedConfig, setSelectedConfig] = React.useState<string>();

  const { data, isLoading: configsLoading } = useAllLinodeConfigsQuery(
    selectedLinode,
    selectedLinode !== -1
  );

  const configs = data ?? [];

  const configChoices = configs.map((config) => {
    return [`${config.id}`, config.label];
  });

  const configList =
    configChoices &&
    configChoices.map((el) => {
      return {
        label: el[1],
        value: el[0],
      };
    });

  const reset = () => {
    setSelectedLinode(-1);
    setSelectedConfig(undefined);
  };

  const changeSelectedLinode = (linodeId: number) => {
    setSelectedLinode(linodeId);
  };

  const changeSelectedConfig = (e: Item<string>) => {
    setSelectedConfig(e.value);
  };

  const handleClose = () => {
    reset();
    props.onClose();
  };

  const attachToLinode = () => {
    attachVolume({
      volumeId,
      linode_id: Number(selectedLinode),
      config_id: Number(selectedConfig) || undefined,
    }).then((_) => {
      resetEventsPolling();
      handleClose();
    });
  };

  const errorResources = {
    linode_id: 'Linode',
    overwrite: 'Overwrite',
  };

  const volumesPermissions = getGrants(grants, 'volume');
  const volumePermissions = volumesPermissions.find(
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
      {readOnly && (
        <Notice
          text={`You don't have permissions to edit ${volumeLabel}. Please contact an account administrator for details.`}
          error={true}
          important
        />
      )}
      {generalError && <Notice text={generalError} error={true} />}
      <LinodeSelect
        selectedLinode={selectedLinode}
        region={linodeRegion}
        handleChange={(linode) => {
          if (linode !== null) {
            changeSelectedLinode(linode.id);
          }
        }}
        linodeError={linodeError}
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
          options={configList}
          defaultValue={selectedConfig || ''}
          onChange={changeSelectedConfig}
          name="config"
          id="config"
          errorText={linodeError}
          disabled={disabled || readOnly || selectedLinode === -1}
          label="Config"
          isClearable={false}
          isLoading={configsLoading}
        />
        {Boolean(configError) && (
          <FormHelperText error>{configError}</FormHelperText>
        )}
      </FormControl>
      <ActionsPanel>
        <Button buttonType="secondary" onClick={handleClose} data-qa-cancel>
          Cancel
        </Button>
        <Button
          buttonType="primary"
          onClick={attachToLinode}
          loading={isLoading}
          disabled={disabled || readOnly}
          data-qa-submit
        >
          Attach
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};
