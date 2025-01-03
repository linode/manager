import { Box, CircleProgress, Typography } from '@linode/ui';
import { createLazyRoute } from '@tanstack/react-router';
import React from 'react';

import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { useTagObjectsQuery } from 'src/queries/tags';

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
    <Box>
      <LandingHeader createButtonText="Delete" onButtonClick={() => null} />
      {objects.length === 0 && (
        <Typography>No entities with this tag.</Typography>
      )}
      {objects.map((object) => (
        <pre key={object.data.id}>{JSON.stringify(object, null, 2)}</pre>
      ))}
    </Box>
  );
};

export const tagDetailsLazyRoute = createLazyRoute('/tags/$tag')({
  component: Tag,
});
