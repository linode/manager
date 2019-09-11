import { getSelectedOptionFromGroupedOptions } from './getSelectedOptionFromGroupedOptions';

const option1 = {
  label: 'Option 1',
  value: 'Option 1'
};

const option2 = {
  label: 'Option 2',
  value: 'Option 2'
};

const option3 = {
  label: 'Volumes Option 1',
  value: 'Volumes Option 1'
};

const option4 = {
  label: 'Volumes Option 2',
  value: 'Volumes Option 2'
};

const fakeDeviceList = [
  {
    label: 'Disks',
    value: 'disks',
    options: [option1, option2]
  },
  {
    label: 'Volumes',
    value: 'volumes',
    options: [option3, option4]
  }
];

describe('DeviceSelection', () => {
  describe('getSelectedOptionFromGroupedOptions helper method', () => {
    it('should retrieve an Item from a set of grouped options', () => {
      expect(
        getSelectedOptionFromGroupedOptions(option3.value, fakeDeviceList)
      ).toBe(option3);
      expect(
        getSelectedOptionFromGroupedOptions(option2.value, fakeDeviceList)
      ).toBe(option2);
    });

    it("should return null if the option isn't found", () => {
      expect(
        getSelectedOptionFromGroupedOptions('not a real value', fakeDeviceList)
      ).toBeNull();
    });
  });
});
