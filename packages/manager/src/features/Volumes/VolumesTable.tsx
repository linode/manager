import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { useIsBlockStorageEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { GroupByTagToggle } from 'src/components/GroupByTagToggle';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell';

import {
  StyledTagHeader,
  StyledTagHeaderRow,
} from '../Linodes/LinodesLanding/DisplayLinodes.styles';
import { VolumeTableRow } from './VolumeTableRow';

import type { ResourcePage, Volume } from '@linode/api-v4';
import type { PaginationProps } from 'src/hooks/usePagination';
import type { VolumeAction } from 'src/routes/volumes';

interface Props {
  handleOrderChange: any;
  order: 'asc' | 'desc';
  orderBy: string;
  pagination: PaginationProps;
  toggleGroupVolumes: () => boolean;
  volumes: ResourcePage<Volume> | undefined;
  volumesAreGrouped: boolean;
}

export function VolumesTable({
  handleOrderChange,
  order,
  orderBy,
  pagination,
  toggleGroupVolumes,
  volumes,
  volumesAreGrouped,
}: Props) {
  const {
    isBlockStorageEncryptionFeatureEnabled,
  } = useIsBlockStorageEncryptionFeatureEnabled();

  const navigate = useNavigate();

  const handleAction = (volume: Volume, action: VolumeAction) => {
    navigate({
      params: { action, volumeId: volume.id },
      search: (prev) => prev,
      to: `/volumes/$volumeId/$action`,
    });
  };

  const getVolumeTableRow = (volume: Volume) => {
    return (
      <VolumeTableRow
        handlers={{
          handleAttach: () => handleAction(volume, 'attach'),
          handleClone: () => handleAction(volume, 'clone'),
          handleDelete: () => handleAction(volume, 'delete'),
          handleDetach: () => handleAction(volume, 'detach'),
          handleDetails: () => handleAction(volume, 'details'),
          handleEdit: () => handleAction(volume, 'edit'),
          handleManageTags: () => handleAction(volume, 'manage-tags'),
          handleResize: () => handleAction(volume, 'resize'),
          handleUpgrade: () => handleAction(volume, 'upgrade'),
        }}
        isBlockStorageEncryptionFeatureEnabled={
          isBlockStorageEncryptionFeatureEnabled
        }
        key={volume.id}
        volume={volume}
      />
    );
  };

  const getUngroupedVolumes = () => {
    return volumes?.data.map((volume) => getVolumeTableRow(volume));
  };

  const getGroupedVolumes = () => {
    const tags = Array.from(
      new Set(volumes?.data.flatMap((volume) => volume.tags))
    );

    const volumesWithNoTags = volumes?.data.filter(
      (volume) => !volume.tags.length
    );

    return (
      <>
        {volumesWithNoTags?.length && getTagHeaderRow('No Tags')}
        {volumesWithNoTags?.map((volume) => getVolumeTableRow(volume))}

        {tags?.map((tag, index) => (
          <React.Fragment key={index}>
            {getTagHeaderRow(tag)}

            {volumes?.data
              .filter((volume) => volume.tags.includes(tag))
              .map((volume) => getVolumeTableRow(volume))}
          </React.Fragment>
        ))}
      </>
    );
  };

  const getTagHeaderRow = (tag: string) => {
    return (
      <StyledTagHeaderRow data-qa-tag-header={tag}>
        <TableCell colSpan={7}>
          <StyledTagHeader variant="h2">{tag}</StyledTagHeader>
        </TableCell>
      </StyledTagHeaderRow>
    );
  };

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
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
            {isBlockStorageEncryptionFeatureEnabled && (
              <TableCell>Encryption</TableCell>
            )}
            <TableCell sx={{ padding: '0 !important', textAlign: 'right' }}>
              <GroupByTagToggle
                isGroupedByTag={volumesAreGrouped}
                toggleGroupByTag={toggleGroupVolumes}
              />
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {volumes?.data.length === 0 && (
            <TableRowEmpty colSpan={6} message="No volume found" />
          )}

          {volumesAreGrouped ? getGroupedVolumes() : getUngroupedVolumes()}
        </TableBody>
      </Table>

      <PaginationFooter
        count={volumes?.results ?? 0}
        eventCategory="Volumes Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </>
  );
}
