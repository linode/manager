import React from 'react';
import { useParams } from 'react-router-dom';
import { Waypoint } from 'react-waypoint';

import { CircleProgress } from 'src/components/CircleProgress';
import { useLoabalancerConfigurationsInfiniteQuery } from 'src/queries/aglb/configurations';

import { ConfigurationAccordion } from './Configurations/ConfigurationAccordion';

export const LoadBalancerConfigurations = () => {
  const { loadbalancerId } = useParams<{ loadbalancerId: string }>();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useLoabalancerConfigurationsInfiniteQuery(Number(loadbalancerId));

  if (isLoading) {
    return <CircleProgress />;
  }

  const configurations = data?.pages.flatMap((page) => page.data);

  return (
    <>
      {configurations?.map((configuration) => (
        <ConfigurationAccordion
          configuration={configuration}
          key={configuration.id}
        />
      ))}
      {hasNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
      {isFetchingNextPage && <CircleProgress mini />}
    </>
  );
};
