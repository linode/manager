import * as React from 'react';
import { Link, LinkProps } from 'react-router-dom';

interface Props {
  title?: string;
  description?: string;
  text: string;
  onClick?: LinkProps['onClick'];
}

const SupportLink = (props: Props) => {
  const { description, text, title, onClick } = props;
  return (
    <Link
      to={{
        pathname: '/support/tickets',
        state: {
          open: true,
          title,
          description,
        },
      }}
      onClick={onClick}
    >
      {text}
    </Link>
  );
};

export default SupportLink;
