import { streamType } from '@linode/api-v4';
import { useRegionsQuery } from '@linode/queries';
import { TooltipIcon } from '@linode/ui';
import React from 'react';

import { getStreamTypeOption } from 'src/features/Delivery/deliveryUtils';
import { LabelValue } from 'src/features/Delivery/Shared/LabelValue';

import type { LinodeObjectStorageDetails } from '@linode/api-v4';

const sxTooltipIcon = {
  marginLeft: '4px',
  padding: '0px',
};

export const DestinationLinodeObjectStorageDetailsSummary = (
  props: LinodeObjectStorageDetails
) => {
  const { bucket_name, host, region, path } = props;
  const { data: regions } = useRegionsQuery();

  const regionValue = regions?.find(({ id }) => id === region)?.label || region;

  return (
    <>
      <LabelValue label="Host" value={host} />
      <LabelValue label="Bucket" value={bucket_name} />
      <LabelValue label="Region" value={regionValue} />
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
            text={`Default paths: ${getStreamTypeOption(streamType.LKEAuditLogs)?.label} - {stream_type}/{log_type}/{account}/{partition}/{%Y/%m/%d/};
            ${getStreamTypeOption(streamType.AuditLogs)?.label} - {stream_type}/{log_type}/{account}/{%Y/%m/%d/}`}
          />
        )}
      </LabelValue>
    </>
  );
};
