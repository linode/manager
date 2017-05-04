import React from 'react';
import { Link } from 'react-router';


export default function IndexLayout(props) {
  const { route } = props;

  return (
    <div>
      {props.children}
    </div>
  );
}
