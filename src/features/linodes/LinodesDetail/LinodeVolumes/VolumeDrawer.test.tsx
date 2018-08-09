import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';

import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

import VolumeDrawer from './VolumeDrawer';

const getLabelField = (w: ReactWrapper): ReactWrapper => w.find('TextField[data-qa-volume-label]');
const getSizeField = (w: ReactWrapper): ReactWrapper => w.find('TextField[data-qa-size]');
const getRegionField = (w: ReactWrapper): ReactWrapper => w.find('TextField[data-qa-region]');
const getLinodeField = (w: ReactWrapper): ReactWrapper => w.find('TextField[data-qa-attach-to]');
const getModeRadioGroup = (w: ReactWrapper): ReactWrapper => w.find('RadioGroup[data-qa-mode-radio-group]')

describe('LinodeVolumes/VolumeDrawer', () => {
  const onSubmit = jest.fn();
  const onClose = jest.fn();

  const wrapper = mount(
    <LinodeThemeWrapper>
      <VolumeDrawer
        label={''}
        linodeId={1}
        mode={'create'}
        open={true}
        region={'us-east'}
        size={20}
        title={'what'}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </LinodeThemeWrapper>
  );
  const submitButton = wrapper.find('Button[data-qa-submit]');
  const cancelButton = wrapper.find('Button[data-qa-cancel]');

  it('should mount', () => {
    expect(wrapper.length).toBe(1);
  });

  describe('submit button', () => {
    it('should exist', () => {
      expect(submitButton.length).toBe(1)
    });

    it('should call onSubmit when clicked', () => {
      submitButton.simulate('click');
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancel button', () => {
    it('should exist', () => {
      expect(cancelButton.length).toBe(1);
    });

    it('should call onClose when clicked', () => {
      cancelButton.simulate('click');
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('create or attach', () => {
    let createWrapper: ReactWrapper;
    beforeEach(() => {
      createWrapper = mount(
        <LinodeThemeWrapper>
          <VolumeDrawer
            label={''}
            linodeId={1}
            mode={'create'}
            open={true}
            region={'us-east'}
            size={20}
            title={'what'}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        </LinodeThemeWrapper>
      );
    })

    it('should have a label field', () => {
      const labelField = getLabelField(createWrapper);
      expect(labelField.length).toBe(1);
    });

    it('should have a size field', () => {
      const sizeField = getSizeField(createWrapper);
      expect(sizeField.length).toBe(1);
    });

    /** Skipped until we can figure out how to setState on non-root components. */
    describe.skip('with attachable volumes', () => {
      beforeEach(() => {
        createWrapper = mount(
          <LinodeThemeWrapper>
            <VolumeDrawer
              label={''}
              linodeId={1}
              mode={'create'}
              open={true}
              region={'us-east'}
              size={20}
              title={'what'}
              onClose={onClose}
              onSubmit={onSubmit}
            />
          </LinodeThemeWrapper>
        );
      })

      it('should display radio selection for create/attach', () => {
        const modeRadioGroup = getModeRadioGroup(createWrapper);
        expect(modeRadioGroup.length).toBe(1);
      });
    });

    describe('without attachable volumes', () => {
      beforeEach(() => {
        createWrapper = mount(
          <LinodeThemeWrapper>
            <VolumeDrawer
              label={''}
              linodeId={1}
              mode={'create'}
              open={true}
              region={'us-east'}
              size={20}
              title={'what'}
              onClose={onClose}
              onSubmit={onSubmit}
            />
          </LinodeThemeWrapper>
        );
      })

      it('should not display radio selection for create/attach', () => {
        const modeRadioGroup = getModeRadioGroup(createWrapper);
        expect(modeRadioGroup.length).toBe(0);
      });
    });
  });

  describe('attach', () => {
    let attachWrapper: ReactWrapper;

    beforeAll(() => {
      attachWrapper = mount(
        <LinodeThemeWrapper>
          <VolumeDrawer
            label={''}
            linodeId={1}
            mode={'attach'}
            open={true}
            region={'us-east'}
            size={20}
            title={'what'}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        </LinodeThemeWrapper>
      );
    });

    it('should have a volume select', () => {
      const volumeSelect = attachWrapper.find('TextField[data-qa-volume-select]');
      expect(volumeSelect.length).toBe(1);
    });
  });

  describe('rename', () => {
    let renameWrapper: ReactWrapper;

    beforeEach(() => {
      renameWrapper = mount(
        <LinodeThemeWrapper>
          <VolumeDrawer
            label={''}
            linodeId={1}
            mode={'edit'}
            open={true}
            region={'us-east'}
            size={20}
            title={'what'}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        </LinodeThemeWrapper>
      );

    });

    it('should have a label field', () => {
      const labelField = getLabelField(renameWrapper);
      expect(labelField.length).toBe(1);
    });
  });

  describe('resize', () => {
    let resizeWrapper: ReactWrapper;

    beforeEach(() => {
      resizeWrapper = mount(
        <LinodeThemeWrapper>
          <VolumeDrawer
            label={''}
            linodeId={1}
            mode={'resize'}
            open={true}
            region={'us-east'}
            size={20}
            title={'what'}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        </LinodeThemeWrapper>
      );
    });

    it('should have a size field', () => {
      const sizeField = getSizeField(resizeWrapper);
      expect(sizeField.length).toBe(1);
    });
  });

  describe('clone', () => {
    let cloneWrapper: ReactWrapper;

    beforeEach(() => {
      cloneWrapper = mount(
        <LinodeThemeWrapper>
          <VolumeDrawer
            label={''}
            linodeId={1}
            mode={'clone'}
            open={true}
            region={'us-east'}
            size={20}
            title={'what'}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        </LinodeThemeWrapper>
      );
    });

    it('should have a cloneLabel field', () => {
      const cloneLabelField = cloneWrapper.find('TextField[data-qa-clone-from]');
      expect(cloneLabelField.length).toBe(1);
    });

    it('should have a disabled label field', () => {
      const labelField = getLabelField(cloneWrapper);
      expect(labelField.length).toBe(1);
      expect(labelField.prop('disabled')).toBeTruthy();
    });

    it('should have a disabled size field', () => {
      const sizeField = getSizeField(cloneWrapper);
      expect(sizeField.length).toBe(1);
      expect(sizeField.prop('disabled')).toBeTruthy();
    });

    it('should have a disabled region field', () => {
      const regionField = getRegionField(cloneWrapper);
      expect(regionField.length).toBe(1);
      expect(regionField.prop('disabled')).toBeTruthy();
    });

    it('should have a disabled linode field', () => {
      const linodeField = getLinodeField(cloneWrapper);
      expect(linodeField.length).toBe(1);
      expect(linodeField.prop('disabled')).toBeTruthy();
    });
  });
});

