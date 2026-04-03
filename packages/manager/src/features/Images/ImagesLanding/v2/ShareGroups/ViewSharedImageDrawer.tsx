import { useRegionsQuery } from '@linode/queries';
import { ActionsPanel, Drawer, Stack, styled, Typography } from '@linode/ui';
import React from 'react';

import CloudInitIcon from 'src/assets/icons/cloud-init.svg';
import Lock from 'src/assets/icons/lock.svg';
import Unlock from 'src/assets/icons/unlock.svg';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Flag } from 'src/components/Flag';
import { getCountryAndLabelFromImageRegion } from 'src/features/Images/utils';

import type { APIError, Image } from '@linode/api-v4';

interface Props {
  image: Image | undefined;
  imageError?: APIError[] | null;
  isFetching?: boolean;
  onClose: () => void;
  open: boolean;
}

export const ViewSharedImageDrawer = (props: Props) => {
  const { imageError, isFetching, onClose, open, image } = props;

  const { data: regions } = useRegionsQuery();

  return (
    <Drawer
      error={imageError}
      isFetching={isFetching}
      onClose={onClose}
      open={open}
      title="View shared image details"
    >
      <Stack spacing={2}>
        <Typography variant="body1">
          <StyledLabel>Label:</StyledLabel> {image?.label}
        </Typography>
        <Typography variant="body1">
          <StyledLabel>Image ID:</StyledLabel>{' '}
          <CopyTooltip copyableText text={image?.id ?? ''} />
        </Typography>
        <Typography variant="body1">
          <StyledLabel>Share group:</StyledLabel>{' '}
          {image?.image_sharing?.shared_by?.sharegroup_label}
        </Typography>
        <Typography variant="body1">
          <StyledLabel>Original image size:</StyledLabel> {image?.size} MB
        </Typography>
        <Typography variant="body1">
          <StyledLabel>All replicas:</StyledLabel> {image?.total_size} MB
        </Typography>
        <Typography variant="body1">
          <StyledLabel>Created:</StyledLabel> {image?.created}
        </Typography>
        {image?.capabilities?.includes('distributed-sites') ? (
          <Stack alignItems="center" direction="row" spacing={0.5}>
            <Lock />
            <Typography data-testid="encrypted-indicator">Encrypted</Typography>
          </Stack>
        ) : (
          <Stack alignItems="center" direction="row" spacing={0.5}>
            <Unlock />
            <Typography data-testid="not-encrypted-indicator">
              Not Encrypted
            </Typography>
          </Stack>
        )}
        {image?.capabilities?.includes('cloud-init') && (
          <Stack alignItems="center" direction="row" spacing={0.5}>
            <StyledCloudInitIcon />
            <Typography>Supports Metadata service via Cloud-Init</Typography>
          </Stack>
        )}
        {image?.description && (
          <Typography variant="body1">
            <Stack direction="column" spacing={1}>
              <StyledLabel>Description</StyledLabel>
              {image.description}
            </Stack>
          </Typography>
        )}
        <Typography variant="body1">
          <StyledLabel>Replicated in the following regions:</StyledLabel>{' '}
          {image?.regions.map((region) => {
            const countryAndLabelObject = getCountryAndLabelFromImageRegion(
              regions ?? [],
              region
            );

            const imageCountry = countryAndLabelObject.country ?? 'us';
            const regionLabel = countryAndLabelObject.label ?? 'Unknown';

            return (
              <Stack
                alignItems="center"
                direction="row"
                key={region.region}
                marginTop={1}
              >
                <Flag country={imageCountry} />
                <span style={{ paddingLeft: 8 }}>{regionLabel}</span>
              </Stack>
            );
          })}
        </Typography>
      </Stack>
      <ActionsPanel
        secondaryButtonProps={{
          'data-testid': 'cancel',
          label: 'Close',
          onClick: onClose,
        }}
      />
    </Drawer>
  );
};

const StyledLabel = styled('span', {
  label: 'StyledLabel',
})(({ theme }) => ({
  font: theme.font.bold,
}));

const StyledCloudInitIcon = styled(CloudInitIcon, {
  label: 'StyledCloudInitIcon',
})(() => ({
  height: 16,
  width: 16,
}));
