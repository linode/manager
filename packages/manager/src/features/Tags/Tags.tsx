import { createLazyRoute } from '@tanstack/react-router';
import { useAllTagsQuery } from 'src/queries/tags';
import React from 'react';
import { Box } from '@linode/ui';

const Tags = () => {
  const { data: tags, isLoading, error } = useAllTagsQuery();

  return (
    <Box>
      {tags?.map((tag) => (
        <p key={tag.label}>{tag.label}</p>
      ))}
    </Box>
  );
};

export const tagsLandingLazyRoute = createLazyRoute('/')({
  component: Tags,
});
