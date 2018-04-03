import * as React from 'react';
import { Route } from 'react-router-dom';

export type RouteTab = {
  title: string,
  routeName: string,
  renderRoute: (path: string) => React.ReactNode;
};

export const genTab = (
  title: string,
  routeName: string,
  component: React.ComponentClass,
): RouteTab => {
  return {
    title,
    routeName,
    renderRoute: (path: string) =>
      <Route key={title} component={component} path={`${routeName}`} />,
  };
};
