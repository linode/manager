import { Namespace } from '@linode/api-v4/lib/cloudview/types';
import { Grid } from '@mui/material';
import React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Divider } from 'src/components/Divider';
import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { StyledContainerGrid } from 'src/features/Longview/shared/InstallationInstructions.styles';
import { useNamespaceApiKey } from 'src/queries/cloudview/namespaces';

interface Props {
  namespace: Namespace;
}
const NamespaceDetail = (props: Props) => {
  const { namespace } = props;
  const { data: data, isError, isLoading } = useNamespaceApiKey(namespace.id);
  if (isLoading) {
    return <CircleProgress />;
  }

  if (!data || isError) {
    return (
      <ErrorState errorText={'There was a problem in retrieving the api'} />
    );
  }
  const api_key = data.active_keys[0].api_key;
  return (
    <Paper>
      <Typography sx={{ width: '39em' }} variant="h3">
        Before this Namespace can store data, you need to install and configure
        your agents. After installation, it may be a few minutes before the
        Namespace begins receiving data.
      </Typography>
      <Stack sx={{ paddingTop: '15px', width: '55em' }}>
        <StyledContainerGrid paddingLeft="15px" spacing={2}>
          <CopyTooltip text={api_key} />
          <Grid paddingLeft="5px">
            <strong>API Key:</strong>
          </Grid>
          <Grid paddingLeft="7px">
            <code>{api_key}</code>
          </Grid>
        </StyledContainerGrid>
        <StyledContainerGrid paddingLeft="15px">
          <CopyTooltip text={namespace.urls.ingest} />
          <Grid paddingLeft="5px">
            <strong> Cloud View Endpoint: </strong>
          </Grid>
          <Grid paddingLeft="7px">
            <code>{namespace.urls.ingest}</code>
          </Grid>
        </StyledContainerGrid>
        <StyledContainerGrid paddingLeft="15px">
          <CopyTooltip text={namespace.urls.read} />
          <Grid paddingLeft="5px">
            <strong>Cloud View Read Endpoint: </strong>
          </Grid>
          <Grid paddingLeft="7px">
            <code>{namespace.urls.read}</code>
          </Grid>
        </StyledContainerGrid>
      </Stack>
      <Stack
        divider={
          <Divider dark flexItem orientation="vertical" variant="middle" />
        }
        direction="row"
        display="flex"
        paddingTop="15px"
        spacing={3}
      >
        <DocsLink
          href={'https://www.linode.com/docs/'}
          label="Troubleshooting guide"
        ></DocsLink>
        <DocsLink
          href={'https://www.linode.com/docs/'}
          label="Manual installation instructions"
        ></DocsLink>
      </Stack>
    </Paper>
  );
};

export default NamespaceDetail;
