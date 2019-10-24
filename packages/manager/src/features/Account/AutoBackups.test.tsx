import { cleanup } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';

import * as jaxe from 'jest-axe';


import AutoBackups from './AutoBackups';


jest.setTimeout(10000);

afterEach(cleanup);

expect.extend(jaxe.toHaveNoViolations);

describe("AutoBackups simple sanity check", ()=>{
  it('not managed not auto backups with linodes nobackups', async () => {
    const openDrawer = jest.fn();
   const props = {
      isManagedCustomer:false,
      backups_enabled:false,
      onChange:jest.fn(),
      openBackupsDrawer:openDrawer,
      hasLinodesWithoutBackups:true
  }
  const {/*debug, */container } = renderWithTheme(<AutoBackups {...props}/>);

    const res =  await jaxe.axe(container);
    // debug()
    expect(res).toHaveNoViolations();
    // props.openBackupsDrawer();
    // cleanup()
    // const res2 =  await jaxe.axe(container);
    // expect(res2).toHaveNoViolations();
    

  })


  it('should FAIL but does not', async () => {
    const render = () => '<a href="">test</a>'

    // pass anything that outputs html to axe
    const html = render()

    // const options: jaxe.AxeOptions = {
    //   runOnly: {
    //     type: 'tags',
    //     values: ['best-practice','experimental'],
    //   },
    // };

    expect(await jaxe.axe(html)).toHaveNoViolations()
    
  })
  it('should PASS', async () => {
    const render = () => '<img src="#" alt="test"/>'

    // pass anything that outputs html to axe
    const html = render()

    expect(await jaxe.axe(html)).toHaveNoViolations()
    
  })
  it('should FAIL', async () => {
    const render = () => '<img src="#"/>'

    // pass anything that outputs html to axe
    const html = render()

    expect(await jaxe.axe(html)).toHaveNoViolations()
    
  })
})