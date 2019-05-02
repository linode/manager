import { shallow } from 'enzyme';
import * as React from 'react';
import { images } from 'src/__data__/images';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { RebuildFromStackScript } from './RebuildFromStackScript';

// @todo: These tests don't work now that RebuildFromStackScript has been Formik'd
describe.skip('RebuildFromImage', () => {
  const wrapper = shallow(
    <RebuildFromStackScript
      classes={{
        root: '',
        error: '',
        emptyImagePanel: '',
        emptyImagePanelText: ''
      }}
      linodeId={1234}
      imagesData={images}
      imagesLoading={false}
      userSSHKeys={[]}
      closeSnackbar={jest.fn()}
      enqueueSnackbar={jest.fn()}
      {...reactRouterProps}
    />
  );

  it('renders without crashing', () => {
    expect(wrapper).toHaveLength(1);
  });

  it('renders a SelectStackScript panel with images', () => {
    expect(wrapper.find('[data-qa-select-stackscript]')).toHaveLength(1);
  });

  it('defaults the selectedImage to undefined', () => {
    expect(
      wrapper.find('[data-qa-select-stackscript]').prop('selectedId')
    ).toBe(undefined);
  });

  it('renders an AccessPanel', () => {
    expect(wrapper.find('[data-qa-access-panel]')).toHaveLength(1);
  });

  it('defaults the password to an empty string', () => {
    expect(wrapper.find('[data-qa-access-panel]').prop('password')).toBe('');
  });

  it('renders an Rebuild Button', () => {
    expect(wrapper.find('[data-qa-rebuild]')).toHaveLength(1);
  });
});
