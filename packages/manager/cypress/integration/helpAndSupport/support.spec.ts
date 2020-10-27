import { defensiveDo } from '../../support/ui/common';

describe('Test', () => {
  it('check  Defensive do retries 3 times and calls wait', () => {
    const fun = cy.stub();
    const throwingFun = () => {
      fun();
      throw 'error';
    };
    const wait = cy.spy(cy, 'wait');
    try {
      defensiveDo(throwingFun, 3, 100, 20);
    } catch (err) {}
    expect(fun).to.be.calledThrice;
    expect(wait.withArgs(100)).to.be.called;
    expect(wait.withArgs(20)).to.be.calledTwice;
  });
});
