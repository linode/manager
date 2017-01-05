import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';

import StyleguideIndex from '~/styleguide/layouts/StyleguideIndex';
import {
  Overview,
  Colors,
  Typography,
  Iconography,
  WritingStyle,
  Buttons,
  Tabs,
  Navigation,
  Forms,
  Modals
} from '~/styleguide/components/sections';


export default (
  <Route path="/styleguide" component={StyleguideIndex}>
    <IndexRedirect to="overview" />
    <Route path="overview" component={Overview} />
    <Route path="colors" component={Colors} />
    <Route path="typography" component={Typography} />
    <Route path="iconography" component={Iconography} />
    <Route path="writing-style" component={WritingStyle} />
    <Route path="buttons" component={Buttons} />
    <Route path="tabs" component={Tabs} />
    <Route path="navigation" component={Navigation} />
    <Route path="forms" component={Forms} />
    <Route path="modals" component={Modals} />
  </Route>
);
