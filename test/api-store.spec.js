import sinon from 'sinon';
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import make_api_list from '../src/api-store';
import {
  make_fetch_page,
  make_update_item,
  make_update_until,
  make_delete_item
} from '../src/api-store';
import { mock_context } from './mocks';

const mock_foobars_response = {
  foobars: [
    { id: "foobar_1" },
    { id: "foobar_2" }
  ],
  total_pages: 3,
  total_results: 25 * 3 - 4,
  page: 1
};

describe("api-store/make_api_list", () => {
  it('should handle initial state', () => {
    const s = make_api_list("foobars", "foobar", {
      update_singular: "UPDATE_ONE",
      update_many: "UPDATE_MANY",
      delete_one: "DELETE_ONE",
    });

    expect(
      s(undefined, {})
    ).to.be.eql({
      pagesFetched: [ ], totalPages: -1, foobars: {},
      _singular: "foobar", _plural: "foobars"
    });
  });

  it('should not handle actions not specified', () => {
    const s = make_api_list("foobars", "foobar", {
        update_singular: "UPDATE_ONE"
    });
    const state = s(undefined, {});
    deepFreeze(state);

    expect(
      s(state, { type: "DELETE_ONE" })
    ).to.be.eql(state);
  });

  it('should handle updating many records', () => {
    const s = make_api_list("foobars", "foobar", {
      update_many: "UPDATE_MANY"
    });

    const state = s(undefined, {});
    deepFreeze(state);

    const result = s(state, {
      type: "UPDATE_MANY",
      response: mock_foobars_response
    });

    const foobars = expect(result)
      .to.have.property('foobars')
      .which.has.keys('foobar_1', 'foobar_2');
  });

  it('should add internal properties to objects', () => {
    const s = make_api_list("foobars", "foobar", {
      update_many: "UPDATE_MANY"
    });

    const state = s(undefined, {});
    deepFreeze(state);

    const result = s(state, {
      type: "UPDATE_MANY",
      response: {
        foobars: [
          { id: "foobar_1" },
          { id: "foobar_2" }
        ],
        total_pages: 3,
        total_results: 25 * 3 - 4,
        page: 1
      }
    });

    const foobars = expect(result)
      .to.have.property('foobars')
      .which.has.property('foobar_1')
      .which.has.property('_polling');
  });

  it('should invoke custom transforms', () => {
    const s = make_api_list("foobars", "foobar", {
      update_many: "UPDATE_MANY"
    }, o => ({ ...o, test: 1234 }));

    const state = s(undefined, {});
    deepFreeze(state);

    const result = s(state, {
      type: "UPDATE_MANY",
      response: {
        foobars: [
          { id: "foobar_1" },
          { id: "foobar_2" }
        ],
        total_pages: 3,
        total_results: 25 * 3 - 4,
        page: 1
      }
    });
       
    const foobars = expect(result)
      .to.have.property('foobars')
      .which.has.property('foobar_1')
      .which.has.property('test')
      .which.equals(1234);
  });

  it('should handle adding a single resource', () => {
    const s = make_api_list("foobars", "foobar", {
      update_singular: "FUCK_WILL_SMITH (the actor)"
    });

    const state = s(undefined, {});
    deepFreeze(state);

    const result = s(state, {
      type: "FUCK_WILL_SMITH (the actor)",
      foobar: { id: "foobar_1" }
    });
    
    expect(result)
      .to.have.property('foobars')
      .which.has.keys('foobar_1');
  });

  it('should handle updating a single resource', () => {
    const s = make_api_list("foobars", "foobar", {
      update_singular: "FUCK_DODSON (the jurrasic park guy)"
    });

    let state = s(undefined, {});
    state = {
      ...state,
      foobars: {
        ...state.foobars,
        foobar_1: { id: "foobar_1" }
      }
    };
    deepFreeze(state);

    const result = s(state, {
      type: "FUCK_DODSON (the jurrasic park guy)",
      foobar: { id: "foobar_1", name: "hello" }
    });
    
    expect(result)
      .to.have.property('foobars')
      .which.has.property('foobar_1')
      .which.has.property('name')
      .which.equals('hello');
  });

  it('should handle deleting a single resource', () => {
    const s = make_api_list("foobars", "foobar", {
      delete_one: "FUCK_MARQUES (the R&B artist)"
    });

    let state = s(undefined, {});
    state = {
      ...state,
      foobars: {
        ...state.foobars,
        foobar_1: { id: "foobar_1" }
      }
    };
    deepFreeze(state);

    const result = s(state, {
      type: "FUCK_MARQUES (the R&B artist)",
      id: "foobar_1"
    });
    
    expect(result)
      .to.have.property('foobars')
      .which/*.does*/.not.have.property('foobar_1');
  });

});

describe("api-store/make_fetch_page", sinon.test(() => {
  it('returns a function that itself returns a function', () => {
    const f = make_fetch_page("FETCH_FOOBARS", "foobars");
    expect(f).to.be.a("function");
    expect(f()).to.be.a("function");
  });

  it('fetches a page of items from the API', async () => {
    await mock_context(async ({
        auth, dispatch, getState, fetchStub
      }) => {
      const f = make_fetch_page("FETCH_FOOBARS", "foobars");
      const p = f();

      await p(dispatch, getState);

      sinon.assert.calledWith(fetchStub,
        auth.token, '/foobars?page=1');
      sinon.assert.calledWith(dispatch, {
        type: "FETCH_FOOBARS",
        response: mock_foobars_response
      });
    }, mock_foobars_response);
  });

  it('fetches the requested page', async () => {
    await mock_context(async ({
        auth, dispatch, getState, fetchStub
      }) => {
      const f = make_fetch_page("FETCH_FOOBARS", "foobars");
      const p = f(1);

      await p(dispatch, getState);

      sinon.assert.calledWith(fetchStub,
        auth.token, '/foobars?page=2');
    }, mock_foobars_response);
  });
}));

describe("api-store/make_update_item", sinon.test(() => {
  it('returns a function that itself returns a function', () => {
    const f = make_update_item("UPDATE_FOOBAR", "foobars", "foobar");
    expect(f).to.be.a("function");
    expect(f()).to.be.a("function");
  });

  it('fetches an item from the API', async () => {
    await mock_context(async ({
        auth, dispatch, getState, fetchStub
      }) => {
      const f = make_update_item("UPDATE_FOOBAR", "foobars", "foobar");
      const p = f("foobar_1");

      await p(dispatch, getState);

      sinon.assert.calledWith(fetchStub,
        auth.token, '/foobars/foobar_1');
      sinon.assert.calledWith(dispatch, {
        type: "UPDATE_FOOBAR",
        foobar: mock_foobars_response.foobars[0]
      });
    }, mock_foobars_response.foobars[0]);
  });
}));

describe("api-store/make_delete_item", sinon.test(() => {
  it('returns a function that itself returns a function', () => {
    const f = make_delete_item("DELETE_FOOBAR", "foobars");
    expect(f).to.be.a("function");
    expect(f()).to.be.a("function");
  });

  it('performs the API request', async () => {
    await mock_context(async ({
        auth, dispatch, getState, fetchStub
      }) => {
      const f = make_delete_item("DELETE_FOOBAR", "foobars");
      const p = f("foobar_1");

      await p(dispatch, getState);

      sinon.assert.calledWith(fetchStub,
        auth.token, '/foobars/foobar_1', { method: "DELETE" });
      sinon.assert.calledWith(dispatch, {
        type: "DELETE_FOOBAR",
        id: "foobar_1"
      });
    }, { });
  });
}));
