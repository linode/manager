import { Linode } from '@linode/api-v4';
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
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
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

  const { data: firewall } = useFirewallQuery(Number(id));
  const {
    data: currentDevices,
    isLoading: currentDevicesLoading,
  } = useAllFirewallDevicesQuery(Number(id));

  const { isLoading, mutateAsync: addDevice } = useAddFirewallDeviceMutation(
    Number(id)
  );

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
        enqueueSnackbar(`${label} added successfully.`, { variant: 'success' });
      } else {
        failedLinodes?.push(selectedLinodes[index]);
        const errorReason = getAPIErrorOrDefault(
          result.reason,
          `Failed to add Linode ${label} (ID ${id}).`
        )[0].reason;

        if (!firstError) {
          firstError = errorReason;
        }

        enqueueSnackbar(`Failed to add ${label}.`, { variant: 'error' });
      }
    });

    setLocalError(firstError);
    setSelectedLinodes(failedLinodes);

    if (!firstError) {
      onClose();
    }
  };

  const errorNotice = () => {
    let errorMsg = localError || '';
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
            fontSize: '1rem',
            fontWeight: 'bold',
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

  const currentLinodeIds =
    currentDevices
      ?.filter((device) => device.entity.type === 'linode')
      .map((device) => device.entity.id) ?? [];

  // If a user is restricted, they can not add a read-only Linode to a firewall.
  const readOnlyLinodeIds = isRestrictedUser
    ? getEntityIdsByPermission(grants, 'linode', 'read_only')
    : [];

  const optionsFilter = (linode: Linode) => {
    return ![...currentLinodeIds, ...readOnlyLinodeIds].includes(linode.id);
  };

  const {
    data,
    error: linodeError,
    isLoading: linodeIsLoading,
  } = useAllLinodesQuery();

  React.useEffect(() => {
    if (linodeError) {
      setLocalError('Could not load Linode Data');
    }
  }, [linodeError]);

  const linodes = data?.filter(optionsFilter);

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
        <Autocomplete
          disabled={currentDevicesLoading || linodeIsLoading}
          helperText={helperText}
          label="Linodes"
          loading={currentDevicesLoading || linodeIsLoading}
          multiple
          noOptionsText="No Linodes available to add"
          onChange={(_, linodes) => setSelectedLinodes(linodes)}
          options={linodes || []}
          value={selectedLinodes}
        />
        <ActionsPanel
          primaryButtonProps={{
            disabled: selectedLinodes.length === 0,
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
