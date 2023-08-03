import { Box, CircularProgress, Stack } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Accordion } from 'src/components/Accordion';
import { Notice } from 'src/components/Notice/Notice';
import { Toggle } from 'src/components/Toggle';
import { Typography } from 'src/components/Typography';
import { FormControlLabel } from 'src/components/FormControlLabel';
import {
  useLinodeQuery,
  useLinodeUpdateMutation,
} from 'src/queries/linodes/linodes';

interface Props {
  isReadOnly?: boolean;
  linodeId: number;
}

export const LinodeWatchdogPanel = (props: Props) => {
  const { isReadOnly, linodeId } = props;
  const { data: linode } = useLinodeQuery(linodeId);

  const {
    error,
    isLoading,
    mutateAsync: updateLinode,
  } = useLinodeUpdateMutation(linodeId);

  return (
    <Accordion
      data-qa-watchdog-panel
      defaultExpanded
      heading="Shutdown Watchdog"
    >
      <Grid alignItems="center" container spacing={2}>
        {Boolean(error) && (
          <Grid xs={12}>
            <Notice error text={error?.[0].reason} />
          </Grid>
        )}
        <Grid md={2} xs={12}>
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
                <Box>{isLoading && <CircularProgress size={16} />}</Box>
              </Stack>
            }
            disabled={isReadOnly}
          />
        </Grid>
        <Grid lg={8} md={10} xl={6} xs={12}>
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
