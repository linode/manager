import * as React from 'react';

import SupportSearchLanding from 'src/features/Help/SupportSearchLanding/SupportSearchLanding';

import type { AlgoliaState as AlgoliaProps } from 'src/features/Help/SearchHOC';

export const SupportSearchLandingWrapper = (props: AlgoliaProps) => {
  return <SupportSearchLanding {...props} />;
};
