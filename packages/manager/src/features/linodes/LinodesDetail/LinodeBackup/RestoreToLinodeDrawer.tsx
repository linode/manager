import * as React from 'react';
import { LinodeBackup } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CheckBox from 'src/components/CheckBox';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import FormHelperText from 'src/components/core/FormHelperText';
import InputLabel from 'src/components/core/InputLabel';
import Drawer from 'src/components/Drawer';
import Select from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import { useGrants } from 'src/queries/profile';
import { getPermissionsForLinode } from 'src/store/linodes/permissions/permissions.selector';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { Grants } from '@linode/api-v4/lib';
import { useLinodeBackupRestoreMutation } from 'src/queries/linodes/backups';
import {
  useAllLinodesQuery,
  useLinodeQuery,
} from 'src/queries/linodes/linodes';

interface Props {
  open: boolean;
  linodeId: number;
  backup: LinodeBackup | undefined;
  onClose: () => void;
}

const canEditLinode = (
  grants: Grants | undefined,
  linodeId: number
): boolean => {
  return getPermissionsForLinode(grants, linodeId) === 'read_only';
};

export const RestoreToLinodeDrawer = (props: Props) => {
  const { linodeId, backup, open } = props;

  const { data: grants } = useGrants();
  const { data: linode } = useLinodeQuery(linodeId);

  const { data: linodes, isLoading } = useAllLinodesQuery(
    {},
    {
      region: linode?.region,
    },
    open && linode !== undefined
  );

  const { mutateAsync: restoreBackup } = useLinodeBackupRestoreMutation();

  const [overwrite, setOverwrite] = React.useState<boolean>(false);
  const [selectedTargetLinodeId, setSelectedTargetLinodeId] = React.useState<
    number | null
  >(linodeId);
  const [errors, setErrors] = React.useState<APIError[]>([]);

  const reset = () => {
    setOverwrite(false);
    setSelectedTargetLinodeId(null);
    setErrors([]);
  };

  const restoreToLinode = () => {
    restoreBackup({
      linodeId,
      backupId: backup?.id ?? -1,
      targetLinodeId: selectedTargetLinodeId ?? -1,
      overwrite,
    })
      .then(() => {
        reset();
      })
      .catch((errResponse) => {
        setErrors(getAPIErrorOrDefault(errResponse));
        scrollErrorIntoView();
      });
  };

  const handleToggleOverwrite = () => {
    setOverwrite((prevOverwrite) => !prevOverwrite);
  };

  const handleCloseDrawer = () => {
    reset();
    props.onClose();
  };

  const errorResources = {
    linode_id: 'Linode',
    overwrite: 'Overwrite',
  };

  const hasErrorFor = getAPIErrorsFor(errorResources, errors);

  const linodeError = hasErrorFor('linode_id');
  const overwriteError = hasErrorFor('overwrite');
  const generalError = hasErrorFor('none');

  const readOnly = canEditLinode(grants, selectedTargetLinodeId ?? -1);
  const selectError = Boolean(linodeError) || readOnly;

  const linodeOptions =
    linodes?.map(({ label, id }) => {
      return { label, value: id };
    }) ?? [];

  return (
    <Drawer
      open={open}
      onClose={handleCloseDrawer}
      title={`Restore Backup from ${backup?.created}`}
    >
      <FormControl fullWidth>
        <InputLabel
          htmlFor="linode"
          disableAnimation
          shrink={true}
          error={Boolean(linodeError)}
        >
          Linode
        </InputLabel>
        <Select
          textFieldProps={{
            dataAttrs: {
              'data-qa-select-linode': true,
            },
          }}
          value={linodeOptions.find(
            (option) => option.value === selectedTargetLinodeId
          )}
          options={linodeOptions}
          onChange={(item) => setSelectedTargetLinodeId(item.value)}
          errorText={linodeError}
          placeholder="Select a Linode"
          isClearable={false}
          label="Select a Linode"
          isLoading={isLoading}
          hideLabel
        />
        {selectError && (
          <FormHelperText error>
            {linodeError || "You don't have permission to edit this Linode."}
          </FormHelperText>
        )}
      </FormControl>
      <FormControlLabel
        control={
          <CheckBox checked={overwrite} onChange={handleToggleOverwrite} />
        }
        label="Overwrite Linode"
      />
      {overwrite && (
        <Notice
          warning
          text="This will delete all disks and configs on this Linode"
        />
      )}
      {Boolean(overwriteError) && (
        <FormHelperText error>{overwriteError}</FormHelperText>
      )}
      {Boolean(generalError) && (
        <FormHelperText error>{generalError}</FormHelperText>
      )}
      <ActionsPanel>
        <Button
          buttonType="secondary"
          onClick={handleCloseDrawer}
          data-qa-restore-cancel
        >
          Cancel
        </Button>
        <Button
          buttonType="primary"
          onClick={restoreToLinode}
          data-qa-restore-submit
          disabled={readOnly}
        >
          Restore
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};
