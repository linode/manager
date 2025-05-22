import { getLinodeInterfaces } from '@linode/api-v4';
import {
  useAddFirewallDeviceMutation,
  useAllFirewallsQuery,
  useAllLinodesQuery,
  useGrants,
  useProfile,
} from '@linode/queries';
import { LinodeSelect } from '@linode/shared';
import { ActionsPanel, Drawer, Notice, Select, Typography } from '@linode/ui';
import { getEntityIdsByPermission } from '@linode/utilities';
import { useTheme } from '@mui/material';
import { useParams } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { SupportLink } from 'src/components/SupportLink';
import { getLinodeInterfaceType } from 'src/features/Linodes/LinodesDetail/LinodeNetworking/LinodeInterfaces/utilities';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

import type { Linode, LinodeInterface } from '@linode/api-v4';

interface Props {
  helperText: string;
  onClose: () => void;
  open: boolean;
}

interface LinodeInterfaceOption extends LinodeInterface {
  label: string;
  value: number;
}

interface InterfaceDeviceInfo {
  interfaceId: number;
  linodeId: number;
  linodeLabel: string;
}

interface LinodeWithMultipleLinodeInterfaces {
  linodeId: number;
  linodeInterfaces: LinodeInterfaceOption[];
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
  const { data: allLinodes } = useAllLinodesQuery({}, {});
  const [linodeOptions, setLinodeOptions] = React.useState<Linode[]>([]);

  const firewall = data?.find((firewall) => firewall.id === Number(id));

  const theme = useTheme();

  const { isPending: addDeviceIsLoading, mutateAsync: addDevice } =
    useAddFirewallDeviceMutation();

  // Keep track of Linodes to add using configuration profile interfaces
  const [linodesToAdd, setLinodesToAdd] = React.useState<Linode[]>([]);
  // Keep track of interface devices to be added, mapping Linode ID to selected interface
  const [interfacesToAddMap, setInterfacesToAddMap] = React.useState<
    Map<number, InterfaceDeviceInfo | null>
  >(new Map());
  // Keep track of the linodes with multiple eligible linode interfaces to determine additional selects to show
  // Once an interface is selected, interfacesToAddMap will be updated for that Linode ID
  const [linodesWithMultipleInterfaces, setLinodesWithMultipleInterfaces] =
    React.useState<LinodeWithMultipleLinodeInterfaces[]>([]);

  const [localError, setLocalError] = React.useState<string | undefined>(
    undefined
  );

  const handleSubmit = async () => {
    let linodeError: string | undefined = undefined;
    let interfaceError: string | undefined = undefined;
    const failedLinodes: Linode[] = [];
    const failedInterfaces: Map<number, InterfaceDeviceInfo | null> = new Map();
    const failedLinodesWithMultipleInterfaces: LinodeWithMultipleLinodeInterfaces[] =
      [];

    const linodeResults = await Promise.allSettled(
      linodesToAdd.map((linode) =>
        addDevice({ firewallId: Number(id), id: linode.id, type: 'linode' })
      )
    );

    const interfacesToAdd = Array.from(interfacesToAddMap.values()).filter(
      (ifaceInfo) => ifaceInfo !== null
    );
    const interfaceResults = await Promise.allSettled(
      interfacesToAdd.map((interfaceInfo) =>
        addDevice({
          firewallId: Number(id),
          id: interfaceInfo.interfaceId,
          type: 'interface',
        })
      )
    );

    linodeResults.forEach((result, index) => {
      const label = linodesToAdd[index].label;
      const id = linodesToAdd[index].id;
      if (result.status === 'fulfilled') {
        enqueueSnackbar(`Linode ${label} successfully added.`, {
          variant: 'success',
        });
        return;
      }
      failedLinodes?.push(linodesToAdd[index]);
      const errorReason = getAPIErrorOrDefault(
        result.reason,
        `Failed to add Linode ${label} (ID ${id}).`
      )[0].reason;

      if (!linodeError) {
        linodeError = errorReason;
      }
    });

    interfaceResults.forEach((result, index) => {
      const ifaceInfo = interfacesToAdd[index];
      if (result.status === 'fulfilled') {
        enqueueSnackbar(
          `Interface (ID ${ifaceInfo.interfaceId}) from Linode ${ifaceInfo.linodeLabel} successfully added.`,
          {
            variant: 'success',
          }
        );
        return;
      }
      failedInterfaces.set(ifaceInfo.linodeId, ifaceInfo);
      const failedLinodeAndInterfaces = linodesWithMultipleInterfaces.find(
        (linode) => linode.linodeId === ifaceInfo.linodeId
      );
      if (failedLinodeAndInterfaces) {
        failedLinodesWithMultipleInterfaces.push(failedLinodeAndInterfaces);
      }
      const errorReason = getAPIErrorOrDefault(
        result.reason,
        `Failed to add Interface (ID ${ifaceInfo.interfaceId}) from Linode ${ifaceInfo.linodeLabel}.`
      )[0].reason;

      if (!interfaceError) {
        interfaceError = errorReason;
      }
    });

    setLocalError(linodeError ?? interfaceError);
    setLinodesToAdd(failedLinodes);
    setInterfacesToAddMap(failedInterfaces);
    setLinodesWithMultipleInterfaces(failedLinodesWithMultipleInterfaces);

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

  // If a user is restricted, they can not add a read-only Linode to a firewall.
  const readOnlyLinodeIds = React.useMemo(
    () =>
      isRestrictedUser
        ? getEntityIdsByPermission(grants, 'linode', 'read_only')
        : [],
    [grants, isRestrictedUser]
  );

  const firewallEntities = React.useMemo(
    () => data?.map((firewall) => firewall.entities).flat(),
    [data]
  );

  const assignedLinodes = React.useMemo(
    () => firewallEntities?.filter((service) => service.type === 'linode'),
    [firewallEntities]
  );

  const assignedInterfaceIds = React.useMemo(
    () =>
      new Set<number>(
        firewallEntities
          ?.filter((service) => service.type === 'interface')
          ?.map((service) => service.id) ?? []
      ),
    [firewallEntities]
  );

  const onSelectionChange = async (linodes: Linode[]) => {
    setLocalError('');
    const legacyLinodes: Linode[] = [];
    const interfaceLinodes: Linode[] = [];
    const _interfacesToAddMap = new Map<number, InterfaceDeviceInfo | null>();

    for (const linode of linodes) {
      if (linode.interface_generation === 'linode') {
        interfaceLinodes.push(linode);
      } else {
        legacyLinodes.push(linode);
      }
    }

    setLinodesToAdd(legacyLinodes);

    const linodesWithMultipleInterfaces = await Promise.all(
      interfaceLinodes.map(async (linode) => {
        const linodeId = linode.id;
        const interfaces = await getLinodeInterfaces(linodeId);
        // vlan interfaces cannot have a firewall assigned to them
        const assignableInterfaces = interfaces.interfaces.filter(
          (iface) => !iface.vlan && !assignedInterfaceIds.has(iface.id)
        );

        if (assignableInterfaces.length === 1) {
          _interfacesToAddMap.set(linodeId, {
            linodeId,
            linodeLabel: linode.label,
            interfaceId: assignableInterfaces[0].id,
          });
        }

        if (assignableInterfaces.length > 1) {
          if (!interfacesToAddMap.has(linodeId)) {
            _interfacesToAddMap.set(linodeId, null);
          } else {
            _interfacesToAddMap.set(
              linodeId,
              interfacesToAddMap.get(linodeId) ?? null
            );
          }

          const interfacesWithLabels = assignableInterfaces.map((iface) => ({
            ...iface,
            label: `${getLinodeInterfaceType(iface)} Interface (ID: ${iface.id})`,
            value: iface.id,
          }));

          return {
            linodeId,
            linodeLabel: linode.label,
            linodeInterfaces: interfacesWithLabels,
          };
        }

        return null;
      })
    );

    const _linodesWithMultipleInterfaces = linodesWithMultipleInterfaces.filter(
      (item): item is LinodeWithMultipleLinodeInterfaces => item !== null
    );

    setLinodesWithMultipleInterfaces(_linodesWithMultipleInterfaces);
    setInterfacesToAddMap(_interfacesToAddMap);
  };

  const handleClose = () => {
    setLinodesToAdd([]);
    setInterfacesToAddMap(new Map());
    setLinodesWithMultipleInterfaces([]);
    setLocalError(undefined);
    onClose();
  };

  React.useEffect(() => {
    const linodeOptionsFilter = async (linode: Linode) => {
      if (linode.interface_generation === 'linode') {
        const interfaces = await getLinodeInterfaces(linode.id);
        // Return true if Linode has some non-vlan interface that is not assigned to a firewall
        return (
          !readOnlyLinodeIds.includes(linode.id) &&
          interfaces.interfaces.some(
            (iface) => !iface.vlan && !assignedInterfaceIds.has(iface.id)
          )
        );
      }
      return (
        !readOnlyLinodeIds.includes(linode.id) &&
        !assignedLinodes?.some((service) => service.id === linode.id)
      );
    };

    const filterLinodes = async () => {
      const asyncFilteredDataPromises = allLinodes?.map((linode) =>
        linodeOptionsFilter(linode)
      );
      const predicateArr = await Promise.all(asyncFilteredDataPromises ?? []);
      const filteredLinodes = allLinodes?.filter((_, idx) => predicateArr[idx]);

      setLinodeOptions(filteredLinodes ?? []);
    };

    filterLinodes();
  }, [allLinodes, assignedInterfaceIds, assignedLinodes, readOnlyLinodeIds]);

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

        {/* ******************************************************************************************************* */}
        <LinodeSelect
          disabled={isLoading}
          helperText={helperText}
          multiple
          onSelectionChange={(linodes) => onSelectionChange(linodes)}
          options={linodeOptions}
          value={[
            ...linodesToAdd.map((linode) => linode.id),
            ...Array.from(interfacesToAddMap.keys()),
          ]}
        />
        {/* ******************************************************************************************************* */}

        {isLinodeInterfacesEnabled &&
          linodesWithMultipleInterfaces.length > 0 && (
            <Typography marginTop={3}>
              {`${linodesWithMultipleInterfaces.length === 1 ? 'This Linode has' : 'The following Linodes have'} 
            multiple interfaces that a firewall can be applied to. Select which interface to apply the firewall to.`}
            </Typography>
          )}
        {isLinodeInterfacesEnabled &&
          linodesWithMultipleInterfaces.map((linode) => (
            <Select
              key={linode.linodeId}
              label={`${linode.linodeLabel} Interface`}
              onChange={(e, option) => {
                const updatedInterfacesToAdd = new Map(interfacesToAddMap);
                updatedInterfacesToAdd.set(linode.linodeId, {
                  linodeId: linode.linodeId,
                  linodeLabel: linode.linodeLabel,
                  interfaceId: option.value,
                });
                setInterfacesToAddMap(updatedInterfacesToAdd);
              }}
              options={linode.linodeInterfaces}
              placeholder="Select Interface"
              value={
                linode.linodeInterfaces.find(
                  (iface) =>
                    iface.id ===
                    interfacesToAddMap.get(linode.linodeId)?.interfaceId
                ) ?? null
              }
            />
          ))}
        <ActionsPanel
          primaryButtonProps={{
            disabled:
              (linodesToAdd.length === 0 && interfacesToAddMap.size === 0) ||
              Array.from(interfacesToAddMap.values()).some(
                (iface) => iface === null
              ),
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
