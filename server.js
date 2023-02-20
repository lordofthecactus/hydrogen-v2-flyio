// Virtual entry point for the app
// const remixBuild = require('@remix-run/dev/server-build');
const path = require('path');
const express = require('express');
const {createRequestHandler} = require('@remix-run/express');
const {createStorefrontClient} = require('@shopify/hydrogen');
// const {getBuyerIp} = require('@shopify/remix-oxygen');

const app = express();
const BUILD_DIR = path.join(process.cwd(), 'build');

// const env = process.env;
const env = {
  PORT: 8080,
  SESSION_SECRET: 'foobar',
  PUBLIC_STOREFRONT_API_TOKEN: '3b580e70970c4528da70c98e097c2fa0',
  PUBLIC_STOREFRONT_API_VERSION: '2023-01',
  PUBLIC_STORE_DOMAIN: 'hydrogen-preview.myshopify.com',
};

const port = env.PORT || 3000;

// Remix fingerprints its assets so we can cache forever.
app.use(
  '/build',
  express.static('public/build', {immutable: true, maxAge: '1y'}),
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static('public', {maxAge: '1h'}));

app.all('*', (req, res, next) => {
  /**
   * Create Hydrogen's Storefront client.
   */
  const {storefront} = createStorefrontClient({
    // buyerIp: getBuyerIp(request),
    i18n: {language: 'EN', country: 'US'},
    publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
    privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
    storeDomain: `https://${env.PUBLIC_STORE_DOMAIN}`,
    storefrontApiVersion: env.PUBLIC_STOREFRONT_API_VERSION || '2023-01',
    storefrontId: env.PUBLIC_STOREFRONT_ID,
    // requestGroupId: request.headers.get('request-id'),
  });

  /**
   * Create a Remix request handler and pass
   * Hydrogen's Storefront client to the loader context.
   */
  return createRequestHandler({
    build: require(BUILD_DIR),
    // mode: process.env.NODE_ENV,
    mode: 'development',
    getLoadContext: () => ({storefront, env}),
  })(req, res, next);
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
