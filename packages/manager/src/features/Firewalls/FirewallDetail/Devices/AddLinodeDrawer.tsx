import { Linode } from '@linode/api-v4';
import { useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useParams } from 'react-router-dom';
import sanitize from 'sanitize-html';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { SupportLink } from 'src/components/SupportLink';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';
import { useFlags } from 'src/hooks/useFlags';
import {
  useAddFirewallDeviceMutation,
  useAllFirewallsQuery,
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

  const { data, error, isLoading } = useAllFirewallsQuery();
  const flags = useFlags();

  const firewall = data?.find((firewall) => firewall.id === Number(id));

  const theme = useTheme();

  const {
    isLoading: addDeviceIsLoading,
    mutateAsync: addDevice,
  } = useAddFirewallDeviceMutation(Number(id));

  const [selectedLinodes, setSelectedLinodes] = React.useState<Linode[]>([]);

  const [localError, setLocalError] = React.useState<string | undefined>(
    undefined
  );

  const handleSubmit = async () => {
    let firstError: string | undefined = undefined;
    const failedLinodes: Linode[] = [];

    const results = await Promise.allSettled(
      selectedLinodes.map((linode) =>
        addDevice({ id: linode.id, type: 'linode' })
      )
    );

    results.forEach((result, index) => {
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

      if (!firstError) {
        firstError = errorReason;
      }
    });

    setLocalError(firstError);
    setSelectedLinodes(failedLinodes);

    if (!firstError) {
      onClose();
    }
  };

  const errorNotice = () => {
    let errorMsg = sanitize(localError || '', {
      allowedAttributes: {},
      allowedTags: [], // Disallow all HTML tags,
    });
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
            fontFamily: theme.font.bold,
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

  const linodeOptionsFilter = (() => {
    // When `firewallNodebalancer` feature flag is disabled, no filtering
    // occurs. In this case, pass a filter callback that always returns `true`.
    if (!flags.firewallNodebalancer) {
      return () => true;
    }

    const assignedLinodes = data
      ?.map((firewall) => firewall.entities)
      .flat()
      ?.filter((service) => service.type === 'linode');

    return (linode: Linode) => {
      return (
        !readOnlyLinodeIds.includes(linode.id) &&
        !assignedLinodes?.some((service) => service.id === linode.id)
      );
    };
  })();

  React.useEffect(() => {
    if (error) {
      setLocalError('Could not load firewall data');
    }
  }, [error]);

  return (
    <Drawer
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
          data-testid="add-linode-autocomplete"
          disabled={isLoading}
          helperText={helperText}
          multiple
          onSelectionChange={(linodes) => setSelectedLinodes(linodes)}
          optionsFilter={linodeOptionsFilter}
          value={selectedLinodes.map((linode) => linode.id)}
        />
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
