import { shallow } from 'enzyme';
import * as React from 'react';
import { images } from 'src/__data__/images';
import { linode1 } from 'src/__data__/linodes';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { RebuildFromImage } from './RebuildFromImage';

jest.mock('src/services/linodes', () => ({
  rebuildLinode: jest.fn().mockImplementation(() => Promise.resolve(linode1))
}));

describe('RebuildFromImage', () => {
  const wrapper = shallow(
    <RebuildFromImage
      classes={{ root: '', error: '' }}
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

  it('renders a SelectImage panel with images', () => {
    expect(wrapper.find('[data-qa-select-image]')).toHaveLength(1);
    expect(wrapper.find('[data-qa-select-image]').prop('images')).toEqual(
      images
    );
  });

  it('defaults the selectedImage to an empty string', () => {
    expect(wrapper.find('[data-qa-select-image]').prop('selectedImageID')).toBe(
      ''
    );
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
