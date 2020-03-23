import { shallow } from 'enzyme';
import * as React from 'react';

import { normalizedImages } from 'src/__data__/images';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { StackScriptsLanding } from './StackScriptsLanding';

describe('StackScripts Landing', () => {
  const component = shallow(
    <StackScriptsLanding
      imagesData={normalizedImages}
      imagesLoading={false}
      imagesError={{}}
      {...reactRouterProps}
    />
  );

  it('should have an Icon Text Link', () => {
    expect(component.find('[data-qa-create-new-stackscript]')).toHaveLength(1);
  });

  it('icon text link text should read "Create New StackScript"', () => {
    const iconText = component
      .find('[data-qa-create-new-stackscript]')
      .prop('label');
    expect(iconText).toBe('Create New StackScript');
  });

  it('should render SelectStackScriptPanel', () => {
    expect(
      component.find(
        'Connect(WithTheme(WithRenderGuard(WithStyles(SelectStackScriptPanel))))'
      )
    ).toHaveLength(1);
  });
});
