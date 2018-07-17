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
        createTitle: '',
      }}
      profile={[]}
      images={{ response: images }}
    />
  )

  it('should render a title that reads "Edit StackScript', () => {
    const titleText = component.find('WithStyles(Typography)').first().children().text();
    expect(titleText).toBe('Edit StackScript');
  });

  it(`should render a confirmation dialog with the
  title "Clear StackScript Configuration?"`, () => {
      const modalTitle = component.find('WithStyles(ConfirmationDialog)').prop('title');
      expect(modalTitle).toBe('Clear StackScript Configuration?');
    });

    it('should render StackScript Form',() => {
      expect(component.find('WithStyles(StackScriptForm)')).toHaveLength(1);
    });

    describe('Back Arrow Icon Button', () => {

      it('should render back array icon button', () => {
        const backIcon = component.find('WithStyles(IconButton)').first();
        expect(backIcon.find('pure(KeyboardArrowLeft)')).toHaveLength(1);
      });

      it('back arrow icon should link back to stackscripts landing', () => {
        const backIcon = component.find('WithStyles(IconButton)').first();
        const parentLink = backIcon.closest('Link');
        expect(parentLink.prop('to')).toBe('/stackscripts');
      });
    });
});