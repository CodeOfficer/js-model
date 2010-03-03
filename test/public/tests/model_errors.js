module("Model.Errors");

test("add, clear, length, each", function() {
  var errors = new Model.Errors();

  equals(errors.length, 0);
  same(errors.on("body"), []);
  same(errors.on("title"), []);

  var results = [];

  errors.each(function(attribute, message) {
    results.push(attribute, message);
  });

  same(results, []);

  errors.add("title", "can't be blank");

  equals(errors.length, 1);
  same(errors.on("body"), []);
  same(errors.on("title"), ["can't be blank"]);

  errors.add("title", "must be more than 1 character");

  equals(errors.length, 2);
  same(errors.on("body"), []);
  same(errors.on("title"), ["can't be blank", "must be more than 1 character"]);

  results = [];

  errors.each(function(attribute, message) {
    results.push(attribute, message);
  });

  same(results, [
    "title", "can't be blank",
    "title", "must be more than 1 character"
  ]);

  errors.add("body", "can't be blank");

  results = [];

  errors.each(function(attribute, message) {
    results.push(attribute, message);
  });

  same(results, [
    "title", "can't be blank",
    "title", "must be more than 1 character",
    "body", "can't be blank"
  ]);

  errors.clear();

  equals(errors.length, 0);
  same(errors.on("body"), []);
  same(errors.on("title"), []);
});
