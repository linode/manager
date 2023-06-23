import * as React from 'react';
import Accordion from 'src/components/Accordion';
import FormControlLabel from 'src/components/core/FormControlLabel';
import Typography from 'src/components/core/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { Notice } from 'src/components/Notice/Notice';
import { Toggle } from 'src/components/Toggle';
import {
  useLinodeQuery,
  useLinodeUpdateMutation,
} from 'src/queries/linodes/linodes';
import { Box, CircularProgress, Stack } from '@mui/material';

interface Props {
  linodeId: number;
  isReadOnly?: boolean;
}

export const LinodeWatchdogPanel = ({ isReadOnly, linodeId }: Props) => {
  const { data: linode } = useLinodeQuery(linodeId);

  const {
    error,
    isLoading,
    mutateAsync: updateLinode,
  } = useLinodeUpdateMutation(linodeId);

  return (
    <Accordion
      heading="Shutdown Watchdog"
      defaultExpanded
      data-qa-watchdog-panel
    >
      <Grid container alignItems="center" spacing={2}>
        {Boolean(error) && (
          <Grid xs={12}>
            <Notice error text={error?.[0].reason} />
          </Grid>
        )}
        <Grid xs={12} md={2}>
          <FormControlLabel
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
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box>{linode?.watchdog_enabled ? 'Enabled' : 'Disabled'}</Box>
                <Box>{isLoading && <CircularProgress size={16} />}</Box>
              </Stack>
            }
            aria-label={
              linode?.watchdog_enabled
                ? 'Shutdown Watchdog is enabled'
                : 'Shutdown Watchdog is disabled'
            }
            disabled={isReadOnly}
          />
        </Grid>
        <Grid xs={12} md={10} lg={8} xl={6}>
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
