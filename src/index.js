import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import { createHistory } from 'history';
import { Router, Route } from 'react-router';
import DevTools from './containers/DevTools';
import { syncReduxAndRouter } from 'redux-simple-router'

const store = configureStore();
const history = createHistory();
syncReduxAndRouter(history, store);

import IndexPage from './containers/IndexPage';
import CounterPage from './containers/CounterPage';
import NotFound from './containers/NotFound';

render(
  <Provider store={store}>
    <div>
      <Router history={history}>
        <Route path="/" component={IndexPage} />
        <Route path="/counter" component={CounterPage} />
        <Route path="*" component={NotFound} />
      </Router>
      <DevTools />
    </div>
  </Provider>,
  document.getElementById('root')
);
