import { Image } from '@linode/api-v4/lib/images';
import { Linode } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';

import { NavTab, NavTabs } from 'src/components/NavTabs/NavTabs';
import { RenderGuard } from 'src/components/RenderGuard';
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
  history: RouteComponentProps<{}>['history'];
  location: RouteComponentProps<{}>['location'];
  publicImages: Record<string, Image>;
  queryString: string;
}

type CombinedProps = Props & RouteComponentProps<{}>;

const SelectStackScriptPanel = (props: CombinedProps) => {
  const { publicImages } = props;
  const { data: profile } = useProfile();
  const username = profile?.username || '';

  const tabs: NavTab[] = [
    {
      render: (
        <StackScriptPanelContent
          category="account"
          currentUser={username}
          key="account-tab"
          publicImages={publicImages}
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
          currentUser={username}
          key="community-tab"
          publicImages={publicImages}
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
