import * as React from 'react';
import { Link } from 'react-router-dom';

export const substituteLink = (text: string, substr: string, path: string) => {
  const loc = text.toLowerCase().indexOf(substr.toLowerCase());
  if (loc === -1) {
    return text;
  }
  return (
    <React.Fragment>
      {text.substr(0, loc)}
      <Link to={path}>{text.substr(loc, substr.length)}</Link>
      {text.slice(loc + substr.length)}
    </React.Fragment>
  );
};

export default substituteLink;
