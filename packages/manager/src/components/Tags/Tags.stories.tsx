import * as React from 'react';

import Tags from './Tags';

export default {
  title: 'Tags',
};

export const TagsListWithoutShowMore = () => {
  return <Tags tags={['tagOne', 'tagTwo', 'someStrangeLongTagWithNumber123']} />;
};

TagsListWithoutShowMore.story = {
  name: 'Tags list without show more',
};

export const TagsListWithShowMore = () => {
  return <Tags tags={['tagOne', 'tagTwo', 'someStrangeLongTagWithNumber123', 'Tag1', 'Tag2']} />;
};

TagsListWithShowMore.story = {
  name: 'Tags list with show more',
};
