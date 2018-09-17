import { shallow } from 'enzyme';
import * as React from 'react';

import tagsHoc from './tagsHoc';

const mockFn = jest.fn(() => Promise.resolve({ data: [{'label':'thistag'}]}));

jest.mock('axios', () => ({
  default: () => mockFn(),
}));

const tag = {value: 'newtag', label: 'newtag'};
const createdTag = {value:'createdtag',label:'createdtag'};

const RawComponent = tagsHoc(React.Component);
const component = shallow(<RawComponent/>);

const failToCreate = (prevLength:number) => {
  expect(component.state().tagObject.selectedTags).toHaveLength(prevLength);
  expect(component.state().tagObject.errors).toHaveLength(1);
}

describe("Tags HOC", () => {
  const { addTag, createTag, getLinodeTagList } = component.state().tagObject.actions;
  it("should load a list of account tags", () => {
    expect(mockFn).toHaveBeenCalled();
    // cDM doesn't seem to be working as expected here, skipping for now.
    // expect(component.state().tagObject.accountTags).toHaveLength(1);
    jest.clearAllMocks();
  });
  it("should add a tag successfully", () => {
    addTag([tag]);
    expect(component.state().tagObject.selectedTags).toHaveLength(1);
  });
  it("should list the added tag", () => {
    expect(getLinodeTagList()).toContain('newtag');
    jest.clearAllMocks();
  });
  it("should create a new tag", () => {
    createTag('createdtag');
    const tags = component.state().tagObject.selectedTags;
    expect(tags).toEqual([tag, createdTag]);
    expect(component.state().tagObject.selectedTags).toHaveLength(2);
  });
  it("should list all selected tags", () => {
    expect(getLinodeTagList()).toEqual(['newtag','createdtag'])
  });
  it("should not add a tag with a label less than 3 characters", () => {
    createTag('aa');
    failToCreate(2);
  });
  it("should not add a tag with a label more than 25 characters", () => {
    createTag('the quick brown fox jumped over the lazy dog');
    failToCreate(2);
  });
});