import { describe, expect, it } from 'vitest';
import { getAPIFilterFromQuery } from './search';

describe("getAPIFilterFromQuery", () => {
  it("handles +contains", () => {
    const query = "label: my-linode";

    expect(getAPIFilterFromQuery(query, { searchableFieldsWithoutOperator: [] })).toEqual({
      filter: {
        label: { "+contains": "my-linode" },
      },
      error: null,
    });
  });

  it("handles +eq with strings", () => {
    const query = "label = my-linode";

    expect(getAPIFilterFromQuery(query, { searchableFieldsWithoutOperator: [] })).toEqual({
      filter: {
        label: "my-linode",
      },
      error: null,
    });
  });

  it("handles +eq with numbers", () => {
    const query = "id = 100";

    expect(getAPIFilterFromQuery(query, { searchableFieldsWithoutOperator: [] })).toEqual({
      filter: {
        id: 100,
      },
      error: null,
    });
  });

  it("handles +lt", () => {
    const query = "size < 20";

    expect(getAPIFilterFromQuery(query, { searchableFieldsWithoutOperator: [] })).toEqual({
      filter: {
        size: { '+lt': 20 }
      },
      error: null,
    });
  });

  it("handles +gt", () => {
    const query = "size > 20";

    expect(getAPIFilterFromQuery(query, { searchableFieldsWithoutOperator: [] })).toEqual({
      filter: {
        size: { '+gt': 20 }
      },
      error: null,
    });
  });

  it("handles +gte", () => {
    const query = "size >= 20";

    expect(getAPIFilterFromQuery(query, { searchableFieldsWithoutOperator: [] })).toEqual({
      filter: {
        size: { '+gte': 20 }
      },
      error: null,
    });
  });

  it("handles +lte", () => {
    const query = "size <= 20";

    expect(getAPIFilterFromQuery(query, { searchableFieldsWithoutOperator: [] })).toEqual({
      filter: {
        size: { '+lte': 20 }
      },
      error: null,
    });
  });

  it("handles an 'and' search", () => {
    const query = "label: my-linode-1 and tags: production";

    expect(getAPIFilterFromQuery(query, { searchableFieldsWithoutOperator: [] })).toEqual({
      filter: {
        ["+and"]: [
          { label: { "+contains": "my-linode-1" } },
          { tags: { '+contains': "production" } },
        ],
      },
      error: null,
    });
  });

  it("handles an 'or' search", () => {
    const query = "label: prod or size >= 20";

    expect(getAPIFilterFromQuery(query, { searchableFieldsWithoutOperator: [] })).toEqual({
      filter: {
        ["+or"]: [
          { label: { "+contains": "prod" } },
          { size: { '+gte': 20 } },
        ],
      },
      error: null,
    });
  });

  it("handles nested queries", () => {
    const query = "(label: prod and size >= 20) or (label: staging and size < 50)";

    expect(getAPIFilterFromQuery(query, { searchableFieldsWithoutOperator: [] })).toEqual({
      filter: {
        ["+or"]: [
          { ["+and"]: [{ label: { '+contains': 'prod' } }, { size: { '+gte': 20 } }] },
          { ["+and"]: [{ label: { '+contains': 'staging' } }, { size: { '+lt': 50 } }] },
        ],
      },
      error: null,
    });
  });

  it("returns a default query based on the 'defaultSearchKeys' provided", () => {
    const query = "my-linode-1";

    expect(getAPIFilterFromQuery(query, { searchableFieldsWithoutOperator: ['label', 'tags'] })).toEqual({
      filter: {
        ["+or"]: [
          { label: { "+contains": "my-linode-1" } },
          { tags: { '+contains': "my-linode-1" } },
        ],
      },
      error: null,
    });
  });

  it("returns an error for an incomplete search query", () => {
    const query = "label: ";

    expect(
      getAPIFilterFromQuery(query, { searchableFieldsWithoutOperator: [] }).error?.message
    ).toEqual("Expected search value or whitespace but end of input found.");
  });
});