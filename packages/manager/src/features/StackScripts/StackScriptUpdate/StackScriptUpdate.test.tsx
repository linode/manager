import { shallow } from 'enzyme';
import * as React from 'react';

import { StackScriptUpdate } from './StackScriptUpdate';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { stackScripts } from 'src/__data__/stackScripts';

import { normalizedImages as images } from 'src/__data__/images';

describe('StackScriptUpdate', () => {
  const component = shallow(
    <StackScriptUpdate
      {...reactRouterProps}
      classes={{
        backButton: '',
        createTitle: ''
      }}
      username="someguy"
      imagesData={images}
      imagesError={undefined}
      imagesLoading={false}
      userCannotModifyStackScript={false}
      setDocs={jest.fn()}
      clearDocs={jest.fn()}
      stackScript={{ response: stackScripts[0] }}
    />
  );

  it.skip(`should render a confirmation dialog with the title "Clear StackScript Configuration?"`, () => {
    const modalTitle = component
      .find('WithStyles(ConfirmationDialog)')
      .prop('title');
    expect(modalTitle).toBe('Clear StackScript Configuration?');
  });

  it.skip('should render StackScript Form', () => {
    expect(component.find('WithStyles(StackScriptForm)')).toHaveLength(1);
  });

  describe('Breadcrumb', () => {
    const breadcrumb = component.find(
      '[data-qa-update-stackscript-breadcrumb]'
    );
    it.skip('should render', () => {
      expect(breadcrumb).toHaveLength(1);
    });
    it.skip('should include "Edit StackScript" as the label title', () => {
      expect(breadcrumb.prop('labelTitle')).toBe('Edit');
    });
  });
});
