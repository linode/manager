import { CircleProgress, Notice, Paper, Select, Typography } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';

import type { QuotaServiceType } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';
import type { Theme } from '@mui/material';
import type { QuotaService } from 'src/features/Account/Quotas/quotaServices';

type ServiceSelectOption = SelectOption<QuotaServiceType>;

type ServicePanelProps = {
  availableServices: null | QuotaService[];
  isFetchingServices: boolean;
  onServiceChange: (service: null | QuotaService) => void;
  selectedService: null | QuotaService;
};

export const QuotaServicePanel: React.FC<ServicePanelProps> = ({
  availableServices,
  selectedService,
  isFetchingServices,
  onServiceChange,
}) => {
  const servicesByType = React.useMemo(() => {
    if (!availableServices) {
      return null;
    }
    return new Map<QuotaServiceType, QuotaService>(
      availableServices.map((service) => [service.type, service])
    );
  }, [availableServices]);

  const serviceOptions: ServiceSelectOption[] | undefined = React.useMemo(
    () =>
      availableServices?.map((service) => ({
        label: service.label,
        value: service.type,
      })) ?? [],
    [availableServices]
  );

  const selectedOption = React.useMemo(
    () =>
      serviceOptions.find(
        (service) => service.value === selectedService?.type
      ) ?? null,
    [selectedService, serviceOptions]
  );

  React.useEffect(() => {
    if (
      selectedService &&
      servicesByType &&
      !servicesByType.has(selectedService.type)
    ) {
      onServiceChange(null);
    }
  }, [onServiceChange, selectedService, servicesByType]);

  return (
    <Paper
      sx={(theme: Theme) => ({
        marginTop: theme.spacingFunction(16),
      })}
      variant="outlined"
    >
      {isFetchingServices ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <CircleProgress size="md" />
        </div>
      ) : availableServices?.length === 0 ? (
        <Typography marginTop={1}>
          There are no services that have quotas available at this time.
        </Typography>
      ) : (
        <>
          <Typography>Select a service to view your quotas below.</Typography>
          <Select<ServiceSelectOption>
            isOptionEqualToValue={(option, value) =>
              option.value === value.value
            }
            label="Service"
            onChange={(_event, value) => {
              if (!value) {
                onServiceChange(null);
                return;
              }

              onServiceChange(servicesByType?.get(value.value) ?? null);
            }}
            options={serviceOptions}
            placeholder="Select a Service"
            value={selectedOption}
          />
          {selectedService?.type === 'object-storage' && (
            <Notice spacingTop={16} variant="info">
              <Typography>
                Details on{' '}
                <Link to="https://techdocs.akamai.com/cloud-computing/docs/quotas">
                  {' '}
                  account Quotas
                </Link>{' '}
                and{' '}
                <Link to="https://techdocs.akamai.com/cloud-computing/docs/object-storage-product-limits">
                  Object Storage quotas and limits
                </Link>{' '}
                can be found in our product documentation.
              </Typography>
            </Notice>
          )}
        </>
      )}
    </Paper>
  );
};
