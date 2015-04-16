(function(scope) {

  var interaction = {

    addInteractionStuff: function() {
      var _this = this;

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

      if (qS('.handle')) return;

      var handleDiv = document.createElement('div');
      handleDiv.className = 'handle';
      handleDiv.innerHTML = '<div class="buttons left"><div class="listen button">L</div><div class="publish button">P</div></div><div class="buttons right"><div class="clients button"><span>v</span><ul class="dropdown"></ul></div><div class="close button">X</div></div>';
      this.shadowRoot.appendChild(handleDiv);

      var style = document.createElement('style');
      style.appendChild(document.createTextNode(''));
      _this.shadowRoot.appendChild(style);
      style.sheet.insertRule(":host { position: relative; }", 0);
      style.sheet.insertRule(".handle { \
  font-family: sans-serif; \
  top: 0; \
  display: none; \
  height: 25px; \
  width: 100%; \
  cursor: move; \
  text-align: center; \
  background: rgba(250,250,250,.7); \
  font-size: 12px; \
  position: absolute; \
}", 0);
      style.sheet.insertRule(".handle > span { line-height: 25px; }", 0);
      style.sheet.insertRule(".buttons { \
  position: absolute; \
  top: 3px; \
}", 0);
      style.sheet.insertRule(".buttons.right { right: 0; }", 0);
      style.sheet.insertRule(".buttons.left { left: 4px; }", 0);
      style.sheet.insertRule(".button { \
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
      style.sheet.insertRule(".button:hover { border: 1px inset #fff; }", 0);
      style.sheet.insertRule(".button.disabled { color: #aaa; }", 0);
      style.sheet.insertRule(".button > .dropdown { \
  display: none; \
  position: absolute; \
  width: auto; \
  height: auto; \
  top: 5px; \
  left: -150px; \
  padding: 8px 0 0 0; \
  text-align: left; \
}", 0);
      style.sheet.insertRule(".button:hover > .dropdown { display: block; }", 0);
      style.sheet.insertRule(".button > .dropdown > li { \
  width: auto; \
  min-width: 160px; \
  line-height: 22px; \
  background: rgb(245,245,245); \
  list-style: none; \
  border: 1px solid #ddd; \
  padding: 0 5px; \
  border-bottom: 0; \
}", 0);
      style.sheet.insertRule(".button > .dropdown > li.current { color: #999; }", 0);
      style.sheet.insertRule(".button > .dropdown > li:last-child { border-bottom: 1px solid #ddd; }", 0);
      style.sheet.insertRule(".button > .dropdown > li:hover { background: rgb(220,220,220); }", 0);
      style.sheet.insertRule(".button > .dropdown > li.current:hover { background: rgb(245,245,245); }", 0);

      var closeButton = qS('.handle .close.button');
      if (closeButton) {
        closeButton.on('click', function() {
          _this.remove();
        });
      }

      var listenButton = qS('.handle .listen.button');
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

      var publishingButton = qS('.handle .publish.button');
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

      var clientsButton = qS('.handle .clients.button');
      if (clientsButton) {
        clientsButton.on('mouseenter click', function() {
          if (!window.SynchronizationService) return;
          var dd = this.querySelector('.dropdown');
          dd.innerHTML = '';
          window.SynchronizationService.Clients.forEach(function(client) {
            var li = document.createElement('li');
            li.setAttribute('data-client-id', client.id);
            var t = document.createTextNode(client.name + ' (' + client.type + ')');
            li.appendChild(t);
            if (window.SynchronizationService.Id === client.id) {
              li.classList.add('current');
            } else {
              li.on('click', function() {
                window.SynchronizationService.sendMessage('move-tile', { client: this.getAttribute('data-client-id'), type: _this.tagName.toLowerCase(), width: _this.style.width, height: _this.style.height, state: _this.getState(), content: _this.innerHTML });
                _this.remove();
              });
            }
            dd.appendChild(li);
          });
        });
      }

      this.on('mouseover', function() {
        clearTimeout(_this.timer);
        _this.timer = setTimeout(function() { qS('.handle').style.display = 'block'; }, 500);
      }).on('mouseout', function() {
        clearTimeout(_this.timer);
        _this.timer = setTimeout(function() { qS('.handle').style.display = 'none'; }, 750);
      });

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
        qS('.handle').on('mouseover', function(e) {
          if (e.toElement.className.indexOf('button') > -1) {
            $(_this).draggable('disable');
          } else {
            $(_this).draggable('enable');
          }
        }).on('mouseout', function() {
          $(_this).draggable('disable');
        });
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