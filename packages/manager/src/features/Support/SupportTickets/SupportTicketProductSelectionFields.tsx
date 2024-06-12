import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { FormHelperText } from 'src/components/FormHelperText';
import { useAllDatabasesQuery } from 'src/queries/databases/databases';
import { useAllDomainsQuery } from 'src/queries/domains';
import { useAllFirewallsQuery } from 'src/queries/firewalls';
import { useAllKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useAllNodeBalancersQuery } from 'src/queries/nodebalancers';
import { useAllVolumesQuery } from 'src/queries/volumes/volumes';

import { ENTITY_ID_TO_NAME_MAP, ENTITY_MAP } from './constants';

import type {
  EntityType,
  SupportTicketFormFields,
} from './SupportTicketDialog';
import type { APIError } from '@linode/api-v4';

export const SupportTicketProductSelectionFields = () => {
  const {
    control,
    setValue,
    watch,
  } = useFormContext<SupportTicketFormFields>();

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

  const {
    data: clusters,
    error: clustersError,
    isLoading: clustersLoading,
  } = useAllKubernetesClustersQuery(entityType === 'lkecluster_id');

  const {
    data: linodes,
    error: linodesError,
    isLoading: linodesLoading,
  } = useAllLinodesQuery({}, {}, entityType === 'linode_id');

  const {
    data: volumes,
    error: volumesError,
    isLoading: volumesLoading,
  } = useAllVolumesQuery({}, {}, entityType === 'volume_id');

  const getEntityOptions = (): { label: string; value: number }[] => {
    const reactQueryEntityDataMap = {
      database_id: databases,
      domain_id: domains,
      firewall_id: firewalls,
      linode_id: linodes,
      lkecluster_id: clusters,
      nodebalancer_id: nodebalancers,
      volume_id: volumes,
    };

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
    database_id: databasesLoading,
    domain_id: domainsLoading,
    firewall_id: firewallsLoading,
    general: false,
    linode_id: linodesLoading,
    lkecluster_id: clustersLoading,
    nodebalancer_id: nodebalancersLoading,
    none: false,
    volume_id: volumesLoading,
  };

  const errorMap: Record<EntityType, APIError[] | null> = {
    database_id: databasesError,
    domain_id: domainsError,
    firewall_id: firewallsError,
    general: null,
    linode_id: linodesError,
    lkecluster_id: clustersError,
    nodebalancer_id: nodebalancersError,
    none: null,
    volume_id: volumesError,
  };

  const entityOptions = getEntityOptions();
  const areEntitiesLoading = loadingMap[entityType];
  const entityError = Boolean(errorMap[entityType])
    ? `Error loading ${ENTITY_ID_TO_NAME_MAP[entityType]}s`
    : undefined;

  const selectedEntity =
    entityOptions.find((thisEntity) => String(thisEntity.value) === entityId) ||
    null;

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

  return (
    <>
      <Controller
        render={({ field }) => (
          <Autocomplete
            onChange={(_e, type) => {
              // Don't reset things if the type hasn't changed.
              if (type.value === entityType) {
                return;
              }
              field.onChange(type.value);
              setValue('entityId', '');
              setValue('entityInputValue', '');
            }}
            data-qa-ticket-entity-type
            disableClearable
            label="What is this regarding?"
            options={topicOptions}
            value={selectedTopic}
          />
        )}
        control={control}
        name="entityType"
      />
      {!['general', 'none'].includes(entityType) && (
        <>
          <Controller
            render={({ field, fieldState }) => (
              <Autocomplete
                onChange={(e, id) =>
                  setValue('entityId', id ? String(id?.value) : '')
                }
                data-qa-ticket-entity-id
                disabled={entityOptions.length === 0}
                errorText={entityError || fieldState.error?.message}
                inputValue={entityInputValue}
                label={ENTITY_ID_TO_NAME_MAP[entityType] ?? 'Entity Select'}
                loading={areEntitiesLoading}
                onInputChange={(e, value) => field.onChange(value ? value : '')}
                options={entityOptions}
                placeholder={`Select a ${ENTITY_ID_TO_NAME_MAP[entityType]}`}
                value={selectedEntity}
              />
            )}
            control={control}
            name="entityInputValue"
          />
          {!areEntitiesLoading && entityOptions.length === 0 ? (
            <FormHelperText>
              You don&rsquo;t have any {ENTITY_ID_TO_NAME_MAP[entityType]}s on
              your account.
            </FormHelperText>
          ) : null}
        </>
      )}
    </>
  );
};
