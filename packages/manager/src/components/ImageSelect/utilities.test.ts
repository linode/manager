import { Settings } from 'luxon';

import { imageFactory } from 'src/factories';

import { isImageDeprecated, isImageTooFarPastEOL } from './utilities';

describe('isImageTooFarPastEOL', () => {
  it('should return false if the image does not have an `eol`', () => {
    const image = imageFactory.build({ eol: null });

    expect(isImageTooFarPastEOL(image)).toBe(false);
  });

  it("should return true if it is more than 6 months past the Image's `eol`", () => {
    // Mock the current date
    Settings.now = () => new Date(2018, 1, 1).valueOf();

    expect(
      isImageTooFarPastEOL(imageFactory.build({ eol: '2015-01-01T00:00:00' }))
    ).toBe(true);

    expect(
      isImageTooFarPastEOL(imageFactory.build({ eol: '2017-07-01T00:00:00' }))
    ).toBe(true);
  });

  it("should return false if it is not 6 months past the image's `eol`", () => {
    // Mock the current date
    Settings.now = () => new Date(2018, 1, 1).valueOf();

    expect(
      isImageTooFarPastEOL(imageFactory.build({ eol: '2018-04-01T00:00:00' }))
    ).toBe(false);

    expect(
      isImageTooFarPastEOL(imageFactory.build({ eol: '2018-08-01T00:00:00' }))
    ).toBe(false);

    expect(
      isImageTooFarPastEOL(imageFactory.build({ eol: '2032-01-01T00:00:00' }))
    ).toBe(false);
  });
});

describe('isImageDeprecated', () => {
  it('should return true image is `deprecated` according to the API', () => {
    const image = imageFactory.build({ deprecated: true, eol: null });

    expect(isImageDeprecated(image)).toBe(true);
  });

  it('should return false image is not `deprecated` and the image does not have an `eol`', () => {
    const image = imageFactory.build({ deprecated: false, eol: null });

    expect(isImageDeprecated(image)).toBe(false);
  });

  it("should return true if the current date is after the image's `eol` (the image is past its EOL)", () => {
    // Mock the current date
    Settings.now = () => new Date(2018, 5, 1).valueOf();

    const image = imageFactory.build({
      deprecated: false,
      eol: '2018-01-01T00:00:00',
    });

    expect(isImageDeprecated(image)).toBe(true);
  });

  it("should return false if the current date is before the image's `eol` (the image is not past its EOL)", () => {
    // Mock the current date
    Settings.now = () => new Date(2018, 1, 1).valueOf();

    // Image with an end-of-life that is in the future compared to the mocked current date
    const image = imageFactory.build({
      deprecated: false,
      eol: '2019-05-02T00:00:00',
    });

    expect(isImageDeprecated(image)).toBe(false);
  });
});
