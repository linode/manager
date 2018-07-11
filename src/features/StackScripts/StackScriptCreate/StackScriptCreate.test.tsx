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
        createTitle: '',
      }}
      profile={[]}
      images={{ response: images }}
    />
  )
  it('should render a title that reads "Create New StackScript', () => {
    const titleText = component.find('WithStyles(Typography)').first().children().text();
    expect(titleText).toBe('Create New StackScript');
  });

  // it('should render three text fields', () => {
  //   expect(component.find('LinodeTextField')).toHaveLength(4);
  // });

  it('should render a select field', () => {
    expect(component.find('WithStyles(SSelect)')).toHaveLength(1);
  });

  it('should render a code text field', () => {
    // not done yet!!
  });

  it('should render a checkbox', () => {
    expect(component.find('WithStyles(LinodeCheckBox)')).toHaveLength(1);
  });

  it(`should render a confirmation dialog with the
  title "Clear StackScript Configuration?"`, () => {
      const modalTitle = component.find('WithStyles(ConfirmationDialog)').prop('title');
      expect(modalTitle).toBe('Clear StackScript Configuration?');
    });
});