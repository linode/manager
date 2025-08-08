import { entityTransfersQueryKey, useCreateTransfer } from '@linode/queries';
import Grid from '@mui/material/Grid';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { sendEntityTransferCreateEvent } from 'src/utilities/analytics/customEventAnalytics';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { countByEntity } from '../utilities';
import {
  StyledNotice,
  StyledRootGrid,
  StyledSidebarGrid,
} from './EntityTransferCreate.styles';
import { LinodeTransferTable } from './LinodeTransferTable';
import { TransferCheckoutBar } from './TransferCheckoutBar';
import { TransferHeader } from './TransferHeader';
import { defaultTransferState, transferReducer } from './transferReducer';

import type { Entity, TransferableEntity } from './transferReducer';
import type { CreateTransferPayload } from '@linode/api-v4';
import type { QueryClient } from '@tanstack/react-query';

export const EntityTransfersCreate = () => {
  const navigate = useNavigate();
  const { error, isPending, mutateAsync: createTransfer } = useCreateTransfer();
  const queryClient = useQueryClient();

  /**
   * Reducer and helpers for working with the payload/selection process
   */

  const [state, dispatch] = React.useReducer(
    transferReducer,
    defaultTransferState
  );

  const addEntitiesToTransfer =
    (entityType: TransferableEntity) => (entitiesToAdd: Entity[]) => {
      dispatch({ entitiesToAdd, entityType, type: 'ADD' });
    };

  const removeEntitiesFromTransfer =
    (entityType: TransferableEntity) => (entitiesToRemove: string[]) => {
      dispatch({ entitiesToRemove, entityType, type: 'REMOVE' });
    };

  const toggleEntity = (entityType: TransferableEntity) => (entity: Entity) => {
    dispatch({ entity, entityType, type: 'TOGGLE' });
  };

  /**
   * Helper functions
   */

  const handleCreateTransfer = (
    payload: CreateTransferPayload,
    queryClient: QueryClient
  ) => {
    createTransfer(payload, {
      onSuccess: (transfer) => {
        // @analytics
        const entityCount = countByEntity(transfer.entities);
        sendEntityTransferCreateEvent(entityCount);

        queryClient.invalidateQueries({
          queryKey: [entityTransfersQueryKey],
        });
        navigate({
          to: '/account/service-transfers',
          state: (prev) => ({ ...prev, transfer }),
        });
      },
    }).catch((_) => null);
  };

  return (
    <>
      <DocumentTitleSegment segment="Make a Service Transfer" />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Service Transfers',
              position: 2,
            },
          ],
          labelOptions: { noCap: true },
          pathname: location.pathname,
        }}
        title="Make a Service Transfer"
      />
      {error ? (
        <StyledNotice
          text={getAPIErrorOrDefault(error)[0].reason}
          variant="error"
        />
      ) : null}
      <StyledRootGrid container direction="row" spacing={3} wrap="wrap">
        <Grid
          size={{
            lg: 9,
            md: 8,
            xs: 12,
          }}
        >
          <TransferHeader />
          <LinodeTransferTable
            handleRemove={removeEntitiesFromTransfer('linodes')}
            handleSelect={addEntitiesToTransfer('linodes')}
            handleToggle={toggleEntity('linodes')}
            selectedLinodes={state.linodes}
          />
        </Grid>
        <StyledSidebarGrid size={{ lg: 3, md: 4, xs: 12 }}>
          <TransferCheckoutBar
            handleSubmit={(payload) =>
              handleCreateTransfer(payload, queryClient)
            }
            isCreating={isPending}
            removeEntities={removeEntitiesFromTransfer}
            selectedEntities={state}
          />
        </StyledSidebarGrid>
      </StyledRootGrid>
    </>
  );
};
