import { Box, CircleProgress, Drawer, ErrorState } from '@linode/ui';
import * as React from 'react';

import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';
import { useObjectStorageRegions } from 'src/features/ObjectStorage/shared/hooks/useObjectStorageRegions';
import { useObjectStorageAccessKey } from 'src/queries/object-storage/queries';

import { CopyAllEndpointHostnames } from './CopyAllEndpointHostnames';

interface Props {
  accessKeyId?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const EndpointHostnamesDrawer = (props: Props) => {
  const { onClose, isOpen, accessKeyId } = props;

  return (
    <Drawer onClose={onClose} open={isOpen} title="Regions / S3 Hostnames">
      <EndpointHostnamesDrawerContent accessKeyId={accessKeyId} />
    </Drawer>
  );
};

interface EndpointHostnamesDrawerContentProps {
  accessKeyId?: number;
}

export const EndpointHostnamesDrawerContent = ({
  accessKeyId,
}: EndpointHostnamesDrawerContentProps) => {
  const {
    data: objectStorageKey,
    isLoading: isAccessKeyLoading,
    error: accessKeyError,
  } = useObjectStorageAccessKey(
    accessKeyId ?? -1,
    accessKeyId !== null && accessKeyId !== undefined
  );
  const {
    regionsByIdMap,
    isLoading: isStorageEndpointsLoading,
    errors: regionsError,
  } = useObjectStorageRegions();

  if (isAccessKeyLoading || isStorageEndpointsLoading) {
    return <CircleProgress />;
  }

  if (accessKeyError || regionsError) {
    const error = accessKeyError ?? regionsError!;

    return <ErrorState errorText={error[0].reason} />;
  }

  if (!regionsByIdMap) {
    return null;
  }

  const keyRegions = objectStorageKey?.regions ?? [];

  return (
    <>
      <Box sx={(theme) => ({ marginTop: theme.spacing(3) })}>
        <CopyAllEndpointHostnames
          text={
            keyRegions
              .map((keyRegion) => {
                const label = regionsByIdMap[keyRegion.id]?.label;
                const endpointType = keyRegion.endpoint_type
                  ? ` (${keyRegion.endpoint_type})`
                  : '';
                return `${label}${endpointType}: ${keyRegion.s3_endpoint}`;
              })
              .join('\n') ?? ''
          }
        />
      </Box>

      <Box
        sx={(theme) => ({
          backgroundColor: theme.bg.main,
          border: `1px solid ${theme.color.grey3}`,
          padding: theme.spacing(1),
        })}
      >
        {keyRegions.map((region, index) => {
          const endpointTypeLabel = region?.endpoint_type
            ? ` (${region.endpoint_type})`
            : '';

          return (
            <CopyableTextField
              hideLabel
              key={index}
              label={`${region.id}${endpointTypeLabel}: ${region.s3_endpoint}`}
              sx={{
                backgroundColor: 'unset',
                border: 'none',
                maxWidth: '100%',
              }}
              value={`${
                regionsByIdMap[region.id]?.label
              }${endpointTypeLabel}: ${region.s3_endpoint}`}
            />
          );
        })}
      </Box>
    </>
  );
};
