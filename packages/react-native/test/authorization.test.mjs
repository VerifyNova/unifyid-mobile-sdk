import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { SourceTextModule, SyntheticModule } from 'node:vm';

async function loadWrapper() {
  let captured;
  const adapter = new SyntheticModule(['authorize'], function () {
    this.setExport('authorize', options => { captured = options; return Promise.resolve({ accessToken: 'test-result' }); });
  });
  const module = new SourceTextModule(await readFile(new URL('../src/index.js', import.meta.url), 'utf8'));
  await module.link(name => {
    assert.equal(name, 'react-native-app-auth');
    return adapter;
  });
  await module.evaluate();
  return { authorize: module.namespace.continueWithUnifyID, captured: () => captured };
}

test('React Native wrapper enables PKCE and exchanges the authorization code', async () => {
  const wrapper = await loadWrapper();
  const result = await wrapper.authorize({ clientId: 'test-app', redirectUrl: 'example:/callback' });
  assert.deepEqual(result, { accessToken: 'test-result' });
  assert.equal(wrapper.captured().clientId, 'test-app');
  assert.equal(wrapper.captured().redirectUrl, 'example:/callback');
  assert.equal(wrapper.captured().usePKCE, true);
  assert.equal(wrapper.captured().skipCodeExchange, false);
  assert.deepEqual(wrapper.captured().scopes, ['openid', 'profile']);
});

test('React Native wrapper passes the selected issuer and scopes to native authorization', async () => {
  const wrapper = await loadWrapper();
  await wrapper.authorize({ clientId: 'other-app', redirectUrl: 'other:/return', apiBaseUrl: 'https://issuer.example', scopes: ['openid', 'email'] });
  assert.deepEqual(wrapper.captured().serviceConfiguration, {
    authorizationEndpoint: 'https://issuer.example/v1/oauth/authorize',
    tokenEndpoint: 'https://issuer.example/v1/oauth/token',
  });
  assert.deepEqual(wrapper.captured().scopes, ['openid', 'email']);
});
