import { expect } from 'chai';
import sinon from 'sinon';
import * as actions from '~/linodes/actions/create';

describe("linodes/actions/create", () => {
  describe("changeSourceTab", () => {
    it("should return a CHANGE_SOURCE_TAB action", () => {
      expect(actions.changeSourceTab(1))
        .to.deep.equal({
          type: actions.CHANGE_SOURCE_TAB,
          tab: 1
        });
    });
  });

  describe("selectSource", () => {
    it("should return a SELECT_SOURCE action", () => {
      expect(actions.selectSource("distribution_1234"))
        .to.deep.equal({
          type: actions.SELECT_SOURCE,
          source: "distribution_1234"
        });
    });
  });

  describe("selectDatacenter", () => {
    it("should return a SELECT_DATACENTER action", () => {
      expect(actions.selectDatacenter("datacenter_1234"))
        .to.deep.equal({
          type: actions.SELECT_DATACENTER,
          datacenter: "datacenter_1234"
        });
    });
  });

  describe("selectService", () => {
    it("should return a SELECT_SERVICE action", () => {
      expect(actions.selectService("service_1234"))
        .to.deep.equal({
          type: actions.SELECT_SERVICE,
          service: "service_1234"
        });
    });
  });

  describe("toggleAllPlans", () => {
    it("should return a TOGGLE_ALL_PLANS action", () => {
      expect(actions.toggleAllPlans())
        .to.deep.equal({ type: actions.TOGGLE_ALL_PLANS });
    });
  });

  describe("setLabel", () => {
    it("should return a SET_LABEL action", () => {
      expect(actions.setLabel("hello-world"))
        .to.deep.equal({
          type: actions.SET_LABEL,
          label: "hello-world"
        });
    });
  });

  describe("generatePassword", () => {
    it("should return a GENERATE_PASSWORD action", () => {
      expect(actions.generatePassword())
        .to.deep.equal({ type: actions.GENERATE_PASSWORD });
    });
  });

  describe("toggleShowPassword", () => {
    it("should return a TOGGLE_SHOW_PASSWORD action", () => {
      expect(actions.toggleShowPassword())
        .to.deep.equal({ type: actions.TOGGLE_SHOW_PASSWORD });
    });
  });

  describe("createLinode", () => {
    it("should return a function", () => {
      expect(actions.createLinode()).to.be.a("function");
    });

    it("should call getState() once", () => {
      /* TODO */
    });

    it("should dispatch a TOGGLE_CREATING action twice", () => {
      /* TODO */
    });

    it("should perform an HTTP POST to /linodes", () => {
      /* TODO */
    });

    it("should perform an HTTP POST to /linodes", () => {
      /* TODO */
    });

    it("should dispatch an UPDATE_LINODE action with the new linode", () => {
      /* TODO */
    });

    it("should dispatch a routing action to navigate to the detail page", () => {
      /* TODO */
    });

    it("should dispatch a CLEAR_CREATE_FORM action", () => {
      /* TODO */
    });

    it("should update the linode until it finishes provisioning", () => {
      /* TODO */
    });
  });
});
