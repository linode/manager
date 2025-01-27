/* eslint-disable @typescript-eslint/no-unused-vars */
import { Autocomplete, Divider, Paper, Stack, Typography } from '@linode/ui';
import { DateTime } from 'luxon';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';

import type { Theme } from '@mui/material';

export const Quotas = () => {
  // @ts-expect-error TODO: this is a placeholder to be replaced with the actual query
  const [lastUpdatedDate, setLastUpdatedDate] = React.useState(Date.now());

  return (
    <>
      <DocumentTitleSegment segment="Quotas" />
      <Paper
        sx={(theme: Theme) => ({
          marginTop: theme.spacing(2),
        })}
        variant="outlined"
      >
        <Stack divider={<Divider spacingBottom={20} spacingTop={40} />}>
          <Stack spacing={1}>
            <Autocomplete label="Select a Service" options={[]} />
            <RegionSelect
              currentCapability={undefined}
              regions={[]}
              value={undefined}
            />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h3">Quotas</Typography>
            <Stack alignItems="center" direction="row" spacing={3}>
              <Typography variant="body1">
                <strong>Last updated:</strong>{' '}
                <DateTimeDisplay
                  value={DateTime.fromMillis(lastUpdatedDate).toISO() ?? ''}
                />
              </Typography>

              {/* TODO: update once link is available */}
              <DocsLink href="#" label="Learn More About Quotas" />
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </>
  );
};
