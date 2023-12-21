import { useFormikContext } from 'formik';
import { useState } from 'react';
import * as React from 'react';

import { AddRouteDrawer } from './AddRouteDrawer';
import { EditRouteDrawer } from './EditRouteDrawer';
import { LoadBalancerConfiguration } from './LoadBalancerConfiguration';
import { RuleDrawer } from './RuleDrawer';
import { ServiceTargetDrawer } from './ServiceTargetDrawer';

import type { CreateLoadbalancerPayload } from '@linode/api-v4';

export interface Handlers {
  handleAddRoute: (configurationIndex: number) => void;
  handleAddRule: (configurationIndex: number, routeIndex: number) => void;
  handleAddServiceTarget: (configurationIndex: number) => void;
  handleCloseRuleDrawer: () => void;
  handleCloseServiceTargetDrawer: () => void;
  handleEditRoute: (index: number, configurationIndex: number) => void;
  handleEditRule: (
    configurationIndex: number,
    routeIndex: number,
    ruleIndex: number
  ) => void;
  handleEditServiceTarget: (index: number, configurationIndex: number) => void;
}

export const LoadBalancerConfigurations = () => {
  const { values } = useFormikContext<CreateLoadbalancerPayload>();

  const [isServiceTargetDrawerOpen, setIsServiceTargetDrawerOpen] = useState(
    false
  );
  const [isAddRouteDrawerOpen, setIsAddRouteDrawerOpen] = useState(false);
  const [isEditRouteDrawerOpen, setIsEditRouteDrawerOpen] = useState(false);
  const [isRuleDrawerOpen, setIsRuleDrawerOpen] = useState(false);

  const [
    selectedServiceTargetIndex,
    setSelectedServiceTargetIndex,
  ] = useState<number>();
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>();
  const [selectedRuleIndex, setSelectedRuleIndex] = useState<number>();
  const [
    selectedConfigurationIndex,
    setSelectedConfigurationIndex,
  ] = useState<number>(0);

  const handleEditServiceTarget = (
    index: number,
    configurationIndex: number
  ) => {
    setSelectedConfigurationIndex(configurationIndex);
    setSelectedServiceTargetIndex(index);
    setIsServiceTargetDrawerOpen(true);
  };

  const handleAddServiceTarget = (configurationIndex: number) => {
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

  const handleEditRule = (
    configurationIndex: number,
    routeIndex: number,
    ruleIndex: number
  ) => {
    setSelectedConfigurationIndex(configurationIndex);
    setSelectedRouteIndex(routeIndex);
    setSelectedRuleIndex(ruleIndex);
    setIsRuleDrawerOpen(true);
  };

  const handleAddRule = (configurationIndex: number, routeIndex: number) => {
    setSelectedConfigurationIndex(configurationIndex);
    setSelectedRouteIndex(routeIndex);
    setIsRuleDrawerOpen(true);
  };

  const handleCloseRuleDrawer = () => {
    setSelectedRuleIndex(undefined);
    setIsRuleDrawerOpen(false);
  };

  const handlers: Handlers = {
    handleAddRoute,
    handleAddRule,
    handleAddServiceTarget,
    handleCloseRuleDrawer,
    handleCloseServiceTargetDrawer,
    handleEditRoute,
    handleEditRule,
    handleEditServiceTarget,
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
      <RuleDrawer
        configurationIndex={selectedConfigurationIndex}
        onClose={handleCloseRuleDrawer}
        open={isRuleDrawerOpen}
        routeIndex={selectedRouteIndex}
        ruleIndexToEdit={selectedRuleIndex}
      />
    </>
  );
};
