# CAEB PROVIDERS

![NPM Version](https://badge.fury.io/js/caeb-providers.svg)

`caeb-providers` is a nodejs (TypeScript) library to provide universal interface to read balances and manage orders for supported providers.

**This version is a proof of work for all my private tools in development.**

All will be usable on v1.0.0, secure, but below please considers to use that library in your projects as dangerous to include.

Anyway, that lib is the foundation stone of a lot of my projects (portfolio, different kind of bots) to abstract the exchange behind blockchain interactions.

## Install

```shell
yarn add caeb-providers

# - or -

npm i caeb-providers
```

## Providers supported

-   [x] Binance
-   [x] Kucoin
-   [x] FTX
-   [ ] DyDx
-   [ ] Gate.io
-   [ ] Ethereum
-   [ ] Polygon / Matic
-   [ ] Binance Smart Chain
-   [ ] Avalanche
-   [ ] Fantom Opera

## Methods

List of abstract methods.

#### `public async getExchangeInfo(): Promise<IAsset[]>`

Returns all assets available on the network.

| Key (IAsset)   | Type   | Description                                                |
| -------------- | ------ | ---------------------------------------------------------- |
| baseAsset      | string | The base asset (ie: BTC)                                   |
| quoteAsset     | string | The quote asset (ie: USDT)                                 |
| pricePrecision | number | Base asset count of decimals                               |
| quotePrecision | number | Quote asset count of decimals                              |
| minPrice       | number | The minimum quote asset price to create an order           |
| maxPrice       | number | The maximum quote asset price to create an order           |
| minQty         | number | The minimum base asset size to create an order             |
| stepSize       | number | The base asset size increment                              |
| minNotional    | number | The minimum amount of quote asset to create an order       |
| status         | string | Trading is available for this pair ('TRADING' : 'LISTING') |
| maxNumOrders   | number | [Optional] Maximum number of orders for the pair           |

## Documentation

Visit [https://caebwallace.github.io/caeb-providers/](https://caebwallace.github.io/caeb-providers/) for extended informations and documentations.

## Want to donate ?

If you like **that project and my work**, you can send me your **favorite altcoin** to my **ERC20** / **BEP20** wallet address : [0x1Ed970C1D3F9B85bA6607d45C752E22D9b0b09f4](https://bscscan.com/address/0x1Ed970C1D3F9B85bA6607d45C752E22D9b0b09f4)

## Credits

Thanks to [covalent](https://www.covalenthq.com/), [axios](https://github.com/axios/axios) and [web3](https://github.com/ChainSafe/web3.js) for their developments and products.

## License

[MIT](LICENSE)

Made by [Caeb WALLACE](https://twitter.com/caeb_wallace) with ❤️
