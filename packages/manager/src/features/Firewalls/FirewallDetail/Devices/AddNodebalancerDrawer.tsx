import { NodeBalancer } from '@linode/api-v4';
import { useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { SupportLink } from 'src/components/SupportLink';
import { NodeBalancerSelect } from 'src/features/NodeBalancers/NodeBalancerSelect';
import {
  useAddFirewallDeviceMutation,
  useAllFirewallsQuery,
} from 'src/queries/firewalls';
import { queryKey } from 'src/queries/nodebalancers';
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
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useAllFirewallsQuery();

  const assignedServices = data
    ?.map((firewall) => {
      return firewall.entities;
    })
    .flat();

  const assignedNodeBalancers = assignedServices?.filter((service) => {
    return service.type === 'nodebalancer';
  });

  const firewall = data?.find((firewall) => firewall.id === Number(id));

  const theme = useTheme();

  const {
    isLoading: addDeviceIsLoading,
    mutateAsync: addDevice,
  } = useAddFirewallDeviceMutation(Number(id));

  const [selectedNodebalancers, setSelectedNodebalancers] = React.useState<
    NodeBalancer[]
  >([]);

  const [localError, setLocalError] = React.useState<string | undefined>(
    undefined
  );

  const handleSubmit = async () => {
    let firstError: string | undefined = undefined;
    const failedNodebalancers: NodeBalancer[] = [];

    const results = await Promise.allSettled(
      selectedNodebalancers.map((nodebalancer) =>
        addDevice({ id: nodebalancer.id, type: 'nodebalancer' })
      )
    );

    results.forEach((result, index) => {
      const label = selectedNodebalancers[index].label;
      const id = selectedNodebalancers[index].id;
      if (result.status === 'fulfilled') {
        enqueueSnackbar(`NodeBalancer ${label} successfully added`, {
          variant: 'success',
        });
        queryClient.invalidateQueries([
          queryKey,
          'nodebalancer',
          id,
          'firewalls',
        ]);
      } else {
        failedNodebalancers.push(selectedNodebalancers[index]);
        const errorReason = getAPIErrorOrDefault(
          result.reason,
          `Failed to add NodeBalancer ${label} (ID ${id}).`
        )[0].reason;

        if (!firstError) {
          firstError = errorReason;
        }
      }
    });

    setLocalError(firstError);
    setSelectedNodebalancers(failedNodebalancers);

    if (!firstError) {
      onClose();
    }
  };

  const errorNotice = () => {
    let errorMsg = localError || '';
    // match something like: NodeBalancer <nodebalancer_label> (ID <nodebalancer_id>)

    const nodebalancer = /NodeBalancer (.+?) \(ID ([^\)]+)\)/i.exec(errorMsg);
    const openTicket = errorMsg.match(/open a support ticket\./i);

    if (openTicket) {
      errorMsg = errorMsg.replace(/open a support ticket\./i, '');
    }

    if (nodebalancer) {
      const [, label, id] = nodebalancer;

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
            fontFamily: theme.font.bold,
            fontSize: '1rem',
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

  const nodebalancerOptionsFilter = (nodebalancer: NodeBalancer) => {
    return (
      !readOnlyNodebalancerIds.includes(nodebalancer.id) &&
      !assignedNodeBalancers?.some((service) => service.id === nodebalancer.id)
    );
  };

  React.useEffect(() => {
    if (error) {
      setLocalError('Could not load firewall data');
    }
  }, [error]);

  // const nodebalancers = data?.filter(optionsFilter);

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
          disabled={isLoading}
          helperText={helperText}
          multiple
          optionsFilter={nodebalancerOptionsFilter}
          value={selectedNodebalancers.map((nodebalancer) => nodebalancer.id)}
        />
        <ActionsPanel
          primaryButtonProps={{
            disabled: selectedNodebalancers.length === 0,
            label: 'Add',
            loading: addDeviceIsLoading,
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
