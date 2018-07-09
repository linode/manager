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
    const titleText = component.find('WithStyles(Typography)').children().text();
    expect(titleText).toBe('Create New StackScript');
  });

  it('should render two text fields', () => {
    expect(component.find('LinodeTextField')).toHaveLength(2);
  });
  
  it('should render a select field', () => {
    expect(component.find('WithStyles(SSelect)')).toHaveLength(1);
  });

  it('should render a code text field', () => {
    // render code text
  });
});