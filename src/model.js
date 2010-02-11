var Model = function(name, methods) {
  // The model constructor.
  var model = function(attributes) {
    this._name = name;
    this.attributes = attributes || {};
    this.changes = {};
    this.collection = collection;
    this.errors = [];
    this.trigger('initialize');
  };

  // Use a custom collection object if specified, otherwise create a default.
  var collection;
  if (methods && methods.collection) {
    collection = methods.collection;
    delete methods.collection;
  } else {
    collection = Model.Collection();
  };

  // Borrow the Collection's methods and add to the model as "class" methods.
  model = $.extend(model, collection);

  model.prototype = $.extend({
    attr: function(name, value) {
      if (arguments.length == 2) {
        // Don't write to attributes yet, store in changes for now.
        if (_.isEqual(this.attributes[name], value)) {
          // Clean up any stale changes.
          delete this.changes[name];
        } else {
          this.changes[name] = value;
        };
        return this;
      } else if (typeof name == "object") {
        // Mass-assign attributes.
        for (var key in name) {
          this.attr(key, name[key]);
        };
        return this;
      } else {
        // Changes take precedent over attributes.
        return (name in this.changes) ?
          this.changes[name] :
          this.attributes[name];
      };
    },

    callPersistMethod: function(method, success, failure) {
      var self = this;

      // Automatically manage adding and removing from a Model.Collection if
      // one is defined.
      var manageCollection = function() {
        if (!self.collection) return;
        if (method == "create") {
          self.collection.add(self);
        } else if (method == "destroy") {
          self.collection.remove(self.id());
        };
      };

      if (this.persistence) {
        var wrappedSuccess = function() {
          manageCollection();

          // Store the return value of the success callback.
          var value;

          // Run the supplied callback.
          if (success) value = success.apply(self, arguments);

          // Now trigger an event.
          self.trigger(method);

          return value;
        };

        this.persistence[method](this, wrappedSuccess, failure);
      } else {
        manageCollection();

        // Trigger the event.
        this.trigger(method);

        // Execute the callback if specified.
        if (success) success.call(this, true);
      };
    },

    destroy: function(success, failure) {
      this.callPersistMethod("destroy", success, failure);
      return this;
    },

    id: function() {
      return this.attributes.id || null;
    },

    newRecord: function() {
      return this.id() == null;
    },

    reset: function() {
      this.changes = {};
      return this;
    },

    save: function(success, failure) {
      if (!this.valid()) return false;

      // Merge any changes into attributes and clear changes.
      this.update(this.changes).reset();

      var method = this.newRecord() ? "create" : "update";
      this.callPersistMethod(method, success, failure);

      return true;
    },

    toParam: function() {
      var params = {};
      for (var attr in this.attributes) {
        var value = this.attributes[attr];
        if (attr != 'id' && value != null) {
          params[this._name + '[' + attr + ']'] = value;
        };
      };
      return params;
    },

    trigger: function(name) {
      $(document).trigger([name, this._name].join('.'), [this]);
      return this;
    },

    update: function(attributes) {
      $.extend(this.attributes, attributes);
      return this;
    },

    valid: function() {
      this.errors = [];
      this.validate();
      return this.errors.length == 0;
    },

    validate: function() {
      return this;
    }
  }, methods);

  return model;
};
