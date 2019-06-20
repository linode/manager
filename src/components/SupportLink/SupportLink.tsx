import * as React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  title?: string;
  description?: string;
  text: string;
}

type CombinedProps = Props;

const SupportLink: React.FunctionComponent<CombinedProps> = props => {
  const { description, text, title } = props;
  return (
    <Link
      to={{
        pathname: '/support/tickets',
        state: {
          open: true,
          title,
          description
        }
      }}
    >
      {text}
    </Link>
  );
};

export default SupportLink;
