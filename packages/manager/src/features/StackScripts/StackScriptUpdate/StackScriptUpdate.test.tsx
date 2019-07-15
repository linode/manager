import { shallow } from 'enzyme';
import * as React from 'react';

import { StackScriptUpdate } from './StackScriptUpdate';

import { reactRouterProps } from 'src/__data__/reactRouterProps';

import { images } from 'src/__data__/images';

describe('StackScriptUpdate', () => {
  const component = shallow(
    <StackScriptUpdate
      {...reactRouterProps}
      classes={{
        titleWrapper: '',
        root: '',
        backButton: '',
        createTitle: ''
      }}
      username="someguy"
      imagesData={images}
      imagesError={undefined}
      imagesLoading={false}
    />
  );

  it(`should render a confirmation dialog with the title "Clear StackScript Configuration?"`, () => {
    const modalTitle = component
      .find('WithStyles(ConfirmationDialog)')
      .prop('title');
    expect(modalTitle).toBe('Clear StackScript Configuration?');
  });

  it('should render StackScript Form', () => {
    expect(component.find('WithStyles(StackScriptForm)')).toHaveLength(1);
  });

  describe('Breadcrumb', () => {
    const breadcrumb = component.find(
      '[data-qa-update-stackscript-breadcrumb]'
    );
    it('should render', () => {
      expect(breadcrumb).toHaveLength(1);
    });
    it('should include "Edit StackScript" as the label title', () => {
      expect(breadcrumb.prop('labelTitle')).toBe('Edit');
    });
  });
});
