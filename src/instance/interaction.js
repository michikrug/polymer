(function(scope) {

  var interaction = {

    addToolbar: function() {
      var _this = this;
      var tbId = '#toolbar_' + _this._pubsub_id;

      var qS = function(selector) {
        return _this.shadowRoot.querySelector(selector);
      };

      window.loadScript = function(src, callback) {
        var s = document.querySelector('script[src="' + src + '"]');
        if (s) {
          callback && (s.loaded && callback.call()) || s.addEventListener('load', callback);
          return;
        }
        s = document.createElement('script');
        s.async = 1;
        s.defer = 1;
        s.src = src;
        s.addEventListener('load', function() { this.loaded = true; callback && callback.call(); });
        document.body.appendChild(s);
      };

      HTMLElement.prototype.on = HTMLElement.prototype.on || function(evt, fnc) {
        evt.split(' ').forEach(function(e) { this.addEventListener(e, fnc.bind(this)); }, this);
        return this;
      };

      if (this.shadowRoot.children.length === 0) return;

      if (qS(tbId)) return;

      var toolbarDiv = document.createElement('div');
      toolbarDiv.setAttribute('id', tbId.substr(1));
      toolbarDiv.className = 'toolbar';
      toolbarDiv.innerHTML = '<div class="buttons left"><div class="listen button">L</div><div class="publish button">P</div></div><div class="buttons right"><div class="clients button"><span>v</span><ul class="dropdown"></ul></div><div class="maximize button">F</div><div class="close button">X</div></div>';
      this.shadowRoot.appendChild(toolbarDiv);

      var style = document.createElement('style');
      style.appendChild(document.createTextNode(''));
      _this.shadowRoot.appendChild(style);
      if (navigator.userAgent.toLowerCase().indexOf('firefox') === -1) {
        style.sheet.insertRule(":host { position: relative; }", 0);
        addStyle();
      } else {
        setTimeout(addStyle, 200);
      }

      function addStyle() {
      style.sheet.insertRule(tbId + " { \
  font-family: sans-serif; \
  top: 0; \
  display: none; \
  height: 25px; \
  width: 100%; \
  text-align: center; \
  background: rgba(250,250,250,.7); \
  font-size: 12px; \
  position: absolute; \
}", 0);
      style.sheet.insertRule(tbId + ".draggable { cursor: move; }", 0);
      style.sheet.insertRule(tbId + " .buttons { \
  position: absolute; \
  top: 3px; \
}", 0);
      style.sheet.insertRule(tbId + " .buttons.right { right: 0; }", 0);
      style.sheet.insertRule(tbId + " .buttons.left { left: 4px; }", 0);
      style.sheet.insertRule(tbId + " .button { \
  width: 18px; \
  height: 18px; \
  border: 1px solid #ddd; \
  background: rgb(245,245,245); \
  line-height: 16px; \
  text-align: center; \
  display: inline-block; \
  cursor: pointer; \
  margin-right: 4px; \
  font-size: 10px; \
}", 0);
      style.sheet.insertRule(tbId + " .button.disabled { color: #aaa; }", 0);
      style.sheet.insertRule(tbId + " .button:hover { border: 1px inset #fff; }", 0);
      style.sheet.insertRule(tbId + " .button:hover > .dropdown { display: block; }", 0);
      style.sheet.insertRule(tbId + " .button > .dropdown { \
  display: none; \
  position: absolute; \
  width: auto; \
  height: auto; \
  top: 5px; \
  left: -150px; \
  padding: 8px 0 0 0; \
  text-align: left; \
}", 0);
      style.sheet.insertRule(tbId + " .button > .dropdown > li { \
  width: auto; \
  min-width: 160px; \
  line-height: 22px; \
  background: rgb(245,245,245); \
  list-style: none; \
  border: 1px solid #ddd; \
  padding: 0 5px; \
  border-bottom: 0; \
}", 0);
      style.sheet.insertRule(tbId + " .button > .dropdown > li.current { color: #999; }", 0);
      style.sheet.insertRule(tbId + " .button > .dropdown > li:last-child { border-bottom: 1px solid #ddd; }", 0);
      style.sheet.insertRule(tbId + " .button > .dropdown > li:hover { background: rgb(220,220,220); }", 0);
      style.sheet.insertRule(tbId + " .button > .dropdown > li.current:hover { background: rgb(245,245,245); }", 0);
      }

      var maximizeButton = qS(tbId + ' .maximize.button');
      if (maximizeButton) {
        maximizeButton.on('click', function() {
          maximize('*');
        });
      }

      var closeButton = qS(tbId + ' .close.button');
      if (closeButton) {
        closeButton.on('click', function() {
          _this.remove();
        });
      }

      var listenButton = qS(tbId + ' .listen.button');
      if (listenButton) {
        if (this._pubsub_listening) {
          listenButton.classList.remove('disabled');
        } else {
          listenButton.classList.add('disabled');
        }
        listenButton.on('click', function() {
          _this._pubsub_listening = !_this._pubsub_listening;
          if (_this._pubsub_listening) {
            listenButton.classList.remove('disabled');
          } else {
            listenButton.classList.add('disabled');
          }
        });
      }

      var publishingButton = qS(tbId + ' .publish.button');
      if (publishingButton) {
        if (this._pubsub_publishing) {
          publishingButton.classList.remove('disabled');
        } else {
          publishingButton.classList.add('disabled');
        }
        publishingButton.on('click', function() {
          _this._pubsub_publishing = !_this._pubsub_publishing;
          if (_this._pubsub_publishing) {
            publishingButton.classList.remove('disabled');
          } else {
            publishingButton.classList.add('disabled');
          }
        });
      }

      var clientsButton = qS(tbId + ' .clients.button');
      if (clientsButton) {
        clientsButton.on('mouseenter click', createClientsList);
        toolbarDiv.on('mouseenter', createClientsList);
        createClientsList();
      }

      function createClientsList() {
        clientsButton.classList.add('disabled');
        var dd = qS(tbId + ' .clients.button .dropdown');
        if (!dd) return;
        dd.innerHTML = '';
        if (!window.SynchronizationService || window.SynchronizationService.Clients.length < 2) return;
        clientsButton.classList.remove('disabled'); 
        window.SynchronizationService.Clients.forEach(function(client) {
          var li = document.createElement('li');
          li.setAttribute('data-client-id', client.id);
          var t = document.createTextNode(client.name + ' (' + client.type + ')');
          li.appendChild(t);
          if (window.SynchronizationService.Id === client.id) {
            li.classList.add('current');
          } else {
            li.on('click', function() {
              sendComponent(this.getAttribute('data-client-id'), _this);
            });
          }
          dd.appendChild(li);
        });
      }

      function sendComponent(clientId, component) {
        if (!window.SynchronizationService) return;
        window.SynchronizationService.sendMessage('move-tile', {
          client:  clientId,
          type:    component.tagName.toLowerCase(),
          width:   component.style.width,
          height:  component.style.height,
          state:   component.getState(),
          content: component.innerHTML
        });
        component.remove();
      }

      this.on('mouseover', function() {
        clearTimeout(_this.timer);
        _this.timer = setTimeout(function() { qS(tbId).style.display = 'block'; }, 500);
      }).on('mouseout', function() {
        clearTimeout(_this.timer);
        _this.timer = setTimeout(function() { qS(tbId).style.display = 'none'; }, 750);
      });

      function maximize() {
        if (!_this.hasFullScreenHandler) {
          _this.hasFullScreenHandler = true;
          var f = function() { _this.dispatchEvent(new Event('resize')); };
          document.addEventListener('MSFullscreenChange', f);
          document.addEventListener('mozfullscreenchange', f);
          document.addEventListener('webkitfullscreenchange', f);
          document.addEventListener('fullscreenchange', f);
        }
        if (_this.requestFullScreen) {
          _this.requestFullScreen();
        } else if (_this.msRequestFullscreen) {
          _this.msRequestFullscreen();
        } else if (_this.mozRequestFullScreen) {
          _this.mozRequestFullScreen();
        } else if (_this.webkitRequestFullScreen) {
          _this.webkitRequestFullScreen();
        }
      }

      function makeDraggable() {
        $(_this).draggable({
          start: function() {
            _this.style.zIndex = 10;
            _this.style.opacity = 0.7;
          },
          stop: function() {
            _this.style.zIndex = '';
            _this.style.opacity = 1;
          }
        }).draggable('disable');
        qS(tbId).on('mouseover', function() {
          if (_this.isDraggable) {
            $(_this).draggable('enable');
            qS(tbId).classList.add('draggable');
          }
        }).on('mouseout', function() {
          qS(tbId).classList.remove('draggable');
          $(_this).draggable('disable');
        });
        var btns = _this.shadowRoot.querySelectorAll(tbId + ' .buttons .button');
        for (var i = 0; i < btns.length; i++) {
          btns[i].on('mouseover', function(e) {
            e.stopPropagation();
            qS(tbId).classList.remove('draggable');
            $(_this).draggable('disable');
          });
        }
      }

      if (typeof $ === 'function' && $.ui) {
        makeDraggable();
      } else {
        window.loadScript("//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js", function() {
          window.loadScript("//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js", function() { makeDraggable(); });
        });
      }
    }
  };

  // exports
  scope.api.instance.interaction = interaction;

})(Polymer);