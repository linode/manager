import 'font-logos/assets/font-logos.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AuthenticationWrapper from 'src/components/AuthenticationWrapper';
import DefaultLoader from 'src/components/DefaultLoader';
import SnackBar from 'src/components/SnackBar';
import 'src/exceptionReporting';
import Logout from 'src/layouts/Logout';
import OAuthCallbackPage from 'src/layouts/OAuth';
import store from 'src/store';
import 'src/utilities/createImageBitmap';
import 'src/utilities/request';
import Application from './Application';
import './events';
import './index.css';
import Layout from './Layout';
import LinodeThemeWrapper from './LinodeThemeWrapper';

const Lish = DefaultLoader({
  loader: () => import('src/features/Lish')
});

const renderNull = () => <div />;

ReactDOM.render(
  <Application>
    <Provider store={store}>
      <LinodeThemeWrapper>
        {toggleTheme => (
          <SnackBar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            maxSnack={3}
            autoHideDuration={4000}
            data-qa-toast
            hideIconVariant={true}
          >
            <Router>
              <Switch>
                <Route path="/linodes/:linodeId/lish" compo={Lish} />
                {/* A place to go that prevents the app from loading while injecting OAuth tokens */}
                <Route exact path="/null" render={renderNull} />
                <Route
                  render={() => (
                    <AuthenticationWrapper>
                      <Switch>
                        <Route
                          exact
                          path="/oauth/callback"
                          component={OAuthCallbackPage}
                        />
                        {/* A place to go that prevents the app from loading while refreshing OAuth tokens */}
                        <Route exact path="/nullauth" render={renderNull} />
                        <Route exact path="/logout" component={Logout} />
                        <Route
                          render={routeProps => (
                            <Layout toggleTheme={toggleTheme} {...routeProps} />
                          )}
                        />
                      </Switch>
                    </AuthenticationWrapper>
                  )}
                />
              </Switch>
            </Router>
          </SnackBar>
        )}
      </LinodeThemeWrapper>
    </Provider>
  </Application>,
  document.getElementById('root') as HTMLElement
);
