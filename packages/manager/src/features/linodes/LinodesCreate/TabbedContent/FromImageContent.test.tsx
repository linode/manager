import { shallow } from 'enzyme';
import * as React from 'react';
import { CombinedProps, FromImageContent } from './FromImageContent';

const mockProps: CombinedProps = {
  updateImageID: jest.fn(),
  updateRegionID: jest.fn(),
  updateTypeID: jest.fn(),
  imagesData: {},
  regionsData: [],
  typesData: [],
  accountBackupsEnabled: false,
  userCannotCreateLinode: false
};

describe('FromImageContent', () => {
  const component = shallow(<FromImageContent {...mockProps} />);

  it.skip('should render SelectImage panel', () => {
    expect(component.find('[data-qa-select-image-panel]')).toHaveLength(1);
  });

  it('should render SelectRegion panel', () => {
    expect(component.find('[data-qa-select-region-panel]')).toHaveLength(1);
  });

  it('should render SelectPlan panel', () => {
    expect(component.find('[data-qa-select-plan-panel]')).toHaveLength(1);
  });

  it('should render SelectLabelAndTags panel', () => {
    expect(component.find('[data-qa-label-and-tags-panel]')).toHaveLength(1);
  });

  it('should render AccessPanel panel', () => {
    expect(component.find('[data-qa-access-panel]')).toHaveLength(1);
  });

  it('should render SelectAddOns panel', () => {
    expect(component.find('[data-qa-addons-panel]')).toHaveLength(1);
  });
});
