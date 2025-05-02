import { useTagObjectsQuery } from '@linode/queries';
import { Button, CircleProgress, Divider, ErrorState, Stack, Typography } from '@linode/ui';
import { createLazyRoute } from '@tanstack/react-router';
import React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';

const Tag = () => {
  const params = tagDetailsLazyRoute.useParams();
  const { data: objects, error, isPending } = useTagObjectsQuery(params.tag);

  if (isPending) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText="Unable to get this Tag's entities" />;
  }

  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        justifyContent="space-between"
        maxHeight="32px"
        spacing={1}
      >
        <LandingHeader />
        <Button buttonType="outlined">View in Search</Button>
        <Button buttonType="outlined">Delete</Button>
      </Stack>
      {objects.length === 0 && (
        <Stack alignItems="center" gap={4} justifyContent="center" pt={4}>
          <Typography fontSize="48px">🚫</Typography>
          <Typography>No entities with this tag</Typography>
        </Stack>
      )}
      <Stack divider={<Divider />} spacing={1}>
      {objects.map((object) => (
        <pre key={object.data.id}>{JSON.stringify(object, null, 2)}</pre>
      ))}
      </Stack>
    </Stack>
  );
};

export const tagDetailsLazyRoute = createLazyRoute('/tags/$tag')({
  component: Tag,
});
