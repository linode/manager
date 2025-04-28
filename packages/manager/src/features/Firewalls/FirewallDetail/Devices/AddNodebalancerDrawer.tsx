import {
  useAddFirewallDeviceMutation,
  useAllFirewallsQuery,
  useGrants,
  useProfile,
} from '@linode/queries';
import { ActionsPanel, Drawer, Notice } from '@linode/ui';
import { getEntityIdsByPermission } from '@linode/utilities';
import { useTheme } from '@mui/material';
import { useParams } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { SupportLink } from 'src/components/SupportLink';
import { FIREWALL_LIMITS_CONSIDERATIONS_LINK } from 'src/constants';
import { NodeBalancerSelect } from 'src/features/NodeBalancers/NodeBalancerSelect';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

import type { NodeBalancer } from '@linode/api-v4';

interface Props {
  helperText: string;
  onClose: () => void;
  open: boolean;
}

export const AddNodebalancerDrawer = (props: Props) => {
  const { helperText, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams({ strict: false });
  const { data: grants } = useGrants();
  const { data: profile } = useProfile();
  const isRestrictedUser = Boolean(profile?.restricted);

  const { data, error, isLoading } = useAllFirewallsQuery(open);

  const firewall = data?.find((firewall) => firewall.id === Number(id));

  const theme = useTheme();

  const { isPending: addDeviceIsLoading, mutateAsync: addDevice } =
    useAddFirewallDeviceMutation();

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
        addDevice({
          firewallId: Number(id),
          id: nodebalancer.id,
          type: 'nodebalancer',
        })
      )
    );

    results.forEach((result, index) => {
      const label = selectedNodebalancers[index].label;
      const id = selectedNodebalancers[index].id;
      if (result.status === 'fulfilled') {
        enqueueSnackbar(`NodeBalancer ${label} successfully added`, {
          variant: 'success',
        });
        return;
      }
      failedNodebalancers.push(selectedNodebalancers[index]);
      const errorReason = getAPIErrorOrDefault(
        result.reason,
        `Failed to add NodeBalancer ${label} (ID ${id}).`
      )[0].reason;

      if (!firstError) {
        firstError = errorReason;
      }
    });

    setLocalError(firstError);
    setSelectedNodebalancers(failedNodebalancers);

    if (!firstError) {
      onClose();
    }
  };

  const errorNotice = () => {
    let errorMsg = sanitizeHTML({
      sanitizeOptions: {
        ALLOWED_ATTR: [],
        ALLOWED_TAGS: [], // Disallow all HTML tags,
      },
      sanitizingTier: 'strict',
      text: localError || '',
    }).toString();
    // match something like: NodeBalancer <nodebalancer_label> (ID <nodebalancer_id>)

    const nodebalancer = /NodeBalancer (.+?) \(ID ([^\)]+)\)/i.exec(errorMsg);
    const openTicket = errorMsg.match(/open a support ticket\./i);

    if (openTicket) {
      errorMsg = errorMsg.replace(/open a support ticket\./i, '');
    }

    if (nodebalancer) {
      const [, label, id] = nodebalancer;

      // Break the errorMsg into two parts: before and after the NodeBalancer pattern
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
            font: theme.font.bold,
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

  const assignedNodeBalancers = data
    ?.map((firewall) => firewall.entities)
    .flat()
    ?.filter((service) => service.type === 'nodebalancer');

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

  return (
    <Drawer
      NotFoundComponent={NotFound}
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
        outbound rules won't be applied.{' '}
        <Link to={FIREWALL_LIMITS_CONSIDERATIONS_LINK}>Learn more</Link>.
      </Notice>
      <form
        onSubmit={(e: React.ChangeEvent<HTMLFormElement>) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {localError ? errorNotice() : null}
        <NodeBalancerSelect
          disabled={isLoading}
          helperText={helperText}
          multiple
          onSelectionChange={(nodebalancers) =>
            setSelectedNodebalancers(nodebalancers)
          }
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
