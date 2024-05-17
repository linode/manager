import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';
import { getAPIErrorFor } from 'src/utilities/getAPIErrorFor';

import { useImageAndLinodeGrantCheck } from './utils';

interface Props {
  changeLinode: (linodeId: number) => void;
  imageID?: string;
  onClose: () => void;
  open?: boolean;
  selectedLinode?: number;
}

export const RebuildImageDrawer = (props: Props) => {
  const { changeLinode, imageID, onClose, open, selectedLinode } = props;

  const history = useHistory();
  const {
    canCreateImage,
    permissionedLinodes: availableLinodes,
  } = useImageAndLinodeGrantCheck();

  const [notice, setNotice] = React.useState(undefined);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);

  const handleLinodeChange = (linodeID: number) => {
    // Clear any errors
    setErrors(undefined);
    changeLinode(linodeID);
  };

  const onSubmit = () => {
    setErrors(undefined);
    setNotice(undefined);
    setSubmitting(true);

    if (!imageID) {
      return;
    }

    if (!selectedLinode) {
      setSubmitting(false);
      setErrors([{ field: 'linode_id', reason: 'Choose a Linode.' }]);
      return;
    }
    close();
    history.push({
      pathname: `/linodes/${selectedLinode}/rebuild`,
      search: new URLSearchParams({ selectedImageId: imageID }).toString(),
    });
  };

  const hasErrorFor = getAPIErrorFor(
    {
      disk_id: 'Disk',
      label: 'Label',
      linode_id: 'Linode',
      region: 'Region',
      size: 'Size',
    },
    errors
  );
  const generalError = hasErrorFor('none');
  const linodeError = hasErrorFor('linode_id');

  return (
    <Drawer onClose={onClose} open={open} title="Restore from Image">
      {!canCreateImage ? (
        <Notice
          text="You don't have permissions to create a new Image. Please contact an account administrator for details."
          variant="error"
        />
      ) : null}
      {generalError && (
        <Notice data-qa-notice text={generalError} variant="error" />
      )}

      {notice && <Notice data-qa-notice text={notice} variant="info" />}

      <LinodeSelect
        onSelectionChange={(linode) => {
          if (linode !== null) {
            handleLinodeChange(linode.id);
          }
        }}
        optionsFilter={(linode) =>
          availableLinodes ? availableLinodes.includes(linode.id) : true
        }
        clearable={false}
        disabled={!canCreateImage}
        errorText={linodeError}
        value={selectedLinode ?? null}
      />

      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'submit',
          disabled: !selectedLinode || !canCreateImage,
          label: 'Restore Image',
          loading: submitting,
          onClick: onSubmit,
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel',
          disabled: !canCreateImage,
          label: 'Cancel',
          onClick: onClose,
        }}
        style={{ marginTop: 16 }}
      />
    </Drawer>
  );
};
