import { curry } from 'ramda';
import * as React from 'react';
import Breadcrumb from 'src/components/Breadcrumb';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import TransferCheckoutBar from './TransferCheckoutBar';
import TransferHeader from './TransferHeader';
import LinodeTransferTable from './LinodeTransferTable';
import {
  curriedTransferReducer,
  defaultTransferState,
  TransferableEntity
} from './transferReducer';

export const EntityTransfersCreate: React.FC<{}> = _ => {
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
            selectedEntities={state}
            removeEntities={removeEntitiesFromTransfer}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default EntityTransfersCreate;
