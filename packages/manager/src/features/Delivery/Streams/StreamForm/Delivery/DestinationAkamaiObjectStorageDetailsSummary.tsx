import { streamType } from '@linode/api-v4';
import { Stack, TooltipIcon, Typography } from '@linode/ui';
import React from 'react';

import { getStreamTypeOption } from 'src/features/Delivery/deliveryUtils';
import { LabelValue } from 'src/features/Delivery/Shared/LabelValue';

import type { AkamaiObjectStorageDetails } from '@linode/api-v4';

const sxTooltipIcon = {
  marginLeft: '4px',
  padding: '0px',
};

export const DestinationAkamaiObjectStorageDetailsSummary = (
  props: AkamaiObjectStorageDetails
) => {
  const { bucket_name, host, path } = props;

  return (
    <>
      <LabelValue label="Host" value={host} />
      <LabelValue label="Bucket" value={bucket_name} />
      <LabelValue
        data-testid="access-key-id"
        label="Access Key ID"
        value="*****************"
      />
      <LabelValue
        data-testid="secret-access-key"
        label="Secret Access Key"
        value="*****************"
      />
      <LabelValue label="Log Path" value={path}>
        {!path && (
          <TooltipIcon
            status="info"
            sxTooltipIcon={sxTooltipIcon}
            text={
              <Stack spacing={2}>
                <Typography>Default paths:</Typography>
                <Typography>{`${getStreamTypeOption(streamType.LKEAuditLogs)?.label} - {stream_type}/{log_type}/ {account}/{partition}/ {%Y/%m/%d/}`}</Typography>
                <Typography>{`${getStreamTypeOption(streamType.AuditLogs)?.label} - {stream_type}/{log_type}/ {account}/{%Y/%m/%d/}`}</Typography>
              </Stack>
            }
          />
        )}
      </LabelValue>
    </>
  );
};
