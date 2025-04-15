import { getLinodeInterfaces, type Linode } from '@linode/api-v4';
import {
  useAddFirewallDeviceMutation,
  useAllFirewallsQuery,
  useGrants,
  useProfile,
} from '@linode/queries';
import { LinodeSelect } from '@linode/shared';
import { ActionsPanel, Drawer, Notice, Select } from '@linode/ui';
import { getEntityIdsByPermission } from '@linode/utilities';
import { useTheme } from '@mui/material';
import { useParams } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { NotFound } from 'src/components/NotFound';
import { SupportLink } from 'src/components/SupportLink';
import { getLinodeInterfaceType } from 'src/features/Linodes/LinodesDetail/LinodeNetworking/LinodeInterfaces/utilities';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

import type { LinodeInterface } from '@linode/api-v4';

interface Props {
  helperText: string;
  onClose: () => void;
  open: boolean;
}

interface LinodeInterfaceOption extends LinodeInterface {
  label: string;
  value: number;
}

interface LinodeWithMultiLinodeInterfaces extends Linode {
  linodeInterfaces: LinodeInterfaceOption[];
}

export const AddLinodeDrawer = (props: Props) => {
  const { helperText, onClose, open } = props;

  const { id } = useParams({ strict: false });

  const { enqueueSnackbar } = useSnackbar();

  const { data: grants } = useGrants();
  const { data: profile } = useProfile();
  const isRestrictedUser = Boolean(profile?.restricted);

  const { data, error, isLoading } = useAllFirewallsQuery();

  const firewall = data?.find((firewall) => firewall.id === Number(id));

  const theme = useTheme();

  const { isPending: addDeviceIsLoading, mutateAsync: addDevice } =
    useAddFirewallDeviceMutation();

  const [selectedLinodes, setSelectedLinodes] = React.useState<Linode[]>([]);
  // linode with single interfaces
  const [selectedSingleInterfaceIDs, setSelectedSingleInterfaceIDs] =
    React.useState<number[]>([]);
  // linode with multi interfaces keeping track of them
  const [linodesWithMultiInterfaces, setLinodesWithMultiInterfaces] =
    React.useState<LinodeWithMultiLinodeInterfaces[]>([]);
  const [linodeWithMultiInterfacesIdMap, setLinodeWithMultiInterfacesIdMap] =
    React.useState<Map<number, null | number>>(new Map());

  const [localError, setLocalError] = React.useState<string | undefined>(
    undefined
  );

  const handleSubmit = async () => {
    let linodeError: string | undefined = undefined;
    let interfaceError: string | undefined = undefined;
    const failedLinodes: Linode[] = [];
    const failedLinodeInterfaceIds: number[] = [];

    const linodeResults = await Promise.allSettled(
      selectedLinodes.map((linode) =>
        addDevice({ firewallId: Number(id), id: linode.id, type: 'linode' })
      )
    );

    const interfaceIdsFromMultiMap = Array.from(
      linodeWithMultiInterfacesIdMap.values()
    ).filter((val) => val !== null);

    const combinedInterfaceIds = [
      ...selectedSingleInterfaceIDs,
      ...interfaceIdsFromMultiMap,
    ];

    const interfaceResults = await Promise.allSettled(
      combinedInterfaceIds.map((interfaceId) =>
        addDevice({
          firewallId: Number(id),
          id: interfaceId,
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
      const id = combinedInterfaceIds[index];
      if (result.status === 'fulfilled') {
        enqueueSnackbar(`Interface (ID ${id}) successfully added.`, {
          variant: 'success',
        });
        return;
      }
      failedLinodeInterfaceIds?.push(id);
      const errorReason = getAPIErrorOrDefault(
        result.reason,
        `Failed to add Interface (ID ${id}).`
      )[0].reason;

      if (!interfaceError) {
        interfaceError = errorReason;
      }
    });

    setLocalError(linodeError ?? interfaceError);
    setSelectedLinodes(failedLinodes);
    // this is bad >> single and multi yikes
    setSelectedSingleInterfaceIDs(failedLinodeInterfaceIds);

    if (!linodeError && !interfaceError) {
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
  const readOnlyLinodeIds = isRestrictedUser
    ? getEntityIdsByPermission(grants, 'linode', 'read_only')
    : [];

  const assignedLinodes = data
    ?.map((firewall) => firewall.entities)
    .flat()
    ?.filter((service) => service.type === 'linode');

  const linodeOptionsFilter = (linode: Linode) => {
    return (
      !readOnlyLinodeIds.includes(linode.id) &&
      !assignedLinodes?.some((service) => service.id === linode.id)
    );
  };

  const onSelectionChange = async (linodes: Linode[]) => {
    const legacyLinodes: Linode[] = [];
    const interfaceLinodes: Linode[] = [];
    const singleInterfaceIds: number[] = [];
    const _linodeWithMultiInterfacesIdMap = new Map<number, null | number>(
      linodeWithMultiInterfacesIdMap
    );

    for (const linode of linodes) {
      if (linode.interface_generation === 'legacy_config') {
        legacyLinodes.push(linode);
      } else {
        interfaceLinodes.push(linode);
      }
    }
    setSelectedLinodes(legacyLinodes);

    const linodesWithMultiInterfaces = await Promise.all(
      interfaceLinodes.map(async (linode) => {
        const interfaces = await getLinodeInterfaces(linode.id);
        const nonVlanInterfaces = interfaces.interfaces.filter(
          (iface) => !iface.vlan
        );
        if (nonVlanInterfaces.length === 1) {
          singleInterfaceIds.push(nonVlanInterfaces[0].id);
        }
        if (nonVlanInterfaces.length > 1) {
          if (!_linodeWithMultiInterfacesIdMap.has(linode.id)) {
            _linodeWithMultiInterfacesIdMap.set(linode.id, null);
          }
          const interfacesWithLabels = nonVlanInterfaces.map((iface) => ({
            ...iface,
            label: `${getLinodeInterfaceType(iface)} Interface (ID : ${iface.id})`,
            value: iface.id,
          }));
          return {
            ...linode,
            linodeInterfaces: interfacesWithLabels,
          };
        }
        return null;
      })
    );

    const _linodesWithMultiInterfaces = linodesWithMultiInterfaces.filter(
      (item): item is LinodeWithMultiLinodeInterfaces => item !== null
    );

    setSelectedSingleInterfaceIDs(singleInterfaceIds);
    setLinodesWithMultiInterfaces(_linodesWithMultiInterfaces);
    setLinodeWithMultiInterfacesIdMap(_linodeWithMultiInterfacesIdMap);
  };

  // how do i filter in advance for linode interfaces???????????????? i am struggling fr rn
  // idea: keep track of linodes with multi interfaces in that state ^, then have selects for each of them
  // something something promise.all ({ type: interface, id: interfaceId }) post firewall device

  React.useEffect(() => {
    if (error) {
      setLocalError('Could not load firewall data');
    }
  }, [error]);

  return (
    <Drawer
      NotFoundComponent={NotFound}
      onClose={() => {
        setSelectedLinodes([]);
        setLocalError(undefined);
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
        {localError ? errorNotice() : null}
        <LinodeSelect
          disabled={isLoading}
          helperText={helperText}
          multiple
          onSelectionChange={(linodes) => onSelectionChange(linodes)}
          optionsFilter={linodeOptionsFilter}
          value={selectedLinodes.map((linode) => linode.id)}
        />
        {linodesWithMultiInterfaces.map((linode) => (
          <Select
            key={linode.id}
            label={`${linode.label} Interfaces`}
            onChange={(e, option) => {
              linodeWithMultiInterfacesIdMap.set(linode.id, option.id);
            }}
            options={linode.linodeInterfaces}
            value={
              linode.linodeInterfaces.find(
                (iface) =>
                  iface.id === linodeWithMultiInterfacesIdMap.get(linode.id)
              ) ?? null
            }
          />
        ))}
        <ActionsPanel
          primaryButtonProps={{
            disabled: selectedLinodes.length === 0,
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
