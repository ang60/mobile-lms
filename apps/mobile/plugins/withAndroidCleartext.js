const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Ensures android:usesCleartextTraffic="true" is set so the app can reach
 * the dev API at http://10.0.2.2:3000 (Android emulator) or http://<host-ip>:3000.
 */
function withAndroidCleartext(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (application) {
      application.$['android:usesCleartextTraffic'] = 'true';
    }
    return config;
  });
}

module.exports = withAndroidCleartext;
