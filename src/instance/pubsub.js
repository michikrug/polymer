(function(scope) {

  var pubsub = {

    _pubsub_topics: [],
    _pubsub_lastMessage: null,
    _pubsub_listening: true,
    _pubsub_namespace: 'SmartComposition.',

    _pubsub_init: function() {
      if (typeof this._pubsub_messageHandler === 'function') return;
      this._pubsub_topics = [];
      this._pubsub_id = this._pubsub_namespace + Math.random().toString(36).substr(2, 17);
      this._pubsub_messageHandler = (function(evt) {
        var message = evt.data;
        if (!this._pubsub_listening) return;
        if (!message.type || message.type !== this._pubsub_namespace + 'message' || message.origin === this._pubsub_id) return;
        if (!message.data.topic || !~this._pubsub_topics.indexOf(message.data.topic)) return;
        if (this._pubsub_lastMessage && message.token && this._pubsub_lastMessage.token === message.token) return;
        this._pubsub_lastMessage = message;
        if (this.messageReceived) this.messageReceived.call(this, message.data);
      }).bind(this);
    },

    _pubsub_subscribe: function(topics) {
      if (topics.length === 0) return;
      if (typeof topics === 'string') topics = [topics];
      var _this = this;
      topics.forEach(function(topic) {
        if (!~_this._pubsub_topics.indexOf(topic)) _this._pubsub_topics.push(topic);
      });
      return this._pubsub_topics;
    },

    _pubsub_unsubscribe: function(topics) {
      if (topics.length === 0) return;
      if (typeof topics === 'string') topics = [topics];
      var _this = this;
      topics.forEach(function(topic) {
        var index = _this._pubsub_topics.indexOf(topic);
        if (~index) _this._pubsub_topics.splice(index, 1);
      });
      return this._pubsub_topics;
    },

    _pubsub_activateListener: function() {
      window.addEventListener('message', this._pubsub_messageHandler);
    },

    _pubsub_deactivateListener: function() {
      window.removeEventListener('message', this._pubsub_messageHandler);
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
      this._pubsub_lastMessage = {
        type: this._pubsub_namespace + 'message',
        data: d,
        origin: this._pubsub_id,
        token: token
      };
      window.postMessage(this._pubsub_lastMessage, window.location.origin);
    },

    messageReceived: function(message) {
      console.log(this, ' received message ', message);
    }
  };

  // exports
  scope.api.instance.pubsub = pubsub;

})(Polymer);