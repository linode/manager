import {
  useAllFirewallsQuery,
  useFirewallSettingsQuery,
  useMutateFirewallSettings,
} from '@linode/queries';
import {
  Accordion,
  BetaChip,
  Box,
  Button,
  CircleProgress,
  ErrorState,
  Select,
  Stack,
  Typography,
} from '@linode/ui';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';

import type { UpdateFirewallSettings } from '@linode/api-v4';

export const DefaultFirewalls = () => {
  const {
    data: firewallSettings,
    error: firewallSettingsError,
    isLoading: isLoadingFirewallSettings,
  } = useFirewallSettingsQuery();

  const { mutateAsync: updateFirewallSettings } = useMutateFirewallSettings();

  const {
    data: firewalls,
    error: firewallsError,
    isLoading: isLoadingfirewalls,
  } = useAllFirewallsQuery();

  // const values = {
  //   default_firewall_ids: firewallSettings?.default_firewall_ids ?? {}
  // }

  const {
    control,
    formState: { isDirty, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<UpdateFirewallSettings>({
    defaultValues: { ...firewallSettings },
  });

  if (isLoadingFirewallSettings || isLoadingfirewalls) {
    return (
      <Accordion defaultExpanded heading="Default Firewalls">
        <CircleProgress />
      </Accordion>
    );
  }

  if (firewallSettingsError || firewallsError) {
    return (
      <Accordion defaultExpanded heading="Default Firewalls">
        <ErrorState errorText="Unable to load your firewall settings and firewalls." />
      </Accordion>
    );
  }

  return (
    <Accordion defaultExpanded heading="Default Firewalls">
      <Typography>
        Choose the preferred firewall to be assigned for each type of
        interface/connection
      </Typography>
      <form>
        <Typography>
          <strong>Linodes - Configuration Profile Interfaces</strong>
        </Typography>
        <Box
          sx={(theme) => ({
            marginTop: theme.spacing(2),
          })}
        >
          <Button
            buttonType="outlined"
            disabled={!isDirty}
            loading={isSubmitting}
            type="submit"
          >
            Save
          </Button>
        </Box>
      </form>
    </Accordion>
  );
};
