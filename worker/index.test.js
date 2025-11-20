const index = require("./index");

test("fibonacci of 0 is 0", () => {
  expect(index.fibonacci(0)).toBe(0);
});

test("fibonacci of 1 is 1", () => {
  expect(index.fibonacci(1)).toBe(1);
});

test("fibonacci of 5 is 5", () => {
  expect(index.fibonacci(5)).toBe(5);
});
