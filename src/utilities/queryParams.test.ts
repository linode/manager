import { getParamsFromUrl, getQueryParam } from './queryParams';

describe("getParamsFromUrl function", () => {
  it("should parse a url", () => {
    console.log(getParamsFromUrl('https://example.com/?query=false'))
  })
})