import { Autocomplete, Divider, Paper, Stack, Typography } from '@linode/ui';
import { styled } from '@mui/material';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';

export const Quotas = () => {
  return (
    <>
      <DocumentTitleSegment segment="Quotas" />
      <MainStack spacing={2}>
        <Typography variant="h3">Quotas</Typography>
        <Paper>
          <Stack divider={<Divider spacingBottom={20} spacingTop={40} />}>
            <Stack spacing={1}>
              <Autocomplete label="Select a Service" options={[]} />
              <RegionSelect
                currentCapability={undefined}
                regions={[]}
                value={undefined}
              />
            </Stack>
            <Stack>
              <Stack direction="row-reverse">
                <Link to="#">Learn More About Quotas</Link>
              </Stack>
              <Typography variant="h3">Quotas</Typography>
            </Stack>
          </Stack>
        </Paper>
      </MainStack>
    </>
  );
};

const MainStack = styled(Stack, { label: 'MainStack' })(({ theme }) => ({
  marginTop: theme.spacing(2),
}));
