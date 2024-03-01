import Grid from '@mui/material/Grid/Grid';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { CircleProgress } from 'src/components/CircleProgress';
import {
  CollapsibleTable,
  TableItem,
} from 'src/components/CollapsibleTable/CollapsibleTable';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay/DateTimeDisplay';
import { Divider } from 'src/components/Divider';
import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Flag } from 'src/components/Flag';
import { GroupByTagToggle } from 'src/components/GroupByTagToggle';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import { Typography } from 'src/components/Typography';
import { StyledContainerGrid } from 'src/features/Longview/shared/InstallationInstructions.styles';
import { useOrder } from 'src/hooks/useOrder';
import {
  useCloudViewNameSpacesQuery,
  useNamespaceApiKey,
} from 'src/queries/cloudview/namespaces';

export const NamespaceList = React.memo(() => {
  const { handleOrderChange, order, orderBy } = useOrder({
    order: 'desc',
    orderBy: 'date',
  });

  const {
    data: namespaces,
    isError,
    isLoading,
  } = useCloudViewNameSpacesQuery();
  if (isLoading) {
    return <CircleProgress />;
  }

  if (!namespaces || isError) {
    return (
      <ErrorState errorText="There was a problem retrieving the namespaces. Please try again" />
    );
  }

  const GetApiKey = (id: number) => {
    const { data: active_keys } = useNamespaceApiKey(id);

    if (!active_keys) {
      return 'Error in receiving api';
    }

    return active_keys?.active_keys[0].api_key;
  };

  const NamespaceTableRowHead = (
    <>
      <TableSortCell
        active={orderBy === 'name'}
        direction={order}
        handleClick={handleOrderChange}
        label="name"
      >
        Name
      </TableSortCell>
      <TableCell>Data Type</TableCell>
      <TableSortCell
        active={orderBy === 'region'}
        direction={order}
        handleClick={handleOrderChange}
        label="region"
      >
        Region
      </TableSortCell>
      <TableSortCell
        active={orderBy === 'date'}
        direction={order}
        handleClick={handleOrderChange}
        label="date"
      >
        Creation Date
      </TableSortCell>
      <TableCell>
        <GroupByTagToggle
          toggleGroupByTag={function (): boolean {
            throw new Error('Function not implemented.');
          }}
          isGroupedByTag={false}
        ></GroupByTagToggle>
      </TableCell>
    </>
  );

  const getTableItems = (): TableItem[] => {
    return namespaces.data.map((namespace) => {
      const OuterTableCells = (
        <>
          <TableCell>{namespace.type}</TableCell>
          <TableCell>
            <Grid sx={{ display: 'flex', flexDirection: 'row' }}>
              <Flag country={'us'}></Flag>
              {namespace.region}
            </Grid>
          </TableCell>
          <TableCell>
            <DateTimeDisplay
              displayTime
              value={namespace.created}
            ></DateTimeDisplay>
          </TableCell>
          <TableCell>
            <ActionMenu
              actionsList={[
                {
                  onClick: () => {
                    // eslint-disable-next-line no-console
                    console.log('Clicked on Delete');
                  },
                  title: 'Delete',
                },
              ]}
              ariaLabel="action menu"
            />
          </TableCell>
        </>
      );
      const api_key = GetApiKey(namespace.id);
      const InnerTable = (
        <Paper>
          <Typography sx={{ width: '40em' }} variant="h3">
            Before this Namespace can store data, you need to install and
            configure your agents. After installation, it may be a few minutes
            before the Namespace begins receiving data.
          </Typography>
          <Stack sx={{ paddingTop: '20px', width: '60em' }}>
            <StyledContainerGrid spacing={2}>
              <CopyTooltip text={api_key} />
              <Grid paddingLeft="5px">
                <strong>Api-Key:</strong>
              </Grid>
              <Grid paddingLeft="7px">
                <code>{api_key}</code>
              </Grid>
            </StyledContainerGrid>
            <StyledContainerGrid>
              <CopyTooltip text={namespace.urls.ingest} />
              <Grid paddingLeft="5px">
                <strong> Cloud View Endpoint: </strong>
              </Grid>
              <Grid paddingLeft="7px">
                <code>{namespace.urls.ingest}.</code>
              </Grid>
            </StyledContainerGrid>
            <StyledContainerGrid>
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

      return {
        InnerTable,
        OuterTableCells,
        id: namespace.id,
        label: namespace.label,
      };
    });
  };

  return (
    <CollapsibleTable
      TableItems={getTableItems()}
      TableRowEmpty={<TableCell></TableCell>}
      TableRowHead={NamespaceTableRowHead}
    ></CollapsibleTable>
  );
});
