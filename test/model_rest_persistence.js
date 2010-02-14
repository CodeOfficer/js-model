module("Model.RestPersistence");

test("Model#save() (create)", function() {
  var Post = Model("post", {
    persistence: Model.RestPersistence("./post.json")
  });
  var post = new Post({ title: "Foo", body: "..." });

  AjaxSpy.start();
  AjaxSpy.stubData({ id: 1, title: "Foo amended", foo: "bar" });

  stop();

  post.save(function(success) {
    ok(success);
    same(this, post);
    same(post.attributes, { id: 1, title: "Foo amended", body: "...", foo: "bar" });
    equals(post.id(), 1);
    start();
  });

  equals(AjaxSpy.requests.length, 1, "one request should have been made");

  var request = AjaxSpy.requests.shift();

  equals(request.type, "POST");
  equals(request.url, "./post.json");
  equals(request.dataType, "json");
  same(request.data, { post: { title: "Foo", body: "..." } });
});

test("Model#save() (update)", function() {
  var Post = Model("post", {
    persistence: Model.RestPersistence("./post.json", {
      update_path: function() { return this.create_path(); }
    })
  });
  var post = new Post({ id: 1, title: "Foo", body: "..." });
  post.attr("title", "Bar");

  AjaxSpy.start();
  AjaxSpy.stubData({ title: "Bar amended" });

  stop();

  post.save(function(success) {
    ok(success);
    same(this, post);
    same(post.attributes, { id: 1, title: "Bar amended", body: "..." });
    start();
  });

  equals(AjaxSpy.requests.length, 1, "one request should have been made");

  var request = AjaxSpy.requests.shift();

  equals(request.type, "PUT");
  equals(request.url, "./post.json");
  equals(request.dataType, "json");
  same(request.data, { post: { title: "Bar", body: "..." } });
});

test("Model#destroy()", function() {
  var Post = Model("post", {
    persistence: Model.RestPersistence("./post.json", {
      update_path: function() { return this.create_path(); }
    })
  });
  var post = new Post({ id: 1, title: "Foo", body: "..." });

  AjaxSpy.start();

  stop();

  post.destroy(function(success) {
    ok(success);
    start();
  });

  equals(AjaxSpy.requests.length, 1, "one request should have been made");

  var request = AjaxSpy.requests.shift();

  equals(request.type, "DELETE");
  equals(request.url, "./post.json");
  equals(request.dataType, "json");
  same(request.data, null);
});

test("events", function() {
  var Post = Model("post", {
    persistence: Model.RestPersistence("./post.json", {
      update_path: function() { return this.create_path(); }
    })
  });

  var events = [];

  // Stub trigger and capture its argument.
  Post.prototype.trigger = function(name) {
    events.push(name);
  };

  var post = new Post();

  AjaxSpy.stubData({ id: 1 });

  stop();

  post.save(function() {
    same(events.join(", "), "create");

    post.save(function() {
      same(events.join(", "), "create, update");
      start();
    });
  });
});
