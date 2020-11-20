const handler = require('../handler');

test('test example', () => {
  expect(handler.getLocalGreeting("en")).toBe("Hello!");
  expect(handler.getLocalGreeting("fr")).toBe("🌊");
});