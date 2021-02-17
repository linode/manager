import { APIError } from '@linode/api-v4/lib/types';
import { CreateTransferPayload } from '@linode/api-v4/lib/entity-transfers';
import { curry } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Breadcrumb from 'src/components/Breadcrumb';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import { useCreateTransfer } from 'src/queries/entityTransfers';
import TransferCheckoutBar from './TransferCheckoutBar';
import TransferHeader from './TransferHeader';
import LinodeTransferTable from './LinodeTransferTable';
import {
  curriedTransferReducer,
  defaultTransferState,
  TransferableEntity
} from './transferReducer';
import Notice from 'src/components/Notice';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

export const EntityTransfersCreate: React.FC<{}> = _ => {
  const { push } = useHistory();
  const { mutateAsync: createTransfer } = useCreateTransfer();

  /**
   * State variables for creating the transfer
   */
  const [isCreating, setCreating] = React.useState(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);

  /**
   * Reducer and helpers for working with the payload/selection process
   */
  const [state, dispatch] = React.useReducer(
    curriedTransferReducer,
    defaultTransferState
  );

  const addEntitiesToTransfer = curry(
    (entityType: TransferableEntity, entitiesToAdd: any[]) => {
      dispatch({ type: 'ADD', entityType, entitiesToAdd });
    }
  );

  const removeEntitiesFromTransfer = curry(
    (entityType: TransferableEntity, entitiesToRemove: any[]) => {
      dispatch({ type: 'REMOVE', entityType, entitiesToRemove });
    }
  );

  const toggleEntity = curry((entityType: TransferableEntity, entity: any) => {
    dispatch({ type: 'TOGGLE', entityType, entity });
  });

  /**
   * Helper functions
   */

  const handleCreateTransfer = (payload: CreateTransferPayload) => {
    setErrors(undefined);
    setCreating(true);
    createTransfer(payload)
      .then(transfer => {
        // Transfer is the new transfer object; send it off to the modal.
        setCreating(false);
        push({ pathname: '/account/entity-transfers', state: { transfer } });
      })
      .catch(err => {
        setErrors(getAPIErrorOrDefault(err, 'Error creating this transfer.'));
        setCreating(false);
      });
  };

  return (
    <>
      <DocumentTitleSegment segment="Make a Transfer" />
      <Breadcrumb
        pathname={location.pathname}
        labelTitle="Make a Transfer"
        labelOptions={{ noCap: true }}
        crumbOverrides={[
          {
            position: 2,
            label: 'Transfers'
          }
        ]}
      />
      {errors ? <Notice error text={errors[0].reason} /> : null}
      <Grid container>
        <Grid item xs={9}>
          <TransferHeader />
          <LinodeTransferTable
            selectedLinodes={state.linodes}
            handleSelect={addEntitiesToTransfer('linodes')}
            handleRemove={removeEntitiesFromTransfer('linodes')}
            handleToggle={toggleEntity('linodes')}
          />
        </Grid>
        <Grid item xs={3} className="mlSidebar">
          <TransferCheckoutBar
            isCreating={isCreating}
            selectedEntities={state}
            removeEntities={removeEntitiesFromTransfer}
            handleSubmit={handleCreateTransfer}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default EntityTransfersCreate;
