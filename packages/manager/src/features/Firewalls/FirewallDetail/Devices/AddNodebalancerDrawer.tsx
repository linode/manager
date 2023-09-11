import { NodeBalancer } from '@linode/api-v4';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { SupportLink } from 'src/components/SupportLink';
import {
  useAddFirewallDeviceMutation,
  useAllFirewallDevicesQuery,
  useFirewallQuery,
} from 'src/queries/firewalls';
import { useAllNodeBalancersQuery } from 'src/queries/nodebalancers';
import { useGrants, useProfile } from 'src/queries/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getEntityIdsByPermission } from 'src/utilities/grants';
import { mapIdsToDevices } from 'src/utilities/mapIdsToDevices';

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

  const { isLoading, mutateAsync: addDevice } = useAddFirewallDeviceMutation(
    Number(id)
  );

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
        enqueueSnackbar(`${label} added successfully.`, { variant: 'success' });
      } else {
        failedNodebalancers?.push(selectedNodebalancers[index]);
        const errorReason = getAPIErrorOrDefault(
          result.reason,
          `Failed to add NodeBalancer ${label} (ID ${id}).`
        )[0].reason;

        if (!firstError) {
          firstError = errorReason;
        }

        enqueueSnackbar(`Failed to add ${label}.`, { variant: 'error' });
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

  type OptionType = { id: number; label: string };

  const currentNodebalancerIds =
    currentDevices
      ?.filter((device) => device.entity.type === 'nodebalancer')
      .map((device) => device.entity.id) ?? [];

  // If a user is restricted, they can not add a read-only Nodebalancer to a firewall.
  const readOnlyNodebalancerIds = isRestrictedUser
    ? getEntityIdsByPermission(grants, 'nodebalancer', 'read_only')
    : [];

  const optionsFilter = (nodebalancer: NodeBalancer) => {
    return ![...currentNodebalancerIds, ...readOnlyNodebalancerIds].includes(
      nodebalancer.id
    );
  };

  const {
    data,
    error: nodebalancerError,
    isLoading: nodebalancerIsLoading,
  } = useAllNodeBalancersQuery();

  React.useEffect(() => {
    if (nodebalancerError) {
      setLocalError('Could not load NodeBalancer Data');
    }
  }, [nodebalancerError]);

  const nodebalancers = data?.filter(optionsFilter);

  const options =
    nodebalancers?.map((nodebalancer) => ({
      id: nodebalancer.id,
      label: nodebalancer.label,
    })) || [];

  const onChange = (selectedNodebalancers: OptionType[]) => {
    const result = mapIdsToDevices<NodeBalancer>(
      selectedNodebalancers.map((nodebalancer) => nodebalancer.id),
      nodebalancers
    );

    const mappedNodebalancers: NodeBalancer[] = Array.isArray(result)
      ? result
      : result
      ? [result]
      : [];

    setSelectedNodebalancers(mappedNodebalancers);
  };

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
        <Autocomplete<{ id: number; label: string }, true>
          disabled={currentDevicesLoading || nodebalancerIsLoading}
          helperText={helperText}
          isOptionEqualToValue={(option, value) => option.id == value.id}
          label="NodeBalancers"
          loading={currentDevicesLoading || nodebalancerIsLoading}
          multiple
          noOptionsText="No NodeBalancers available to add"
          onChange={(_, nodebalancers) => onChange(nodebalancers)}
          options={options}
          value={selectedNodebalancers}
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
