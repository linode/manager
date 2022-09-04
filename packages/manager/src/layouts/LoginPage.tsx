import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import Login from './Login';

const LoginPage: React.FC<RouteComponentProps> = (props) => {
  return (
    <LinodeThemeWrapper>
      <Login {...props} />
    </LinodeThemeWrapper>
  );
};

export default LoginPage;
