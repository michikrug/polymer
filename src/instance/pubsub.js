(function(scope) {

  var NAMESPACE = 'SmartComposition.';

  var pubsub = {

    _pubsub_listening: true,

    _pubsub_init: function() {
      if (typeof this._pubsub_messageHandler === 'function') return this;
      this._pubsub_id = NAMESPACE + Math.random().toString(36).substr(2, 17);
      this._pubsub_subscriptions = {};
      this._pubsub_messageHandler = (function(evt) {
        var message = evt.data;
        if (!this._pubsub_listening) return;
        if (!message.type || message.type !== NAMESPACE + 'message' || message.origin === this._pubsub_id) return;
        this._pubsub_subscriptions[message.data.topic] && this._pubsub_subscriptions[message.data.topic].forEach(function(current) {
          if (current.token && message.token && current.token === message.token) return;
          current.token = message.token;
          current.handler.call(this, message.data, message.token);
        }, this);
      }).bind(this);
      return this;
    },

    _pubsub_subscribe: function(topic, handler) {
      if (!topic || topic.length === 0) return this;
      if (typeof handler !== 'function') handler = this.messageReceived;
      if (!this._pubsub_subscriptions[topic]) this._pubsub_subscriptions[topic] = [];
      if (!~this._pubsub_subscriptions[topic].indexOf(handler)) this._pubsub_subscriptions[topic].push({ handler: handler, token: null });
      return this;
    },

    _pubsub_unsubscribe: function(topic, handler) {
      if (!topic || topic.length === 0 || !this._pubsub_subscriptions[topic]) return this;
      if (typeof handler !== 'function') handler = this.messageReceived;
      var found = -1;
      for (var index = 0, len = this._pubsub_subscriptions[topic].length; index < len; index++) {
        var current = this._pubsub_subscriptions[topic][index];
        if (current.handler === handler) {
          found = index;
          break;
        }
      }
      if (~found) this._pubsub_subscriptions[topic].splice(found, 1);
      return this;
    },

    _pubsub_activateListener: function() {
      window.addEventListener('message', this._pubsub_messageHandler);
      return this;
    },

    _pubsub_deactivateListener: function() {
      window.removeEventListener('message', this._pubsub_messageHandler);
      return this;
    },

    _pubsub_sendMessage: function(topic, data, token) {
      var d;
      if (typeof topic === 'object') {
        token = data;
        d = topic;
      } else {
        d = { topic: topic, data: data };
      }
      if (!token) token = Math.random().toString(36).substr(2, 17);
      window.postMessage({
        type: NAMESPACE + 'message',
        data: d,
        origin: this._pubsub_id,
        token: token
      }, window.location.origin);
      return this;
    },

    messageReceived: function(message) {
      console.log(this, ' received message ', message);
    }

  };

  // exports
  scope.api.instance.pubsub = pubsub;

})(Polymer);