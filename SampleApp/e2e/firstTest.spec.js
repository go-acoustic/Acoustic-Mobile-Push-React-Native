const assert = require('assert');

describe('Example', () => {
  before(async () => {
    await device.launchApp({ permissions: { notifications: 'YES', location: 'always' } });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });
  it('should be able to do math', async () => {
    assert.equal(1 + 1, 2);
  });
});

