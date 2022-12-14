import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import SnackBar from 'src/components/SnackBar';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import Login from './Login';

const LoginPage: React.FC<RouteComponentProps> = (props) => {
  return (
    <LinodeThemeWrapper>
      <SnackBar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        maxSnack={3}
        autoHideDuration={4000}
        data-qa-toast
        hideIconVariant={true}
      >
        <Login {...props} />
      </SnackBar>
    </LinodeThemeWrapper>
  );
};

export default LoginPage;
