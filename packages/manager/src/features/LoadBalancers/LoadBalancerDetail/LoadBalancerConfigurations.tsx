import React from 'react';
import { useParams } from 'react-router-dom';
import { Waypoint } from 'react-waypoint';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { useLoabalancerConfigurationsInfiniteQuery } from 'src/queries/aglb/configurations';

import { ConfigurationAccordion } from './Configurations/ConfigurationAccordion';

export const LoadBalancerConfigurations = () => {
  const { loadbalancerId } = useParams<{ loadbalancerId: string }>();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useLoabalancerConfigurationsInfiniteQuery(Number(loadbalancerId));

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error[0].reason} />;
  }

  const configurations = data?.pages.flatMap((page) => page.data);

  return (
    <>
      {configurations?.map((configuration) => (
        <ConfigurationAccordion
          configuration={configuration}
          key={configuration.id}
          loadbalancerId={Number(loadbalancerId)}
        />
      ))}
      {hasNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
      {isFetchingNextPage && <CircleProgress mini />}
    </>
  );
};
