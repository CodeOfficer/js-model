module("ModelCollection");

test("ModelCollection", function() {
  var Post = Model('post');
  var PostCollection = ModelCollection();

  var post1 = new Post({ id: 1 });
  var post2 = new Post({ id: 2 });

  same(PostCollection.all(), []);
  equals(PostCollection.find(1), null);
  equals(PostCollection.first(), null);

  PostCollection.add(post1).add(post2);

  same(PostCollection.all(), [post1, post2]);
  same(PostCollection.find(1), post1);
  same(PostCollection.find(2), post2);
  same(PostCollection.find(3), null);
  same(PostCollection.first(), post1);
});

test("Custom methods", function() {
  var PostCollection = ModelCollection({
    foo: function() {
      return "foo";
    }
  });

  equals(PostCollection.foo(), "foo");
});
