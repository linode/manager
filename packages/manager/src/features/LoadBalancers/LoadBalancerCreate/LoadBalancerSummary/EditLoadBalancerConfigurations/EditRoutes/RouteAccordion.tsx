import React, { useState } from 'react';

import { Accordion } from 'src/components/Accordion';

// import { RulesTable } from '../../RulesTable';
import { EditRouteDrawer } from './EditRouteDrawer';
import { RouteAccordionHeader } from './RouteAccordionHeader';

import type { RoutePayload } from '@linode/api-v4';

interface Props {
  configIndex: number;
  route: RoutePayload;
  routeIndex: number;
}

export const RouteAccordion = ({ configIndex, route, routeIndex }: Props) => {
  const [showEditRouteDrawer, setShowEditRouteDrawer] = useState(false);
  const editRouteHandler = () => {
    setShowEditRouteDrawer(true);
  };
  return (
    <>
      <Accordion
        heading={
          <RouteAccordionHeader
            handleEditRoute={editRouteHandler}
            route={route}
          />
        }
        defaultExpanded={false}
        headingProps={{ sx: { width: '100%' } }}
        sx={{ backgroundColor: '#f4f5f6', paddingLeft: 1, paddingRight: 1.4 }}
      >
        {/* <RulesTable
          onDeleteRule={(index) => null}
          onEditRule={(index) => null}
          route={route}
        /> */}
      </Accordion>
      <EditRouteDrawer
        configIndex={configIndex}
        onClose={() => setShowEditRouteDrawer(!showEditRouteDrawer)}
        open={showEditRouteDrawer}
        routeIndex={routeIndex}
      />
    </>
  );
};
