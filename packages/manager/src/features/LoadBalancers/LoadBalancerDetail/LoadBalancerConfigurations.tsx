import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Waypoint } from 'react-waypoint';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { useLoabalancerConfigurationsInfiniteQuery } from 'src/queries/aglb/configurations';

import { ConfigurationAccordion } from './Configurations/ConfigurationAccordion';
import { ConfigurationForm } from './Configurations/ConfigurationForm';

export const LoadBalancerConfigurations = () => {
  const { loadbalancerId } = useParams<{ loadbalancerId: string }>();
  const history = useHistory();

  const [isCreating, setIsCreating] = useState(false);

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
        />
      ))}
      {hasNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
      {isFetchingNextPage && <CircleProgress mini />}
      <Stack my={2} spacing={2}>
        <Box>
          <Button buttonType="outlined" onClick={() => setIsCreating(true)}>
            Add {configurations?.length === 0 ? '' : 'another'} Configuration
          </Button>
        </Box>
        {isCreating && (
          <Paper>
            <ConfigurationForm
              onSuccess={(configuration) => {
                history.push(
                  `/loadbalancers/${loadbalancerId}/configurations/${configuration.id}`
                );
                setIsCreating(false);
              }}
              mode="create"
              onCancel={() => setIsCreating(false)}
            />
          </Paper>
        )}
      </Stack>
    </>
  );
};
