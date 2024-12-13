import { Box, Typography } from '@linode/ui';
import { createLazyRoute } from '@tanstack/react-router';
import React from 'react';

import { useTagObjectsQuery } from 'src/queries/tags';

const Tag = () => {
  const params = tagDetailsLazyRoute.useParams();
  const { data: objects, isLoading, error } = useTagObjectsQuery(params.tag);

  return (
    <Box>
      <Typography variant="h1">{params.tag}</Typography>
      {objects?.data?.map((object) => (
        <pre key={object.data.id}>{JSON.stringify(object, null, 2)}</pre>
      ))}
    </Box>
  );
};

export const tagDetailsLazyRoute = createLazyRoute('/tags/$tag')({
  component: Tag,
});
