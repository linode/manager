import { restoreBackup } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CheckBox from 'src/components/CheckBox';
import FormControl from 'src/components/core/FormControl';
import FormControlLabel from 'src/components/core/FormControlLabel';
import FormHelperText from 'src/components/core/FormHelperText';
import InputLabel from 'src/components/core/InputLabel';
import Drawer from 'src/components/Drawer';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import withLinodes, {
  Props as LinodeProps,
} from 'src/containers/withLinodes.container';
import { useGrants } from 'src/queries/profile';
import { getPermissionsForLinode } from 'src/store/linodes/permissions/permissions.selector';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { Grants } from '@linode/api-v4/lib';

interface Props {
  open: boolean;
  linodeID: number;
  linodeRegion: string;
  backupCreated: string;
  backupID?: number;
  onClose: () => void;
  onSubmit: () => void;
}

export type CombinedProps = Props & LinodeProps;

const canEditLinode = (
  grants: Grants | undefined,
  linodeId: number
): boolean => {
  return getPermissionsForLinode(grants, linodeId) === 'read_only';
};

export const RestoreToLinodeDrawer: React.FC<CombinedProps> = (props) => {
  const {
    onSubmit,
    linodeID,
    backupID,
    open,
    backupCreated,
    linodesData,
    linodeRegion,
  } = props;

  const { data: grants } = useGrants();

  const [overwrite, setOverwrite] = React.useState<boolean>(false);
  const [selectedLinode, setSelectedLinode] = React.useState<string>('none');
  const [errors, setErrors] = React.useState<APIError[]>([]);

  const reset = () => {
    setOverwrite(false);
    setSelectedLinode('none');
    setErrors([]);
  };

  const restoreToLinode = () => {
    if (!selectedLinode || selectedLinode === 'none') {
      setErrors([
        ...errors,
        ...[{ field: 'linode_id', reason: 'You must select a Linode' }],
      ]);
      scrollErrorIntoView();
      return;
    }
    restoreBackup(linodeID, Number(backupID), Number(selectedLinode), overwrite)
      .then(() => {
        reset();
        onSubmit();
      })
      .catch((errResponse) => {
        setErrors(getAPIErrorOrDefault(errResponse));
        scrollErrorIntoView();
      });
  };

  const handleSelectLinode = (e: Item<string>) => {
    setSelectedLinode(e.value);
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

  const readOnly = canEditLinode(grants, Number(selectedLinode));
  const selectError = Boolean(linodeError) || readOnly;

  const linodeOptions = linodesData
    .filter((linode) => linode.region === linodeRegion)
    .map(({ label, id }) => {
      return { label, value: id };
    });

  return (
    <Drawer
      open={open}
      onClose={handleCloseDrawer}
      title={`Restore Backup from ${backupCreated}`}
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
          defaultValue={selectedLinode || ''}
          options={linodeOptions}
          onChange={handleSelectLinode}
          errorText={linodeError}
          placeholder="Select a Linode"
          isClearable={false}
          label="Select a Linode"
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

const enhanced = compose<CombinedProps, Props>(withLinodes());

export default enhanced(RestoreToLinodeDrawer);
