// import * as React from 'react';
// import { renderWithTheme } from 'src/utilities/testHelpers';
import { imageFactory } from 'src/factories/images';
import { userDefinedFieldFactory } from 'src/factories/stackscripts';

import {
  FromAppsContent,
  getCompatibleImages,
  getDefaultUDFData,
} from './FromAppsContent';

describe('FromAppsContent', () => {
  it('should exist', () => {
    expect(FromAppsContent).toBeDefined();
  });
});

describe('getCompatibleImages', () => {
  it('should exist', () => {
    expect(getCompatibleImages).toBeDefined();
  });

  it('should return an empty Array if an empty object or an empty array are passed', () => {
    const bothEmptyResult = getCompatibleImages({}, []);
    const emptyImagesDataResult = getCompatibleImages({}, ['Debian']);
    const emptyStackScriptImagesResult = getCompatibleImages(
      { Test: imageFactory.build() },
      []
    );
    expect(bothEmptyResult).toEqual([]);
    expect(emptyImagesDataResult).toEqual([]);
    expect(emptyStackScriptImagesResult).toEqual([]);
  });

  it('should an array of Images compatible with the StackScript', () => {
    const imagesDataArray = imageFactory.buildList(5);
    const imagesData = imagesDataArray.reduce((acc, imageData) => {
      acc[imageData.label] = imageData;
      return acc;
    }, {});
    const stackScriptImages = Object.keys(imagesData).slice(0, 2);
    const result = getCompatibleImages(imagesData, stackScriptImages);
    expect(result.length).toBe(2);
    result.forEach((image) => {
      expect(stackScriptImages.includes(image.label));
    });
  });
});

describe('getDefaultUDFData', () => {
  it('should exist', () => {
    expect(getDefaultUDFData).toBeDefined();
  });

  it('should return an empty object when given an empty array', () => {
    const result = getDefaultUDFData([]);
    expect(result).toEqual({});
  });

  it('should return an object with keys that are made up of the subset of user defined fields passed that have the default property set to a string', () => {
    // Need to get a better docsctring for this
    const userDefinedFieldWithDefaultValue = userDefinedFieldFactory.build({
      default: 'foobar',
    });
    const udfs = [
      ...userDefinedFieldFactory.buildList(5),
      userDefinedFieldWithDefaultValue,
    ];
    const result = getDefaultUDFData(udfs);
    expect(result[userDefinedFieldWithDefaultValue.name]).toEqual(
      userDefinedFieldWithDefaultValue.default
    );
  });
});
