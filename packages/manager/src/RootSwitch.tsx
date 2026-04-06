import { useLocation, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { FramelessRoot } from './FramelessRoot';
import { Root } from './Root';

export const RootSwitch = () => {
  const location = useLocation();
  const params = useParams({
    strict: false,
  });

  if (location.pathname.includes('/lish/') && params.linodeId && params.type) {
    return <FramelessRoot />;
  }

  return <Root />;
};
