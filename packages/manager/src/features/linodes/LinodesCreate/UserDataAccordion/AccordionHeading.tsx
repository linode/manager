import * as React from 'react';
import Link from 'src/components/Link';
import { StyledHelpIcon } from './UserDataAccordion.styles';

interface Props {
  warningNotice?: JSX.Element;
}

const AccordionHeading = (props: Props) => {
  const { warningNotice } = props;

  return (
    <>
      Add User Data{' '}
      <StyledHelpIcon
        text={
          <>
            User data is part of a virtual machine&rsquo;s cloud-init metadata
            containing information related to a user&rsquo;s local account.{' '}
            <Link to="/">Learn more.</Link>
          </>
        }
        interactive
      />
      {warningNotice ?? warningNotice}
    </>
  );
};

export default AccordionHeading;
