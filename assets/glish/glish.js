window.onload = function() {
  window.INCLUDE_URI = '/assets/glish/novnc/';
  Util.load_scripts([
      "webutil.js", "base64.js", "websock.js", "des.js",
      "keysymdef.js", "keyboard.js", "input.js", "display.js",
      "inflator.js", "rfb.js", "keysym.js"
  ]);
  var apiKey = window.localStorage.getItem('authentication/oauth-token').replace(/"/g, '');
  var linodeLabel = window.location.href.split('/')[4];
  var linode, datacenter, linodeId, token;

  var xhr = new XMLHttpRequest();
  xhr.open("GET", 'https://api.alpha.linode.com/v4/linode/instances');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'token ' + apiKey);
  xhr.setRequestHeader('X-Filter', '{ "label": "'+ linodeLabel +'" }');
  xhr.onload = function() {
    linode = JSON.parse(xhr.responseText);
    linodeId = linode.linodes[0].id;
    datacenter = linode.linodes[0].datacenter.id;
    console.log('linode', linode);
    console.log('linodeId', linodeId);
    console.log('datacenter', datacenter);
    var xhr2 = new XMLHttpRequest();
    xhr2.open("POST", 'https://api.alpha.linode.com/v4/linode/instances/'+linodeId+'/lish_token');
    xhr2.setRequestHeader('Content-Type', 'application/json');
    xhr2.setRequestHeader('Authorization', 'token ' + apiKey);
    xhr2.onload = function() {
      console.log('xhr2.responseText', xhr2.responseText);
      token = JSON.parse(xhr2.responseText).lish_token;
      console.log('token', token);
      finishLoading();
    };
    xhr2.send();

  };
  xhr.send();
  function finishLoading() {
    console.log('got here');
    if (typeof bindingsApplied === 'undefined') {
        var bindingsApplied = false;
    }
    if (typeof bindingsAppliedVNC === 'undefined') {
        var bindingsAppliedVNC = false;
    }
    // TODO: For beta
    // host = datacenter + 'webconsole.linode.com';
    host = 'lish.alpha.linode.com';
    session = token;
    label = linodeLabel;

    var vnc = new VNC(host, session, label);
    window.vnc = vnc;
    ko.cleanNode(vnc);
    if (bindingsAppliedVNC === false) {
        try {
            ko.applyBindings(vnc);
            bindingsAppliedVNC = true;
        } catch (e) {
            ko.cleanNode(vnc);
            setTimeout(function() { location.reload(); }, 100);
        }
    }
    vnc.connect();

    function NOCON() {
        var self = this;
        self.state = ko.observable("initial");
        self.statusMessage = ko.observable("Invalid Session. Please try again from remote access tab");
        self.state("error");
        self.powerOff = null;
        self.powered = ko.observable(false);
        self.reboot = null;
        self.ctrlAltDelete = null;
    }

    function VNC(host, session, linode) {
        var self = this;
        var offStartTime = new Date().getTime();
        self.host = host;
        self.session = session;
        self.linode = linode;
        self.canvas = document.getElementById("canvas");
        self.state = ko.observable("initial");
        self.statusMessage = ko.observable("Connecting...");
        self.powered = ko.observable(false);
        self.rfb = new RFB({'target': canvas,
           'encrypt': true, 'repeaterID': '',
           'true_color': true, 'local_cursor': true,
           'shared': true, 'view_only': false,
           'onUpdateState': updateState,
           'onFBUComplete': FBUComplete
        });
        self.monitor = new WebSocket("wss://lish.alpha.linode.com:8080/" + session + "/monitor");
        // TODO: For beta
        // self.monitor = new WebSocket("wss://"+datacenter+".webconsole.linode.com:8080/" + session + "/monitor");
        self.monitor.addEventListener("message", function(e) {
            console.log("Monitor says " + e.data);
            var json = JSON.parse(e.data);
            switch (json.type) {
                case "status":
                    self.powered(json.poweredStatus == "Running");
                    if (self.powered()) {
                        vnc.connect();
                    } else {
                        self.state("off");
                        self.statusMessage("Your Linode is powered off.");
                    }
                    break;
                case "error":
                    self.powered(false);
                    self.state("error");
                    self.statusMessage(json.reason);
                    break;
            }
        });

        function renew() {
            if (self.monitor.readyState === 1) {
                self.monitor.send(JSON.stringify({ action: "renew" }));
            }
        }
        setInterval(renew, 1000 * 60);

        function FBUComplete() {
            // TODO: UI resize
        }

        var initialConnection = true;
        var _pv = null;

        function updateState(rfb, newstate, oldstate, message) {
            console.log("State became " + newstate);
            var valid = ["failed", "fatal", "normal", "disconnected", "loaded"];
            if (valid.indexOf(newstate) !== -1) {
                self.state(newstate);
            } else {
                self.state("warn");
            }
            if (self.state() === "disconnected") {
                self.statusMessage("Disconnected");
            } else {
                if (typeof(message) !== "undefined") {
                    self.statusMessage(message);
                }
            }
            switch (newstate) {
                case 'disconnected':
                case 'failed':
                case 'fatal':
                    clearTimeout(_pv);
                    if (initialConnection) {
                        self.statusMessage("Your linode is powered off.");
                        self.state("off");
                        self.powered(false);
                    }
                    window.location.reload();
                    setTimeout(function() {
                        if (new Date().getTime() - offStartTime < 300000) {
                            // stop trying after 5 min
                            self.connect();
                        }
                    }, 3000);
                    break;
                case 'ProtocolVersion': // Workaround for weirdness
                    clearTimeout(_pv);
                    _pv = setTimeout(function() {
                        self.connect();
                    }, 3000);
                    break;
                case 'normal':
                    clearTimeout(_pv);
                    self.powered(true);
                    if (!initialConnection) {
                        console.log("restarting. token is " + token);
                        window.localStorage.setItem("glish-session", JSON.stringify({
                            token: token,
                            expiry: new Date(new Date().getTime() + 60000).getTime()
                        }));
                        window.location.reload();
                    }
                    initialConnection = false;
                    document.querySelector("canvas").classList.add('active');
                    break;
            }
        }

        self.connect = function connect() {
            if (!self.powered()) {
                return;
            }
            document.querySelector("canvas").classList.remove('active');
            self.rfb.connect(self.host, 8080, '', self.session);
        }

        self.ctrlAltDelete = function ctrlAltDel() {
            self.rfb.sendCtrlAltDel();
        }

        self.reboot = function reboot() {
            var proceed = confirm("Reboot this linode?");
            if (proceed) {
                self.monitor.send(JSON.stringify({ action: "exec", command: "reboot" }));
            }
        }

        self.powerOff = function powerOff() {
            if (self.powered()) {
                var proceed = confirm("Power off this linode?");
                if (proceed) {
                    self.monitor.send(JSON.stringify({ action: "exec", command: "shutdown" }));
                    initialConnection = true;
                }
            } else {
                var proceed = confirm("Power on this linode?");
                if (proceed) {
                    self.monitor.send(JSON.stringify({ action: "exec", command: "boot" }));
                    initialConnection = false;
                    self.connect();
                    setTimeout(window.location.reload(), 4000);
                }
            }
        }
    }

    window.addEventListener("beforeunload", function(event) {
        window.localStorage.setItem("glish-session", JSON.stringify({
            token: token,
            expiry: new Date(new Date().getTime() + 60000).getTime()
        }));
    });
  }
};
