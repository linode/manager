import { pathOr } from 'ramda';
import * as React from 'react';

import ErrorState from 'src/components/ErrorState';
import { reportException } from 'src/exceptionReporting';
import { CreateTypes } from 'src/store/linodeCreate/linodeCreate.actions';

export interface Tab {
  title: string;
  render: any;
  type?: CreateTypes;
}

export const safeGetTabRender = (tabs: Tab[], selectedTab: number) => {
  return pathOr(abortAndLogError, [selectedTab, 'render'], tabs);
};

export const abortAndLogError = () => {
  reportException('Attempted to render undefined tab.');
  return <ErrorState errorText={'An unexpected error occurred.'} />;
};
