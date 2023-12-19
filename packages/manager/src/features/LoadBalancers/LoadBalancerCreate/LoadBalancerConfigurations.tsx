import { useFormikContext } from 'formik';
import * as React from 'react';
import { useState } from 'react';

import { AddRouteDrawer } from './AddRouteDrawer';
import { EditRouteDrawer } from './EditRouteDrawer';
import { LoadBalancerConfiguration } from './LoadBalancerConfiguration';
import { ServiceTargetDrawer } from './ServiceTargetDrawer';

import type { CreateLoadbalancerPayload } from '@linode/api-v4';

export interface Handlers {
  handleAddRoute: (configurationIndex: number) => void;
  handleAddServiceTraget: (configurationIndex: number) => void;
  handleCloseServiceTargetDrawer: () => void;
  handleEditRoute: (index: number, configurationIndex: number) => void;
  handleEditServiceTraget: (index: number, configurationIndex: number) => void;
}

export const LoadBalancerConfigurations = () => {
  const { values } = useFormikContext<CreateLoadbalancerPayload>();

  const [isServiceTargetDrawerOpen, setIsServiceTargetDrawerOpen] = useState(
    false
  );
  const [isAddRouteDrawerOpen, setIsAddRouteDrawerOpen] = useState(false);
  const [isEditRouteDrawerOpen, setIsEditRouteDrawerOpen] = useState(false);

  const [
    selectedServiceTargetIndex,
    setSelectedServiceTargetIndex,
  ] = useState<number>();
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>();
  const [
    selectedConfigurationIndex,
    setSelectedConfigurationIndex,
  ] = useState<number>(0);

  const handleEditServiceTraget = (
    index: number,
    configurationIndex: number
  ) => {
    setSelectedConfigurationIndex(configurationIndex);
    setSelectedServiceTargetIndex(index);
    setIsServiceTargetDrawerOpen(true);
  };

  const handleAddServiceTraget = (configurationIndex: number) => {
    setSelectedConfigurationIndex(configurationIndex);
    setIsServiceTargetDrawerOpen(true);
  };

  const handleEditRoute = (index: number, configurationIndex: number) => {
    setSelectedConfigurationIndex(configurationIndex);
    setSelectedRouteIndex(index);
    setIsEditRouteDrawerOpen(true);
  };

  const handleAddRoute = (configurationIndex: number) => {
    setIsAddRouteDrawerOpen(true);
    setSelectedConfigurationIndex(configurationIndex);
  };

  const handleCloseServiceTargetDrawer = () => {
    setSelectedServiceTargetIndex(undefined);
    setIsServiceTargetDrawerOpen(false);
  };

  const handlers: Handlers = {
    handleAddRoute,
    handleAddServiceTraget,
    handleCloseServiceTargetDrawer,
    handleEditRoute,
    handleEditServiceTraget,
  };

  return (
    <>
      {values.configurations?.map((configuration, index) => (
        <LoadBalancerConfiguration
          handlers={handlers}
          index={index}
          key={index}
        />
      ))}
      <ServiceTargetDrawer
        onClose={() => {
          setIsServiceTargetDrawerOpen(false);
          setSelectedServiceTargetIndex(undefined);
        }}
        configurationIndex={selectedConfigurationIndex}
        open={isServiceTargetDrawerOpen}
        serviceTargetIndex={selectedServiceTargetIndex}
      />
      <AddRouteDrawer
        protocol={
          values.configurations?.[selectedConfigurationIndex].protocol ?? 'tcp'
        }
        configurationIndex={selectedConfigurationIndex}
        onClose={() => setIsAddRouteDrawerOpen(false)}
        open={isAddRouteDrawerOpen}
      />
      <EditRouteDrawer
        configurationIndex={selectedConfigurationIndex}
        onClose={() => setIsEditRouteDrawerOpen(false)}
        open={isEditRouteDrawerOpen}
        routeIndex={selectedRouteIndex}
      />
    </>
  );
};
