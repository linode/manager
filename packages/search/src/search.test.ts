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

  it("handles +neq", () => {
      const query = "status != active";

      expect(getAPIFilterFromQuery(query, { searchableFieldsWithoutOperator: [] })).toEqual({
        filter: {
          status: { '+neq': "active" },
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

  it("allows a quoted string so you can use spaces in the query (double quotes)", () => {
    const query = 'label: "my stackscript"';

    expect(getAPIFilterFromQuery(query, { searchableFieldsWithoutOperator: [] })).toEqual({
      filter: {
        label: { '+contains': "my stackscript" }
      },
      error: null,
    });
  });

  it("allows '@' symbol in search", () => {
    const query = 'email: thisisafakeemail@linode.com';

    expect(getAPIFilterFromQuery(query, { searchableFieldsWithoutOperator: [] })).toEqual({
      filter: {
        email: { '+contains': "thisisafakeemail@linode.com" }
      },
      error: null,
    });
  });

  it("allows '-' symbol in search", () => {
    const query = 'username: test-user-1';

    expect(getAPIFilterFromQuery(query, { searchableFieldsWithoutOperator: [] })).toEqual({
      filter: {
        username: { '+contains': "test-user-1" }
      },
      error: null,
    });
  });

  it("allows '_' symbol in search", () => {
    const query = 'username: test_user_1';

    expect(getAPIFilterFromQuery(query, { searchableFieldsWithoutOperator: [] })).toEqual({
      filter: {
        username: { '+contains': "test_user_1" }
      },
      error: null,
    });
  });

  it("allows a quoted string so you can use spaces in the query (single quotes)", () => {
    const query = "label: 'my stackscript' and username = linode";

    expect(getAPIFilterFromQuery(query, { searchableFieldsWithoutOperator: [] })).toEqual({
      filter: {
        ["+and"]: [
          { label: { "+contains": "my stackscript" } },
          { username: "linode" },
        ],
      },
      error: null,
    });
  });

  it("allows custom filter transformations on a per-field basis", () => {
    const query = "region: us-east";

    expect(
      getAPIFilterFromQuery(query, {
        searchableFieldsWithoutOperator: [],
        filterShapeOverrides: {
          '+contains': { field: 'region', filter: (value) => ({ regions: { region: value } }) }
        }
      })
    ).toEqual({
      filter: { regions: { region: 'us-east' } },
      error: null,
    });
  });
});
