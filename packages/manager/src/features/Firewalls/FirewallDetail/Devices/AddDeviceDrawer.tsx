import { Linode } from '@linode/api-v4/lib/linodes';
import { useTheme } from '@mui/material/styles';
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

import { READ_ONLY_LINODES_HIDDEN_MESSAGE } from '../../FirewallLanding/CreateFirewallDrawer';

interface Props {
  onClose: () => void;
  open: boolean;
}

export const AddDeviceDrawer = (props: Props) => {
  const { onClose, open } = props;

  const { id } = useParams<{ id: string }>();

  const { data: grants } = useGrants();
  const { data: profile } = useProfile();
  const isRestrictedUser = Boolean(profile?.restricted);

  const { enqueueSnackbar } = useSnackbar();

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
  const theme = useTheme();

  const [selectedLinodes, setSelectedLinodes] = React.useState<Linode[]>([]);

  const handleSubmit = async () => {
    await Promise.all(
      selectedLinodes.map((linode) =>
        addDevice({ id: linode.id, type: 'linode' })
          .then(() => {
            enqueueSnackbar(`Successfully added ${linode.label}`, {
              variant: 'success',
            });
          })
          .catch((error) => {
            enqueueSnackbar(`Failed to add ${linode.label}`, {
              variant: 'error',
            });
            throw error;
          })
      )
    );
    onClose();
    setSelectedLinodes([]);
  };

  // @todo title and error messaging will update to "Device" once NodeBalancers are allowed
  const errorMessage = error
    ? getAPIErrorOrDefault(error, 'Error adding Linode')[0].reason
    : undefined;

  // @todo update regex once error messaging updates
  const errorNotice = (errorMsg: string) => {
    // match something like: Linode <linode_label> (ID <linode_id>)
    const linode = /linode (.+?) \(id ([^()]*)\)/i.exec(errorMsg);
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
            fontFamily: theme.font.bold,
            fontSize: '1rem',
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

  const linodeSelectGuidance =
    readOnlyLinodeIds.length > 0 ? READ_ONLY_LINODES_HIDDEN_MESSAGE : undefined;

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`Add Linode to Firewall: ${firewall?.label}`}
    >
      <form
        onSubmit={(e: React.ChangeEvent<HTMLFormElement>) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {errorMessage ? errorNotice(errorMessage) : null}
        <LinodeSelect
          helperText={`You can assign one or more Linodes to this Firewall. Each Linode can only be assigned to a single Firewall. ${
            linodeSelectGuidance ? linodeSelectGuidance : ''
          }`}
          optionsFilter={(linode) =>
            ![...readOnlyLinodeIds, ...currentLinodeIds].includes(linode.id)
          }
          disabled={currentDevicesLoading}
          loading={currentDevicesLoading}
          multiple
          noOptionsMessage="No Linodes available to add"
          onSelectionChange={(linodes) => setSelectedLinodes(linodes)}
          value={selectedLinodes.map((linode) => linode.id)}
        />
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            disabled: selectedLinodes.length === 0,
            label: 'Add',
            loading: isLoading,
            onClick: handleSubmit,
          }}
          secondaryButtonProps={{
            'data-testid': 'cancel',
            label: 'Cancel',
            onClick: onClose,
          }}
        />
      </form>
    </Drawer>
  );
};
