import strings from '../support/cypresshelpers';
export const testLinodeNamePreffix = 'cy-test-';

export const makeLinodeLabel = () => testLinodeNamePreffix + strings.randomTitle(10);

export const apiCheckErrors =(resp, failOnError=true)=>{
  let errs = undefined;
  if (resp.body && resp.body.ERRORARRAY && resp.body.ERRORARRAY.length>0){
    errs= resp.body.ERRORARRAY;
  }
  if(failOnError){
    if(errs)
      expect(errs[0].ERRORMESSAGE).not.to.be.exist;
  }
  return errs;
}
export const makeLinodeCreateReq = (linode) =>{
    const linodeData = linode ?linode: {
        "root_pass": strings.randomPass(12),
        "label": makeLinodeLabel(),
        "type": "g6-standard-2",
        "region": "us-east",
        'image':'linode/debian10',
        tags: [],
        backups_enabled: false,
        booted: true,
        private_ip: false,
        authorized_users: []
    }

    return cy.request({
        method:'POST',
        url:Cypress.env('apiroot')+'/linode/instances',
        body:linodeData,
        auth:{
            bearer:Cypress.env("apiToken")
        }
    });
};