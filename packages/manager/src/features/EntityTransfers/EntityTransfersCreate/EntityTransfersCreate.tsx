import { CreateTransferPayload } from '@linode/api-v4/lib/entity-transfers';
import Grid from '@mui/material/Unstable_Grid2';
import { curry } from 'ramda';
import * as React from 'react';
import { QueryClient, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { queryKey, useCreateTransfer } from 'src/queries/entityTransfers';
import { sendEntityTransferCreateEvent } from 'src/utilities/analytics';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { countByEntity } from '../utilities';
import {
  StyledNotice,
  StyledRootGrid,
  StyledSidebarGrid,
} from './EntityTransferCreate.styles';
import { LinodeTransferTable } from './LinodeTransferTable';
import TransferCheckoutBar from './TransferCheckoutBar';
import { TransferHeader } from './TransferHeader';
import {
  TransferableEntity,
  defaultTransferState,
  transferReducer,
} from './transferReducer';

export const EntityTransfersCreate = () => {
  const { push } = useHistory();
  const { error, isLoading, mutateAsync: createTransfer } = useCreateTransfer();
  const queryClient = useQueryClient();

  /**
   * Reducer and helpers for working with the payload/selection process
   */

  const [state, dispatch] = React.useReducer(
    transferReducer,
    defaultTransferState
  );

  const addEntitiesToTransfer = curry(
    (entityType: TransferableEntity, entitiesToAdd: any[]) => {
      dispatch({ entitiesToAdd, entityType, type: 'ADD' });
    }
  );

  const removeEntitiesFromTransfer = curry(
    (entityType: TransferableEntity, entitiesToRemove: any[]) => {
      dispatch({ entitiesToRemove, entityType, type: 'REMOVE' });
    }
  );

  const toggleEntity = curry((entityType: TransferableEntity, entity: any) => {
    dispatch({ entity, entityType, type: 'TOGGLE' });
  });

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

        queryClient.invalidateQueries(queryKey);
        push({ pathname: '/account/service-transfers', state: { transfer } });
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
        <StyledNotice error text={getAPIErrorOrDefault(error)[0].reason} />
      ) : null}
      <StyledRootGrid container direction="row" spacing={3} wrap="wrap">
        <Grid lg={9} md={8} xs={12}>
          <TransferHeader />
          <LinodeTransferTable
            handleRemove={removeEntitiesFromTransfer('linodes')}
            handleSelect={addEntitiesToTransfer('linodes')}
            handleToggle={toggleEntity('linodes')}
            selectedLinodes={state.linodes}
          />
        </Grid>
        <StyledSidebarGrid lg={3} md={4} xs={12}>
          <TransferCheckoutBar
            handleSubmit={(payload) =>
              handleCreateTransfer(payload, queryClient)
            }
            isCreating={isLoading}
            removeEntities={removeEntitiesFromTransfer}
            selectedEntities={state}
          />
        </StyledSidebarGrid>
      </StyledRootGrid>
    </>
  );
};
