import React from 'react';

import Error from './Error';


export default function NotFound() {
  return (<Error status={404} />);
}
