import { NodeBalancer } from '@linode/api-v4';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { SupportLink } from 'src/components/SupportLink';
import { NodeBalancerSelect } from 'src/features/NodeBalancers/NodeBalancerSelect';
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

export const AddNodebalancerDrawer = (props: Props) => {
  const { helperText, onClose, open } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { id } = useParams<{ id: string }>();

  const { data: grants } = useGrants();
  const { data: profile } = useProfile();
  const isRestrictedUser = Boolean(profile?.restricted);

  const { data: firewall } = useFirewallQuery(Number(id));
  const {
    data: currentDevices,
    isLoading: currentDevicesLoading,
  } = useAllFirewallDevicesQuery(Number(id));

  const currentNodebalancerIds =
    currentDevices
      ?.filter((device) => device.entity.type === 'nodebalancer')
      .map((device) => device.entity.id) ?? [];

  const {
    error,
    isLoading,
    mutateAsync: addDevice,
  } = useAddFirewallDeviceMutation(Number(id));

  const [selectedNodebalancers, setSelectedNodebalancers] = React.useState<
    NodeBalancer[]
  >([]);

  const [localError, setLocalError] = React.useState<string | undefined>(
    undefined
  );

  const handleSubmit = async () => {
    const results = await Promise.allSettled(
      selectedNodebalancers.map((nodebalancer) =>
        addDevice({ id: nodebalancer.id, type: 'nodebalancer' })
      )
    );

    let hasError = false;

    results.forEach((result, index) => {
      const label = selectedNodebalancers[index].label;
      if (result.status === 'fulfilled') {
        // Assuming the response contains the device label, replace with the appropriate property if not.
        enqueueSnackbar(`${label} added successfully.`, { variant: 'success' });
      } else {
        hasError = true;
        // Assuming the error object contains the device label, replace with the appropriate property if not.
        // const errorLabel = result.reason.label;
        enqueueSnackbar(`Failed to add ${label}.`, {
          variant: 'error',
        });
      }
    });

    if (!hasError) {
      onClose();
      setSelectedNodebalancers([]);
    }
  };

  React.useEffect(() => {
    setLocalError(
      error
        ? getAPIErrorOrDefault(error, `Error adding Nodebalancer`)[0].reason
        : undefined
    );
  }, [error]);

  const errorNotice = () => {
    let errorMsg = localError || '';
    // match something like: NodeBalancer <nodebalancer_label> (ID <nodebalancer_id>)

    const linode = /NodeBalancer (.+?) \(ID ([^\)]+)\)/i.exec(errorMsg);
    const openTicket = errorMsg.match(/open a support ticket\./i);

    if (openTicket) {
      errorMsg = errorMsg.replace(/open a support ticket\./i, '');
    }

    if (linode) {
      const [, label, id] = linode;

      // Break the errorMsg into two parts: before and after the nodebalancer pattern
      const startMsg = errorMsg.substring(
        0,
        errorMsg.indexOf(`NodeBalancer ${label}`)
      );
      const endMsg = errorMsg.substring(
        errorMsg.indexOf(`(ID ${id})`) + `(ID ${id})`.length
      );

      return (
        <Notice
          sx={{
            fontSize: '1rem',
            fontWeight: 'bold',
            lineHeight: '20px',
          }}
          variant="error"
        >
          {startMsg}
          <Link to={`/nodebalancers/${id}`}>{label}</Link>
          {endMsg}
          {openTicket ? (
            <>
              <SupportLink text="open a Support ticket" />.
            </>
          ) : null}
        </Notice>
      );
    } else {
      return <Notice text={localError} variant="error" />;
    }
  };

  // If a user is restricted, they can not add a read-only Nodebalancer to a firewall.
  const readOnlyNodebalancerIds = isRestrictedUser
    ? getEntityIdsByPermission(grants, 'nodebalancer', 'read_only')
    : [];

  return (
    <Drawer
      onClose={() => {
        setSelectedNodebalancers([]);
        setLocalError(undefined);
        onClose();
      }}
      open={open}
      title={`Add Nodebalancer to Firewall: ${firewall?.label}`}
    >
      <Notice variant={'warning'}>
        Only the Firewall's inbound rules apply to NodeBalancers. Any existing
        outbound rules won't be applied.
        {/* @todo add documentation link */}
        <Link to="#"> Learn more.</Link>
      </Notice>
      <form
        onSubmit={(e: React.ChangeEvent<HTMLFormElement>) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {localError ? errorNotice() : null}
        <NodeBalancerSelect
          onSelectionChange={(nodebalancers) =>
            setSelectedNodebalancers(nodebalancers)
          }
          optionsFilter={(nodebalancer) =>
            ![...currentNodebalancerIds, ...readOnlyNodebalancerIds].includes(
              nodebalancer.id
            )
          }
          disabled={currentDevicesLoading}
          helperText={helperText}
          loading={currentDevicesLoading}
          multiple
          value={selectedNodebalancers.map((nodebalancer) => nodebalancer.id)}
        />
        <ActionsPanel
          primaryButtonProps={{
            disabled: selectedNodebalancers.length === 0,
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
