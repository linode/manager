import ko from './knockout-min.js';
import Terminal from './term.js';
console.log('in the linode.js script about to do ajax');
var variable = 1;
var token;
var oauth_token = localStorage.getItem('authentication/oauth-token').replace(/['"]+/g, '');
var id = window.location.href.split('/')[4];
var xhr = new XMLHttpRequest();
xhr.open("POST", 'https://api.alpha.linode.com/v4/linode/instances/'+id+'/lish_token');
xhr.setRequestHeader('Authorization', `token ${oauth_token}`);
xhr.setRequestHeader('Accept', 'application/json');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.setRequestHeader('X-CORS-Status', 'true');
xhr.onload = function() {
  console.log(this.responseText);
  token = JSON.parse(this.responseText).lish_token;
  console.log(token);
  finishLoading();
};
xhr.send();

function finishLoading() {
  var freshtoken = null;
  if (typeof bindingsApplied === 'undefined') {
      var bindingsApplied = false;
  }

  if (typeof bindingsAppliedTerm === 'undefined') {
      var bindingsAppliedTerm = false;
  }


  var loaded = false;
  function waitForToken() {
      setTimeout(attemptLoad, 2000);
  }

  function attemptLoad() {
    //    if (loaded && freshtoken === null) {
    //        return;
    //    }
    //    if (freshtoken !== null) {
    //        token = freshtoken;
    //    }
    //    if (token == null || typeof Terminal === "undefined") {
    //        if (token == null) {
    //            window.postMessage("ready", "*");
    //            waitForToken();
    //        } else {
    //            var nocon = new NOCON();
    //            ko.cleanNode(nocon);
    //            if (bindingsApplied === false) {
    //                try {
    //                    ko.applyBindings(nocon);
    //                    bindingsApplied = true;
    //                } catch(e) {
    //                    ko.cleanNode(nocon);
    //                }
    //            }
    //        }

    //        return;
    //    }
      loaded = true;
      console.log('loaded true');
      console.log(token);
      var parts = token.split(":");
      var host = 'lish.alpha.linode.com';
      var session = token;
      var label = 'weblish';

      var weblish = new WebLish(host, session, label);
      window.weblish = weblish;
      ko.cleanNode(weblish);
      if (bindingsAppliedTerm === false) {
          try {
              ko.applyBindings(weblish);
          } catch (e) {
              ko.cleanNode(weblish);
          }
      }
      weblish.connect();
  }

  function NOCON() {
      var self = this;
      self.state = ko.observable("initial");
      self.statusMessage = ko.observable("Invalid Session. Please try again from remote access tab");
      self.state("error");
  }

  function WebLish(host, session, linode) {
      var self = this;
      var offStartTime = new Date().getTime();
      self.host = host;
      self.session = session;
      self.linode = linode;

      self.state = ko.observable("initial");
      self.statusMessage = ko.observable("Connecting...");

      var initialConnection = true;
      var _pv = null;


      self.connect = function connect() {
          var socket = new WebSocket("wss://"+host+":8181/" + session + "/weblish");
          socket.addEventListener('open', function() {
              self.weblish = new Terminal({
                  cols: 120,
                  rows: 32,
                  screenKeys: false,
                  debug: true,
                  useStyle: true
              });

              self.weblish.on('data', function(data) {
                  socket.send(data);
              });

              self.weblish.on('title', function(title) {
                  document.title = self.linode + ' / ' + (title?title:'Lish Console');
              });

              self.weblish.open(document.body);
              self.weblish.handleTitle();

              self.weblish.write('\x1b[32mLinode Lish Console\x1b[m\r\n');

              socket.addEventListener('message', function(evt) {
                  self.weblish.write(evt.data);
              });

              socket.addEventListener('close', function() {
                  self.weblish.destroy();
                  var container = document.getElementById('disconnected');
                  container.className += ' modal-open';
              });
          });
      };
  }

  window.addEventListener("beforeunload", function(event) {
      window.localStorage.setItem("weblish-session", JSON.stringify({
          token: token,
          expiry: new Date(new Date().getTime() + 60000).getTime()
      }));
  });

  setTimeout(attemptLoad, 500);
}
