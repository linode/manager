import { shallow } from 'enzyme';
import * as React from 'react';
import { clearDocs, setDocs } from 'src/store/reducers/documentation';

import { StackScriptsLanding } from './StackScriptsLanding';

import { images } from 'src/__data__/images';
import { reactRouterProps } from 'src/__data__/reactRouterProps';

describe('StackScripts Landing', () => {
  const component = shallow(
    <StackScriptsLanding
      images={{ response: images }}
      setDocs={setDocs}
      clearDocs={clearDocs}
      classes={{ root: '', title: '' }}
      {...reactRouterProps}
    />
  )

  it('title of page should read "StackScripts"', () => {
    const titleText = component.find('WithStyles(Typography)[variant="headline"]')
    .children().text();
    expect(titleText).toBe('StackScripts');
  });

  it('should have an Icon Text Link', () => {
    expect(component.find('[data-qa-create-new-stackscript]')).toHaveLength(1);
  });

  it('icon text link text should read "Create New StackScript"', () => {
    const iconText = component.find('[data-qa-create-new-stackscript]').prop('label');
    expect(iconText).toBe('Create New StackScript');
  });

  it('should render SelectStackScriptPanel', () => {
    expect(component.find('Connect(WithRenderGuard(WithStyles(SelectStackScriptPanel)))'))
      .toHaveLength(1);
  });
});
