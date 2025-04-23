import {
  Accordion,
  Box,
  CircleProgress,
  FormControlLabel,
  Notice,
  Stack,
  Toggle,
  Typography,
} from '@linode/ui';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import { useLinodeQuery, useLinodeUpdateMutation } from '@linode/queries';

interface Props {
  isReadOnly?: boolean;
  linodeId: number;
}

export const LinodeWatchdogPanel = (props: Props) => {
  const { isReadOnly, linodeId } = props;
  const { data: linode } = useLinodeQuery(linodeId);

  const {
    error,
    isPending,
    mutateAsync: updateLinode,
  } = useLinodeUpdateMutation(linodeId);

  return (
    <Accordion
      data-qa-watchdog-panel
      defaultExpanded
      heading="Shutdown Watchdog"
    >
      <Grid
        container
        spacing={2}
        sx={{
          alignItems: 'center',
        }}
      >
        {Boolean(error) && (
          <Grid size={12}>
            <Notice text={error?.[0].reason} variant="error" />
          </Grid>
        )}
        <Grid
          size={{
            md: 2,
            xs: 12,
          }}
        >
          <FormControlLabel
            aria-label={
              linode?.watchdog_enabled
                ? 'Shutdown Watchdog is enabled'
                : 'Shutdown Watchdog is disabled'
            }
            control={
              <Toggle
                onChange={(e, checked) =>
                  updateLinode({ watchdog_enabled: checked })
                }
                checked={linode?.watchdog_enabled ?? false}
                data-qa-watchdog-toggle={linode?.watchdog_enabled ?? false}
              />
            }
            label={
              <Stack alignItems="center" direction="row" spacing={1}>
                <Box>{linode?.watchdog_enabled ? 'Enabled' : 'Disabled'}</Box>
                <Box>{isPending && <CircleProgress size="sm" />}</Box>
              </Stack>
            }
            disabled={isReadOnly}
          />
        </Grid>
        <Grid
          size={{
            lg: 8,
            md: 10,
            xl: 6,
            xs: 12,
          }}
        >
          <Typography data-qa-watchdog-desc>
            Shutdown Watchdog, also known as Lassie, is a Linode Manager feature
            capable of automatically rebooting your Linode if it powers off
            unexpectedly. Lassie is not technically an availability monitoring
            tool, but it can help get your Linode back online fast if it’s
            accidentally powered off.
          </Typography>
        </Grid>
      </Grid>
    </Accordion>
  );
};
