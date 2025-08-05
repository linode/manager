import { useImageQuery, useRegionsQuery, useTypeQuery } from '@linode/queries';
import { Button, Stack } from '@linode/ui';
import {
  formatStorageUnits,
  getFormattedStatus,
  isNotNullOrUndefined,
} from '@linode/utilities';
import Grid from '@mui/material/Grid';
import React from 'react';

import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import { getLinodeIconStatus } from '../../LinodesLanding/utils';

import type { Linode } from '@linode/api-v4';

interface Props {
  disabled?: boolean;
  handlePowerOff: () => void;
  handleSelection: () => void;
  linode: Linode;
  selected?: boolean;
  showPowerActions: boolean;
}

export const SelectLinodeCard = ({
  disabled,
  handlePowerOff,
  handleSelection,
  linode,
  selected,
  showPowerActions,
}: Props) => {
  const { data: regions } = useRegionsQuery();

  const { data: linodeType } = useTypeQuery(
    linode?.type ?? '',
    Boolean(linode?.type)
  );

  const { data: linodeImage } = useImageQuery(
    linode?.image ?? '',
    Boolean(linode?.image)
  );

  const { data: permissions } = usePermissions(
    'linode',
    ['shutdown_linode', 'clone_linode'],
    linode.id
  );

  const iconStatus = getLinodeIconStatus(linode?.status);
  const shouldShowPowerButton =
    showPowerActions && linode?.status === 'running' && selected;

  const type = linodeType ? formatStorageUnits(linodeType?.label) : linode.type;
  const image = linodeImage?.label ?? linode.image;
  const region =
    regions?.find((region) => region.id === linode.region)?.label ??
    linode.region;

  const renderVariant = () => (
    <Grid
      size={12}
      sx={{
        paddingTop: 0,
      }}
    >
      <Stack direction="row" justifyContent="space-between" marginBottom={1}>
        <Stack alignItems="center" direction="row" height={34}>
          <StatusIcon
            aria-label={`Linode status ${linode?.status ?? iconStatus}`}
            status={iconStatus}
          />
          {getFormattedStatus(linode.status)}
        </Stack>
        {shouldShowPowerButton && (
          <Button
            buttonType="outlined"
            disabled={!permissions.shutdown_linode}
            onClick={handlePowerOff}
          >
            Power Off
          </Button>
        )}
      </Stack>
    </Grid>
  );

  return (
    <SelectionCard
      checked={selected}
      disabled={!permissions.clone_linode || disabled}
      heading={linode.label}
      key={`selection-card-${linode.id}`}
      onClick={handleSelection}
      renderVariant={renderVariant}
      subheadings={[
        [type, image, region].filter(isNotNullOrUndefined).join(', '),
      ]}
    />
  );
};
