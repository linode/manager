import * as React from 'react';
import { compose } from 'recompose';
import NavItem, { PrimaryLink } from './NavItem';
// import { sendAdaEvent } from 'src/utilities/ga';

interface Props {
  closeMenu: () => void;
  linkClasses: (href?: string) => string;
  listItemClasses: string;
  dividerClasses: string;
}

type CombinedProps = Props;

const AdditionalMenuItems: React.FC<CombinedProps> = props => {
  // const [adaError, setAdaError] = React.useState<string>('');

  // React.useEffect(() => {
  //   /*
  //    * Init Ada Chaperone chat app
  //    * Script is included in index.html
  //    */
  //   if ('AdaChaperone' in window) {
  //     ada = new (window as any).AdaChaperone('linode');
  //   } else {
  //     setAdaError(
  //       'There was an issue loading the support bot. Please try again later.'
  //     );
  //   }
  // });

  // const handleAdaInit = () => {
  //   /*
  //    * Show the Ada chat
  //    */

  //   if (typeof ada === 'undefined') {
  //     return;
  //   }

  //   setAdaError('');
  //   sendAdaEvent();
  //   ada.show();
  // };

  const links: PrimaryLink[] = [
    { display: 'Get Help', href: '/support', key: 'help' }
    // {
    //   display: 'Support Bot',
    //   key: 'chat',
    //   onClick: handleAdaInit,
    //   isDisabled: () => adaError
    // }
  ];

  /** ada chat bot */
  // let ada: any;

  return (
    <React.Fragment>
      {links.map(eachLink => {
        return <NavItem {...eachLink} {...props} key={eachLink.key} />;
      })}
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props>(React.memo)(AdditionalMenuItems);
