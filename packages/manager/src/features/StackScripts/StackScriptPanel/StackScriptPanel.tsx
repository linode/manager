import { Image } from '@linode/api-v4/lib/images';
import { Linode } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { NavTab, NavTabs } from 'src/components/NavTabs/NavTabs';
import RenderGuard from 'src/components/RenderGuard';
import { useProfile } from 'src/queries/profile';
import {
  getCommunityStackscripts,
  getMineAndAccountStackScripts,
} from '../stackScriptUtils';

const StackScriptPanelContent = React.lazy(
  () => import('./StackScriptPanelContent')
);

export interface ExtendedLinode extends Linode {
  heading: string;
  subHeadings: string[];
}

interface Props {
  error?: string;
  publicImages: Record<string, Image>;
  queryString: string;
  history: RouteComponentProps<{}>['history'];
  location: RouteComponentProps<{}>['location'];
}

type CombinedProps = Props & RouteComponentProps<{}>;

const SelectStackScriptPanel: React.FC<CombinedProps> = (props) => {
  const { publicImages } = props;
  const { data: profile } = useProfile();
  const username = profile?.username || '';

  const tabs: NavTab[] = [
    {
      render: (
        <StackScriptPanelContent
          category="account"
          key="account-tab"
          publicImages={publicImages}
          currentUser={username}
          request={getMineAndAccountStackScripts}
        />
      ),
      routeName: `/stackscripts/account`,
      title: 'Account StackScripts',
    },
    {
      render: (
        <StackScriptPanelContent
          category="community"
          key="community-tab"
          publicImages={publicImages}
          currentUser={username}
          request={getCommunityStackscripts}
        />
      ),
      routeName: `/stackscripts/community`,
      title: 'Community StackScripts',
    },
  ];

  return <NavTabs tabs={tabs} />;
};

export default compose<CombinedProps, Props>(RenderGuard)(
  SelectStackScriptPanel
);
