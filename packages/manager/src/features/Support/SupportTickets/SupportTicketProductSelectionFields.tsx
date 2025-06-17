import {
  useAllDomainsQuery,
  useAllFirewallsQuery,
  useAllLinodesQuery,
  useAllNodeBalancersQuery,
  useAllVolumesQuery,
  useAllVPCsQuery,
} from '@linode/queries';
import { Autocomplete, FormHelperText, TextField } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useKubernetesBetaEndpoint } from 'src/features/Kubernetes/kubeUtils';
import { useAllDatabasesQuery } from 'src/queries/databases/databases';
import { useAllKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';

import {
  ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP,
  ENTITY_ID_TO_NAME_MAP,
  ENTITY_MAP,
} from './constants';
import { getEntityNameFromEntityType } from './ticketUtils';

import type { AccountLimitCustomFields } from './SupportTicketAccountLimitFields';
import type {
  EntityType,
  SupportTicketFormFields,
  TicketType,
} from './SupportTicketDialog';
import type { APIError } from '@linode/api-v4';

interface Props {
  ticketType?: TicketType;
}

export const SupportTicketProductSelectionFields = (props: Props) => {
  const { ticketType } = props;
  const {
    clearErrors,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<SupportTicketFormFields & AccountLimitCustomFields>();

  const { entityId, entityInputValue, entityType } = watch();

  // React Query entities
  const {
    data: databases,
    error: databasesError,
    isLoading: databasesLoading,
  } = useAllDatabasesQuery(entityType === 'database_id');

  const {
    data: firewalls,
    error: firewallsError,
    isLoading: firewallsLoading,
  } = useAllFirewallsQuery(entityType === 'firewall_id');

  const {
    data: domains,
    error: domainsError,
    isLoading: domainsLoading,
  } = useAllDomainsQuery(entityType === 'domain_id');

  const {
    data: nodebalancers,
    error: nodebalancersError,
    isLoading: nodebalancersLoading,
  } = useAllNodeBalancersQuery(entityType === 'nodebalancer_id');

  const { isUsingBetaEndpoint } = useKubernetesBetaEndpoint();
  const {
    data: clusters,
    error: clustersError,
    isLoading: clustersLoading,
  } = useAllKubernetesClustersQuery({
    enabled: entityType === 'lkecluster_id',
    isUsingBetaEndpoint,
  });

  const {
    data: linodes,
    error: linodesError,
    isLoading: linodesLoading,
  } = useAllLinodesQuery({}, {}, entityType === 'linode_id');

  const {
    data: buckets,
    error: bucketsError,
    isLoading: bucketsLoading,
  } = useObjectStorageBuckets(entityType === 'bucket');

  const {
    data: volumes,
    error: volumesError,
    isLoading: volumesLoading,
  } = useAllVolumesQuery({}, {}, entityType === 'volume_id');

  const {
    data: vpcs,
    error: vpcsError,
    isLoading: vpcsLoading,
  } = useAllVPCsQuery({
    enabled: entityType === 'vpc_id',
  });

  const getEntityOptions = (): { label: string; value: number | string }[] => {
    const reactQueryEntityDataMap = {
      bucket: buckets,
      database_id: databases,
      domain_id: domains,
      firewall_id: firewalls,
      linode_id: linodes,
      lkecluster_id: clusters,
      nodebalancer_id: nodebalancers,
      volume_id: volumes,
      vpc_id: vpcs,
    };

    if (entityType === 'none' || entityType === 'general') {
      return [];
    }

    if (!reactQueryEntityDataMap[entityType]) {
      return [];
    }

    // Domains don't have a label so we map the domain as the label
    if (entityType === 'domain_id') {
      return (
        reactQueryEntityDataMap[entityType]?.map(({ domain, id }) => ({
          label: domain,
          value: id,
        })) || []
      );
    }

    if (entityType === 'bucket') {
      return (
        reactQueryEntityDataMap['bucket']?.buckets?.map(
          ({ cluster, label, region }) => {
            return {
              label,
              value: region ?? cluster,
            };
          }
        ) || []
      );
    }

    return (
      reactQueryEntityDataMap[entityType]?.map(
        ({ id, label }: { id: number; label: string }) => ({
          label,
          value: id,
        })
      ) || []
    );
  };

  const loadingMap: Record<EntityType, boolean> = {
    bucket: bucketsLoading,
    database_id: databasesLoading,
    domain_id: domainsLoading,
    firewall_id: firewallsLoading,
    general: false,
    linode_id: linodesLoading,
    lkecluster_id: clustersLoading,
    nodebalancer_id: nodebalancersLoading,
    none: false,
    volume_id: volumesLoading,
    vpc_id: vpcsLoading,
  };

  const errorMap: Record<EntityType, APIError[] | null> = {
    bucket: bucketsError ? [{ reason: bucketsError.message }] : null,
    database_id: databasesError,
    domain_id: domainsError,
    firewall_id: firewallsError,
    general: null,
    linode_id: linodesError,
    lkecluster_id: clustersError,
    nodebalancer_id: nodebalancersError,
    none: null,
    volume_id: volumesError,
    vpc_id: vpcsError,
  };

  const entityOptions = getEntityOptions();
  const areEntitiesLoading = loadingMap[entityType];
  const entityError = errorMap[entityType]
    ? `Error loading ${ENTITY_ID_TO_NAME_MAP[entityType]}s`
    : undefined;

  const selectedEntity =
    entityType === 'bucket'
      ? entityOptions.find(
          (thisEntity) =>
            String(thisEntity.value) === entityId &&
            thisEntity.label === entityInputValue
        ) || null
      : entityOptions.find(
          (thisEntity) => String(thisEntity.value) === entityId
        ) || null;

  const renderEntityTypes = () => {
    return Object.keys(ENTITY_MAP).map((key: string) => {
      return { label: key, value: ENTITY_MAP[key] };
    });
  };

  const topicOptions: { label: string; value: EntityType }[] = [
    { label: 'General/Account/Billing', value: 'general' },
    ...renderEntityTypes(),
  ];

  const selectedTopic = topicOptions.find((eachTopic) => {
    return eachTopic.value === entityType;
  });

  const _entityType = getEntityNameFromEntityType(entityType, true);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {ticketType === 'accountLimit' ? (
        <Controller
          control={control}
          name="numberOfEntities"
          render={({ field, fieldState }) => (
            <TextField
              data-qa-ticket-number-of-entities
              errorText={fieldState.error?.message}
              helperText={`Current number of ${_entityType}: ${entityOptions.length}`}
              label={ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP.numberOfEntities.replace(
                'entities',
                _entityType
              )}
              name="numberOfEntities"
              onChange={field.onChange}
              placeholder={`Enter total number of ${_entityType}`}
              value={field.value}
            />
          )}
        />
      ) : (
        <>
          <Controller
            control={control}
            name="entityType"
            render={({ field }) => (
              <Autocomplete
                data-qa-ticket-entity-type
                disableClearable
                label="What is this regarding?"
                onChange={(_e, type) => {
                  // Don't reset things if the type hasn't changed.
                  if (type.value === entityType) {
                    return;
                  }
                  field.onChange(type.value);
                  setValue('entityId', '');
                  setValue('entityInputValue', '');
                  clearErrors('entityId');
                }}
                options={topicOptions}
                value={selectedTopic}
              />
            )}
          />
          {!['general', 'none'].includes(entityType) && (
            <>
              <Controller
                control={control}
                name="entityInputValue"
                render={({ field, fieldState }) => (
                  <Autocomplete
                    data-qa-ticket-entity-id
                    disabled={entityOptions.length === 0}
                    errorText={
                      entityError ||
                      fieldState.error?.message ||
                      errors.entityId?.message
                    }
                    inputValue={entityInputValue}
                    label={ENTITY_ID_TO_NAME_MAP[entityType] ?? 'Entity Select'}
                    loading={areEntitiesLoading}
                    onChange={(e, id) =>
                      setValue('entityId', id ? String(id?.value) : '')
                    }
                    onInputChange={(e, value) =>
                      field.onChange(value ? value : '')
                    }
                    options={entityOptions}
                    placeholder={`Select a ${ENTITY_ID_TO_NAME_MAP[entityType]}`}
                    value={selectedEntity}
                  />
                )}
              />
              {!areEntitiesLoading && entityOptions.length === 0 ? (
                <FormHelperText>
                  You don&rsquo;t have any {ENTITY_ID_TO_NAME_MAP[entityType]}s
                  on your account.
                </FormHelperText>
              ) : null}
            </>
          )}
        </>
      )}
    </>
  );
};
