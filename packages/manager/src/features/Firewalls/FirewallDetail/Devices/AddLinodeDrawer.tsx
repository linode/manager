import {
  linodeQueries,
  useAddFirewallDeviceMutation,
  useAllFirewallsQuery,
  useAllLinodesQuery,
  useGrants,
  useProfile,
} from '@linode/queries';
import { LinodeSelect } from '@linode/shared';
import {
  ActionsPanel,
  Autocomplete,
  Drawer,
  Notice,
  Typography,
} from '@linode/ui';
import { getEntityIdsByPermission } from '@linode/utilities';
import { useTheme } from '@mui/material';
import { useQueries } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { SupportLink } from 'src/components/SupportLink';
import { getLinodeInterfaceType } from 'src/features/Linodes/LinodesDetail/LinodeNetworking/LinodeInterfaces/utilities';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

import type { Linode, LinodeInterfaces } from '@linode/api-v4';

interface Props {
  helperText: string;
  onClose: () => void;
  open: boolean;
}

interface InterfaceDeviceInfo {
  interfaceId: number;
  linodeId: number;
  linodeLabel: string;
}

export const AddLinodeDrawer = (props: Props) => {
  const { helperText, onClose, open } = props;

  const { id } = useParams({ strict: false });

  const { enqueueSnackbar } = useSnackbar();

  const { data: grants } = useGrants();
  const { data: profile } = useProfile();
  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();
  const isRestrictedUser = Boolean(profile?.restricted);

  const { data, error, isLoading } = useAllFirewallsQuery();

  const firewall = data?.find((firewall) => firewall.id === Number(id));

  const { data: allLinodes } = useAllLinodesQuery({}, {});

  const linodesUsingLinodeInterfaces =
    allLinodes?.filter((l) => l.interface_generation === 'linode') ?? [];

  const allFirewallEntities = React.useMemo(
    () =>
      data
        ?.map((firewall) => {
          return firewall.entities.map((entity) => {
            return {
              ...entity,
              firewallStatus: firewall.status,
            };
          });
        })
        .flat(),
    [data]
  );

  // We can assign multiple firewalls to an entity as long as:
  // - this (disabled) firewall doesn't have the entity
  // - this (enabled) firewall doesn't have this entity and the entity is not assigned to another already enabled firewall
  const canBeAssignedToFirewall = (inputs: {
    entityId: number;
    entityType: 'interface' | 'linode';
  }) => {
    const { entityId, entityType } = inputs;
    return firewall?.status !== 'enabled'
      ? !firewall?.entities.some(
          (entity) => entity.type === entityType && entity.id === entityId
        )
      : !allFirewallEntities?.some(
          (service) =>
            service.id === entityId && service.firewallStatus === 'enabled'
        );
  };

  // If a user is restricted, they can not add a read-only Linode to a firewall.
  const readOnlyLinodeIds = React.useMemo(
    () =>
      isRestrictedUser
        ? getEntityIdsByPermission(grants, 'linode', 'read_only')
        : [],
    [grants, isRestrictedUser]
  );

  // Keeps track of Linode and its eliglbe Linode Interfaces: Linode has at least one non-vlan interface that can be assigned to a firewall
  // Key is Linode ID. Value is an object containing the Linode object and the Linode's interfaces
  const linodesAndEligibleInterfaces = useQueries({
    queries:
      linodesUsingLinodeInterfaces?.map(
        (linode) =>
          linodeQueries.linode(linode.id)._ctx.interfaces._ctx.interfaces
      ) ?? [],
    combine(result) {
      return result.reduce<
        Record<
          number,
          { interfaces: LinodeInterfaces['interfaces']; linode: Linode }
        >
      >((acc, res, index) => {
        if (res.data) {
          const eligibleInterfaces = res.data.interfaces.filter(
            (iface) =>
              !iface.vlan &&
              canBeAssignedToFirewall({
                entityType: 'interface',
                entityId: iface.id,
              })
          );
          if (eligibleInterfaces.length > 0) {
            acc[linodesUsingLinodeInterfaces[index].id] = {
              interfaces: eligibleInterfaces,
              linode: linodesUsingLinodeInterfaces[index],
            };
          }
        }
        return acc;
      }, {});
    },
  });

  const linodesWithMultipleInterfaces = Object.values(
    linodesAndEligibleInterfaces
  )
    .filter(({ interfaces }) => interfaces.length > 1)
    .map(({ linode }) => linode);

  const linodeOptions = allLinodes?.filter((linode) => {
    // Exclude read only Linodes
    if (readOnlyLinodeIds.includes(linode.id)) {
      return false;
    }

    // Exclude a Linode if it uses Linode Interfaces and has no eligible interfaces
    if (linode.interface_generation === 'linode') {
      return Boolean(linodesAndEligibleInterfaces[linode.id]);
    }

    // Lastly, confirm if Linode using legacy interfaces can be assigned
    return canBeAssignedToFirewall({
      entityType: 'linode',
      entityId: linode.id,
    });
  });

  const theme = useTheme();

  const { isPending: addDeviceIsLoading, mutateAsync: addDevice } =
    useAddFirewallDeviceMutation();

  const [selectedLinodes, setSelectedLinodes] = React.useState<Linode[]>([]);
  const selectedLinodesWithMultipleInterfaces =
    linodesWithMultipleInterfaces.filter((linode) =>
      selectedLinodes.includes(linode)
    );

  // Keeps track of interfaces we've selected from Linodes with multiple Linodes
  // Assumption: each Linode ID here will correspond to some Linode in selectedLinodesWithMultipleInterfaces,
  // but the vice versa may not always be true (eg: selected a Linode with multiple interfaces, but haven't selected an interface for that Linode yet)
  // Key is the Linode ID, value is the interface to add
  const [selectedIfacesToAdd, setSelectedIfacesToAdd] = React.useState<
    Record<number, InterfaceDeviceInfo>
  >({});

  const [localError, setLocalError] = React.useState<string | undefined>(
    undefined
  );

  const handleSubmit = async () => {
    let linodeError: string | undefined = undefined;
    let interfaceError: string | undefined = undefined;
    const linodesNeedingInterfaceSelection =
      selectedLinodesWithMultipleInterfaces.filter(
        (linode) => !selectedIfacesToAdd[linode.id]
      );
    const failedLinodes: Linode[] = [...linodesNeedingInterfaceSelection];
    const failedInterfaces: Record<number, InterfaceDeviceInfo> = {};

    const linodeResults = await Promise.allSettled(
      selectedLinodes
        .filter(
          (selectedLinode) => selectedLinode.interface_generation !== 'linode'
        )
        .map((linode) =>
          addDevice({ firewallId: Number(id), id: linode.id, type: 'linode' })
        )
    );

    // When a Linode uses Linode Interfaces and it only has one eligible interface, we don't show the
    // Interface select for that Linode. Therefore, here, we need to make sure we add the single
    // interface if the linode is selected.
    const interfaceInfos: InterfaceDeviceInfo[] = [];
    for (const { linode, interfaces } of Object.values(
      linodesAndEligibleInterfaces
    )) {
      if (selectedLinodes.includes(linode) && interfaces.length === 1) {
        interfaceInfos.push({
          interfaceId: interfaces[0].id,
          linodeId: linode.id,
          linodeLabel: linode.label,
        });
      }
    }

    // Otherwise, we add the interfaces we explicitly selected
    for (const linodeId in selectedIfacesToAdd) {
      if (selectedLinodes.some((l) => l.id === Number(linodeId))) {
        interfaceInfos.push(selectedIfacesToAdd[linodeId]);
      }
    }

    const interfaceResults = await Promise.allSettled(
      interfaceInfos.map((interfaceInfo) =>
        addDevice({
          firewallId: Number(id),
          id: interfaceInfo.interfaceId,
          type: 'interface',
        })
      )
    );

    linodeResults.forEach((result, index) => {
      const label = selectedLinodes[index].label;
      const id = selectedLinodes[index].id;
      if (result.status === 'fulfilled') {
        enqueueSnackbar(`Linode ${label} successfully added.`, {
          variant: 'success',
        });
        return;
      }
      failedLinodes?.push(selectedLinodes[index]);
      const errorReason = getAPIErrorOrDefault(
        result.reason,
        `Failed to add Linode ${label} (ID ${id}).`
      )[0].reason;

      if (!linodeError) {
        linodeError = errorReason;
      }
    });

    interfaceResults.forEach((result, index) => {
      const ifaceInfo = interfaceInfos[index];
      if (result.status === 'fulfilled') {
        enqueueSnackbar(
          `Interface (ID ${ifaceInfo.interfaceId}) from Linode ${ifaceInfo.linodeLabel} successfully added.`,
          {
            variant: 'success',
          }
        );
        return;
      }
      failedInterfaces[ifaceInfo.linodeId] = ifaceInfo;
      const failedLinode = selectedLinodes.find(
        (linode) => linode.id === ifaceInfo.linodeId
      );
      if (failedLinode) {
        failedLinodes.push(failedLinode);
      }
      const errorReason = getAPIErrorOrDefault(
        result.reason,
        `Failed to add Interface (ID ${ifaceInfo.interfaceId}) from Linode ${ifaceInfo.linodeLabel}.`
      )[0].reason;
      if (!interfaceError) {
        interfaceError = errorReason;
      }
    });

    if (linodesNeedingInterfaceSelection.length > 0) {
      interfaceError =
        'You must select an interface to assign to this Firewall.';
    }

    setLocalError(linodeError ?? interfaceError);
    setSelectedLinodes(failedLinodes);
    setSelectedIfacesToAdd(failedInterfaces);

    if (!linodeError && !interfaceError) {
      handleClose();
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
    // match something like: Linode <linode_label> (ID <linode_id>)

    const linode = /Linode (.+?) \(ID ([^\)]+)\)/i.exec(errorMsg);
    const openTicket = errorMsg.match(/open a support ticket\./i);

    if (openTicket) {
      errorMsg = errorMsg.replace(/open a support ticket\./i, '');
    }

    if (linode) {
      const [, label, id] = linode;

      // Break the errorMsg into two parts: before and after the linode pattern
      const startMsg = errorMsg.substring(
        0,
        errorMsg.indexOf(`Linode ${label}`)
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
          <Link to={`/linodes/${id}`}>{label}</Link>
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

  const onSelectionChange = async (linodes: Linode[]) => {
    setSelectedLinodes(linodes);
  };

  const handleClose = () => {
    setSelectedLinodes([]);
    setSelectedIfacesToAdd({});
    setLocalError(undefined);
    onClose();
  };

  React.useEffect(() => {
    if (error) {
      setLocalError('Could not load firewall data');
    }
  }, [error]);

  return (
    <Drawer
      onClose={handleClose}
      open={open}
      title={`Add Linode to Firewall: ${firewall?.label}`}
    >
      <form
        onSubmit={(e: React.ChangeEvent<HTMLFormElement>) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {localError ? errorNotice() : null}
        <LinodeSelect
          disabled={isLoading}
          helperText={helperText}
          multiple
          onSelectionChange={(linodes) => onSelectionChange(linodes)}
          options={linodeOptions}
          value={selectedLinodes.map((l) => l.id)}
        />
        {isLinodeInterfacesEnabled &&
          selectedLinodesWithMultipleInterfaces.length > 0 && (
            <Typography marginTop={3}>
              {`${selectedLinodesWithMultipleInterfaces.length === 1 ? 'This Linode has' : 'The following Linodes have'} 
            multiple interfaces that a firewall can be applied to. Select which interface to apply the firewall to.`}
            </Typography>
          )}
        {isLinodeInterfacesEnabled &&
          selectedLinodesWithMultipleInterfaces.map((linode) => {
            const options = linodesAndEligibleInterfaces[
              linode.id
            ].interfaces.map((i) => ({
              ...i,
              label: `${getLinodeInterfaceType(i)} Interface (ID: ${i.id})`,
            }));
            return (
              <Autocomplete
                disableClearable
                key={linode.id}
                label={`${linode.label} Interface`}
                onChange={(e, option) => {
                  setSelectedIfacesToAdd((prev) => {
                    const newInterfacesToAdd = { ...prev };
                    newInterfacesToAdd[linode.id] = {
                      linodeId: linode.id,
                      linodeLabel: linode.label,
                      interfaceId: option.id,
                    };
                    return newInterfacesToAdd;
                  });
                }}
                options={options}
                placeholder="Select Interface"
                value={options.find(
                  (iface) =>
                    selectedIfacesToAdd[linode.id]?.interfaceId === iface.id
                )}
              />
            );
          })}
        <ActionsPanel
          primaryButtonProps={{
            label: 'Add',
            loading: addDeviceIsLoading,
            onClick: handleSubmit,
          }}
          secondaryButtonProps={{
            label: 'Cancel',
            onClick: handleClose,
          }}
        />
      </form>
    </Drawer>
  );
};
