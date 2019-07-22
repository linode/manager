import { pathOr } from 'ramda';
import * as React from 'react';

import ErrorState from 'src/components/ErrorState';
import { reportException } from 'src/exceptionReporting';
import { CreateTypes } from 'src/store/linodeCreate/linodeCreate.actions';

export interface Tab {
  title: string | JSX.Element;
  render: any;
  type?: CreateTypes;
}

export const safeGetTabRender = (tabs: Tab[], selectedTab: number) => {
  const abortAndLogError = () => {
    /**
     * a failure usually means we tried to render an undefined tab,
     * which would crash the app if we didn't catch it. Report the
     * error and return a default error render() function.
     */

    reportException('Attempted to render undefined tab.', {
      'Selected tab': selectedTab,
      Location: window.location.search
    });
    return <ErrorState errorText={'An unexpected error occurred.'} />;
  };

  return pathOr(abortAndLogError, [selectedTab, 'render'], tabs);
};
