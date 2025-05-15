import { useTagObjectsQuery } from '@linode/queries';
import {
  Button,
  CircleProgress,
  ErrorState,
  Stack,
  Typography,
} from '@linode/ui';
import { Hidden } from '@linode/ui';
import { createLazyRoute } from '@tanstack/react-router';
import React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell';
import { ImageRow } from 'src/features/Images/ImagesLanding/ImageRow';
import { LinodeRow } from 'src/features/Linodes/LinodesLanding/LinodeRow/LinodeRow';
import { VolumeTableRow } from 'src/features/Volumes/VolumeTableRow';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

const TypeTable = ({ objects, type }: { objects: any[]; type: string }) => {
  const pagination = usePaginationV2({
    currentRoute: '/tags',
    preferenceKey: `tag-${type}-pagination`,
  });

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'label',
      },
      from: '/tags',
    },
    preferenceKey: `tag-${type}-order`,
  });

  const start = (pagination.page - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  const paginatedObjects = objects.slice(start, end);

  const getTableHeaders = () => {
    switch (type) {
      case 'image':
        return (
          <>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              Image
            </TableSortCell>
            <Hidden smDown>
              <TableCell>Status</TableCell>
            </Hidden>
            <Hidden smDown>
              <TableCell>Replicated in</TableCell>
            </Hidden>
            <TableSortCell
              active={orderBy === 'size'}
              direction={order}
              handleClick={handleOrderChange}
              label="size"
            >
              Original Image
            </TableSortCell>
            <Hidden mdDown>
              <TableCell>All Replicas</TableCell>
            </Hidden>
            <Hidden mdDown>
              <TableSortCell
                active={orderBy === 'created'}
                direction={order}
                handleClick={handleOrderChange}
                label="created"
              >
                Created
              </TableSortCell>
            </Hidden>
            <Hidden mdDown>
              <TableCell>Image ID</TableCell>
            </Hidden>
            <TableCell />
          </>
        );
      case 'linode':
        return (
          <>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              Label
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              handleClick={handleOrderChange}
              label="status"
            >
              Status
            </TableSortCell>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'plan'}
                direction={order}
                handleClick={handleOrderChange}
                label="plan"
              >
                Plan
              </TableSortCell>
              <TableCell>Public IP Address</TableCell>
            </Hidden>
            <Hidden lgDown>
              <TableSortCell
                active={orderBy === 'region'}
                direction={order}
                handleClick={handleOrderChange}
                label="region"
              >
                Region
              </TableSortCell>
            </Hidden>
            <Hidden lgDown>
              <TableCell>Last Backup</TableCell>
            </Hidden>
            <Hidden lgDown>
              <TableCell>Tags</TableCell>
            </Hidden>
            <TableCell />
          </>
        );
      case 'volume':
        return (
          <>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              Label
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              handleClick={handleOrderChange}
              label="status"
            >
              Status
            </TableSortCell>
            <TableCell>Region</TableCell>
            <TableSortCell
              active={orderBy === 'size'}
              direction={order}
              handleClick={handleOrderChange}
              label="size"
            >
              Size
            </TableSortCell>
            <TableCell>Attached To</TableCell>
            <TableCell>Encryption</TableCell>
            <TableCell />
          </>
        );
      default:
        return (
          <>
            <TableCell>Label</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Details</TableCell>
          </>
        );
    }
  };

  const getTableCells = (object: any) => {
    switch (type) {
      case 'image':
        return (
          <ImageRow
            handlers={{
              onDelete: () => {},
              onEdit: () => {},
              onRebuild: () => {},
              onManageRegions: () => {},
              onDeploy: () => {},
              onCancelFailed: () => {},
            }}
            image={object.data}
          />
        );
      case 'linode':
        return (
          <>
            <TableCell>{object.data.label}</TableCell>
            <TableCell>{object.data.status}</TableCell>
            <TableCell>{object.data.specs?.type || '-'}</TableCell>
            <TableCell>{object.data.ipv4?.[0] || '-'}</TableCell>
            <TableCell>{object.data.region || '-'}</TableCell>
            <TableCell>{object.data.backups?.last_successful || '-'}</TableCell>
          </>
        );
      case 'volume':
        return (
          <>
            <TableCell>{object.data.label}</TableCell>
            <TableCell>{object.data.status}</TableCell>
            <TableCell>{object.data.region || '-'}</TableCell>
            <TableCell>{object.data.size || '-'}</TableCell>
            <TableCell>
              {object.data.linode_id ? `Linode ${object.data.linode_id}` : '-'}
            </TableCell>
            <TableCell>{object.data.encrypted ? 'Yes' : 'No'}</TableCell>
          </>
        );
      default:
        return (
          <>
            <TableCell>{object.data.label}</TableCell>
            <TableCell>{object.data.status || '-'}</TableCell>
            <TableCell>
              <pre>{JSON.stringify(object.data, null, 2)}</pre>
            </TableCell>
          </>
        );
    }
  };

  return (
    <Stack spacing={1}>
      <Typography variant="h3">{type}</Typography>
      <Table>
        <TableHead>
          <TableRow>{getTableHeaders()}</TableRow>
        </TableHead>
        <TableBody>
          {paginatedObjects.length === 0 ? (
            <TableRowEmpty
              colSpan={type === 'volume' ? 7 : type === 'linode' ? 6 : 3}
              message={`No ${type} to display.`}
            />
          ) : type === 'image' ? (
            paginatedObjects.map((object) => (
              <ImageRow
                handlers={{
                  onDelete: () => {},
                  onEdit: () => {},
                  onRebuild: () => {},
                  onManageRegions: () => {},
                  onDeploy: () => {},
                  onCancelFailed: () => {},
                }}
                image={object.data}
                key={object.data.id}
              />
            ))
          ) : type === 'linode' ? (
            paginatedObjects.map((object) => (
              <LinodeRow
                handlers={{
                  onOpenDeleteDialog: () => null,
                  onOpenMigrateDialog: () => null,
                  onOpenPowerDialog: () => null,
                  onOpenRebuildDialog: () => null,
                  onOpenRescueDialog: () => null,
                  onOpenResizeDialog: () => null,
                }}
                key={object.data.id}
                {...object.data}
              />
            ))
          ) : type === 'volume' ? (
            paginatedObjects.map((object) => (
              <VolumeTableRow
                handlers={{
                  handleAttach: () => {},
                  handleClone: () => {},
                  handleDelete: () => {},
                  handleDetach: () => {},
                  handleDetails: () => {},
                  handleEdit: () => {},
                  handleManageTags: () => {},
                  handleResize: () => {},
                  handleUpgrade: () => {},
                }}
                isBlockStorageEncryptionFeatureEnabled={true}
                key={object.data.id}
                volume={object.data}
              />
            ))
          ) : (
            paginatedObjects.map((object) => (
              <TableRow key={object.data.id}>{getTableCells(object)}</TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <PaginationFooter
        count={objects.length}
        eventCategory={`${type} Table`}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </Stack>
  );
};

const Tag = () => {
  const params = tagDetailsLazyRoute.useParams();
  const { data: objects, error, isPending } = useTagObjectsQuery(params.tag);

  // Group objects by type
  const groupedObjects = React.useMemo(() => {
    if (!objects) return {};
    return objects.reduce(
      (acc, obj) => {
        const type = obj.type;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(obj);
        return acc;
      },
      {} as Record<string, typeof objects>
    );
  }, [objects]);

  if (isPending) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText="Unable to get this Tag's entities" />;
  }

  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        justifyContent="space-between"
        maxHeight="32px"
        spacing={1}
      >
        <LandingHeader />
        <Button buttonType="primary" color="error">
          Delete
        </Button>
      </Stack>
      {objects.length === 0 && (
        <Stack alignItems="center" gap={4} justifyContent="center" pt={4}>
          <Typography fontSize="48px">🚫</Typography>
          <Typography>No entities with this tag</Typography>
        </Stack>
      )}
      {Object.entries(groupedObjects).map(([type, typeObjects]) => (
        <TypeTable key={type} objects={typeObjects} type={type} />
      ))}
    </Stack>
  );
};

export const tagDetailsLazyRoute = createLazyRoute('/tags/$tag')({
  component: Tag,
});
