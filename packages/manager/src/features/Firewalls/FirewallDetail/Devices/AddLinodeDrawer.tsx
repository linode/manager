import { Linode } from '@linode/api-v4';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { SupportLink } from 'src/components/SupportLink';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';
import {
  useAddFirewallDeviceMutation,
  useAllFirewallDevicesQuery,
  useFirewallQuery,
} from 'src/queries/firewalls';
import { useGrants, useProfile } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getEntityIdsByPermission } from 'src/utilities/grants';

interface Props {
  helperText: string;
  onClose: () => void;
  open: boolean;
}

export const AddLinodeDrawer = (props: Props) => {
  const { helperText, onClose, open } = props;

  const { id } = useParams<{ id: string }>();

  const { enqueueSnackbar } = useSnackbar();

  const { data: grants } = useGrants();
  const { data: profile } = useProfile();
  const isRestrictedUser = Boolean(profile?.restricted);

  const { data: firewall } = useFirewallQuery(Number(id));
  const {
    data: currentDevices,
    isLoading: currentDevicesLoading,
  } = useAllFirewallDevicesQuery(Number(id));

  const currentLinodeIds =
    currentDevices
      ?.filter((device) => device.entity.type === 'linode')
      .map((device) => device.entity.id) ?? [];

  const {
    error,
    isLoading,
    mutateAsync: addDevice,
  } = useAddFirewallDeviceMutation(Number(id));

  const [selectedLinodes, setSelectedLinodes] = React.useState<Linode[]>([]);

  const handleSubmit = async () => {
    const results = await Promise.allSettled(
      selectedLinodes.map((linode) =>
        addDevice({ id: linode.id, type: 'linode' })
      )
    );

    let hasError = false;

    results.forEach((result, index) => {
      const label = selectedLinodes[index].label;
      if (result.status === 'fulfilled') {
        // Assuming the response contains the device label, replace with the appropriate property if not.
        enqueueSnackbar(`${label} added successfully.`, { variant: 'success' });
      } else {
        hasError = true;
        // Assuming the error object contains the device label, replace with the appropriate property if not.
        enqueueSnackbar(`Failed to add ${label}.`, { variant: 'error' });
      }
    });

    if (!hasError) {
      onClose();
      setSelectedLinodes([]);
    }
  };

  // @todo title and error messaging will update to "Device" once NodeBalancers are allowed
  const errorMessage = error
    ? getAPIErrorOrDefault(error, 'Error adding Linode')[0].reason
    : undefined;

  // @todo update regex once error messaging updates
  const errorNotice = () => {
    let errorMsg = errorMessage || '';
    // match something like: Linode <linode_label> (ID <linode_id>)
    const linode = /Linode (.+?) \(ID ([^\)]+)\)/i.exec(errorMsg);
    const openTicket = errorMsg.match(/open a support ticket\./i);
    if (openTicket) {
      errorMsg = errorMsg.replace(/open a support ticket\./i, '');
    }
    if (linode) {
      const [, label, id] = linode;
      const labelIndex = errorMsg.indexOf(label);
      errorMsg = errorMsg.replace(/\(id ([^()]*)\)/i, '');
      return (
        <Notice
          sx={{
            fontSize: '1rem',
            fontWeight: 'bold',
            lineHeight: '20px',
          }}
          variant="error"
        >
          {errorMsg.substring(0, labelIndex)}
          <Link to={`/linodes/${id}`}>{label}</Link>
          {errorMsg.substring(labelIndex + label.length)}
          {openTicket ? (
            <>
              <SupportLink text="open a Support ticket" />.
            </>
          ) : null}
        </Notice>
      );
    } else {
      return <Notice text={errorMessage} variant="error" />;
    }
  };

  // If a user is restricted, they can not add a read-only Linode to a firewall.
  const readOnlyLinodeIds = isRestrictedUser
    ? getEntityIdsByPermission(grants, 'linode', 'read_only')
    : [];

  return (
    <Drawer
      onClose={() => {
        setSelectedLinodes([]);
        onClose();
      }}
      open={open}
      title={`Add Linode to Firewall: ${firewall?.label}`}
    >
      <form
        onSubmit={(e: React.ChangeEvent<HTMLFormElement>) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {errorMessage ? errorNotice() : null}
        <LinodeSelect
          optionsFilter={(linode) =>
            ![...readOnlyLinodeIds, ...currentLinodeIds].includes(linode.id)
          }
          disabled={currentDevicesLoading}
          helperText={helperText}
          loading={currentDevicesLoading}
          multiple
          noOptionsMessage="No Linodes available to add"
          onSelectionChange={(linodes) => setSelectedLinodes(linodes)}
          value={selectedLinodes.map((linode) => linode.id)}
        />
        <ActionsPanel
          primaryButtonProps={{
            disabled: selectedLinodes.length === 0,
            label: 'Add',
            loading: isLoading,
            onClick: handleSubmit,
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      </form>
    </Drawer>
  );
};
