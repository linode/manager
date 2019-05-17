import { shallow } from 'enzyme';
import * as React from 'react';

import { StackScriptCreate } from './StackScriptCreate';

import { reactRouterProps } from 'src/__data__/reactRouterProps';

import { images } from 'src/__data__/images';

describe('StackScriptCreate', () => {
  const component = shallow(
    <StackScriptCreate
      {...reactRouterProps}
      classes={{
        titleWrapper: '',
        root: '',
        backButton: '',
        createTitle: ''
      }}
      imagesData={images}
      imagesLoading={false}
      username="someguy"
      images={{ response: images }}
    />
  );
  xit('should render a title that reads "Create New StackScript', () => {
    const titleText = component
      .find('WithStyles(Typography)')
      .first()
      .children()
      .text();
    expect(titleText).toBe('Create New StackScript');
  });

  xit(`should render a confirmation dialog with the
  title "Clear StackScript Configuration?"`, () => {
    const modalTitle = component
      .find('WithStyles(ConfirmationDialog)')
      .prop('title');
    expect(modalTitle).toBe('Clear StackScript Configuration?');
  });

  xit('should render StackScript Form', () => {
    expect(component.find('WithStyles(StackScriptForm)')).toHaveLength(1);
  });

  describe('Back Arrow Icon Button', () => {
    xit('should render back array icon button', () => {
      const backIcon = component.find('WithStyles(IconButton)').first();
      expect(backIcon.find('pure(KeyboardArrowLeft)')).toHaveLength(1);
    });

    xit('back arrow icon should link back to stackscripts landing', () => {
      const backIcon = component.find('WithStyles(IconButton)').first();
      const parentLink = backIcon.closest('Link');
      expect(parentLink.prop('to')).toBe('/stackscripts');
    });
  });

  describe('Breadcrumb', () => {
    const breadcrumb = component.find(
      '[data-qa-create-stackscript-breadcrumb]'
    );
    it('should render', () => {
      expect(breadcrumb).toHaveLength(1);
    });
    it('should include "Create New StackScript" as the label title', () => {
      expect(breadcrumb.prop('labelTitle')).toBe('Create New StackScript');
    });
    it('should take you back to the StackScripts page', () => {
      expect(breadcrumb.prop('linkTo')).toBe('/stackscripts');
    });
  });
});
