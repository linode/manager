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

  const [selectedDeviceIds, setSelectedDeviceIds] = React.useState<number[]>(
    []
  );

  const handleSubmit = async () => {
    const results = await Promise.allSettled(
      selectedDeviceIds.map((id) => addDevice({ id, type: 'nodebalancer' }))
    );

    let hasError = false;

    results.forEach((result, _) => {
      if (result.status === 'fulfilled') {
        // Assuming the response contains the device label, replace with the appropriate property if not.
        const label = result.value.entity.label;
        enqueueSnackbar(`${label} added successfully.`, { variant: 'success' });
      } else {
        hasError = true;
        // Assuming the error object contains the device label, replace with the appropriate property if not.
        const errorLabel = result.reason.label;
        enqueueSnackbar(`Failed to add ${errorLabel}.`, { variant: 'error' });
      }
    });

    if (!hasError) {
      onClose();
      setSelectedDeviceIds([]);
    }
  };

  const errorMessage = error
    ? getAPIErrorOrDefault(error, `Error adding Nodebalancer`)[0].reason
    : undefined;

  // @todo update regex once error messaging updates
  const errorNotice = () => {
    let errorMsg = errorMessage || '';
    // match something like: Nodebalancer <nodebalancer_label> (ID <nodebalancer_id>)
    const device = /(nodebalancer) (.+?) \(id ([^()]*)\)/i.exec(errorMsg);
    const openTicket = errorMsg.match(/open a support ticket\./i);
    if (openTicket) {
      errorMsg = errorMsg.replace(/open a support ticket\./i, '');
    }
    if (device) {
      const [, label, id] = device;
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
          <Link to={`/nodebalancers/${id}`}>{label}</Link>
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

  // If a user is restricted, they can not add a read-only Nodebalancer to a firewall.
  const readOnlyNodebalancerIds = isRestrictedUser
    ? getEntityIdsByPermission(grants, 'nodebalancer', 'read_only')
    : [];

  return (
    <Drawer
      onClose={() => {
        setSelectedDeviceIds([]);
        onClose();
      }}
      open={open}
      title={`Add Nodebalancer to Firewall: ${firewall?.label}`}
    >
      <Notice variant={'warning'}>
        Only the Firewall's inbound rules apply to NodeBalancers. Any existing
        outbound rules won't be applied.
        {/* add documentation link */}
        <Link to="#"> Learn more.</Link>
      </Notice>
      <form
        onSubmit={(e: React.ChangeEvent<HTMLFormElement>) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {errorMessage ? errorNotice() : null}
        <NodeBalancerSelect
          onSelectionChange={(nodebalancers) =>
            setSelectedDeviceIds(
              nodebalancers.map((nodebalancer) => nodebalancer.id)
            )
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
          value={selectedDeviceIds}
        />
        <ActionsPanel
          primaryButtonProps={{
            disabled: selectedDeviceIds.length === 0,
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
