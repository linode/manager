import { cleanup, render} from '@testing-library/react';
import * as jaxe from "jest-axe";
import * as React from 'react';
import { renderWithTheme , toPassAxeCheck} from 'src/utilities/testHelpers';
import AutoBackups from './AutoBackups';

jest.setTimeout(10000);

afterEach(cleanup);

expect.extend(toPassAxeCheck);
expect.extend(jaxe.toHaveNoViolations);

// expect.extend(jaxe.toHaveNoViolations);
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
    const res = renderWithTheme(<AutoBackups {...props}/>);
    expect(res).toPassAxeCheck();
    expect(await jaxe.axe(res.container)).toHaveNoViolations();
  })

  // it('should FAIL but does not', async () => {
  //   // pass anything that outputs html to axe
  //   const html = render(<a href="#">test</a>)
  //   expect(await jaxe.axe(html.container)).toHaveNoViolations()
  //   expect(html).toPassAxeCheck()
    
  // })
  // it('should FAIL but does not', async () => {
  //   const html = render(<a href="">test</a>)
  //   expect(await jaxe.axe(html.container)).toHaveNoViolations()
  //   expect(html).toPassAxeCheck()
  // })
  // it('should PASS', async () => {
  //   const html = render(<img src="#" alt="test"/>)
  //   expect(await jaxe.axe(html.container)).toHaveNoViolations()
  //   expect(html).toPassAxeCheck()
    
  // })
  // it('should FAIL', async () => {
  //   const html = render(<img src="#" />)
  //   expect(await jaxe.axe(html.container)).toHaveNoViolations()
  //   expect(html).toPassAxeCheck()    
  // })
});