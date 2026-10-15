/* global device, element, by */
describe('SampleApp', () => {
  beforeAll(async () => {
    await device.launchApp({ permissions: { notifications: 'YES', location: 'always' } });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('shows the home screen navigation', async () => {
    await expect(element(by.id('campaign_nav_registration'))).toBeVisible();
    await expect(element(by.id('campaign_nav_inbox'))).toBeVisible();
  });

  it('opens Registration Details', async () => {
    await element(by.id('campaign_nav_registration')).tap();
    await expect(element(by.id('campaign_registration_user_id'))).toBeVisible();
    await expect(element(by.id('campaign_registration_channel_id'))).toBeVisible();
  });
});
