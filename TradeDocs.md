# Get array of Supported Currencies from ChangeNOW
GET `/api/trade/currencies`
Response - Array of Currencies `{"status": "success","currencies": [{"ticker": "btc","image": "https://changenow.io/images/coins/btc.svg","hasExternalId": false,"isFiat": false,"supportsFixedRate": true,"featured": false}]`

# Get array of every market pair
GET `/api/trade/pairs`
Response - Array of Pairs `{"status": "success","pairs": ["ant_bat","ant_ardr"]}`

# Get array of trading pairs for a currency
GET `/api/trade/pairs/NANO`
Response - Array of Currencies `{"status": "success","currencies": [{"ticker": "btc","image": "https://changenow.io/images/coins/btc.svg","hasExternalId": false,"isFiat": false,"supportsFixedRate": true,"featured": false}]`

# Get Minimal Amount for trade
GET= `/api/trade/minAmount/BTC_NANO`
Response - `{"status": "success","minAmount": 0.0028174}`

# Get a Trade Estimate
POST `/api/trade/estimate?amount=1.5&pair=ETH_NANO`
Response - `{"status": "success","estimate": {"estimatedAmount": 267.9558662,"transactionSpeedForecast": "10-60","warningMessage": null}}`

# Create Trade Transaction
POST `/api/trade/create`
Request Body - `{"pair": "BTC_NANO", "receiveAddress": "nano_1brainb3zz81wmhxndsbrjb94hx3fhr1fyydmg6iresyk76f3k7y7jiazoji", "tradeAmount": 1.5, "extraId": "null", "refundAddress": "3LKxArKXrJ7EfWrn1Ed6V82rVAQv8GML9s"}` (Extra Id for currencies that require it. Pair is "FROM_TO")
Response - `{"status": "success","trade": {"payinAddress": "34CnksbiGVVt4jBn1u37kcS9WWocReK1eD","payoutAddress": "nano_1brainb3zz81wmhxndsbrjb94hx3fhr1fyydmg6iresyk76f3k7y7jiazoji","fromCurrency": "btc","toCurrency": "nano","refundAddress": "3LKxArKXrJ7EfWrn1Ed6V82rVAQv8GML9s","id": "c956509259f767","amount": 17246.3333805}}`

# Get Trade Status
GET `/api/trade/trades`
Response - `{"status": "success","trades": [{"status": "waiting","payinAddress": "3BofZme8N8ww2AWT7pmPR9XSYcqkGFUPSK","payoutAddress": "nano_1brainb3zz81wmhxndsbrjb94hx3fhr1fyydmg6iresyk76f3k7y7jiazoji","fromCurrency": "btc","toCurrency": "nano","refundAddress": "3LKxArKXrJ7EfWrn1Ed6V82rVAQv8GML9s","id": 1,"updatedAt": "2019-08-17T02:47:55.066Z","expectedSendAmount": 1.5,"expectedReceiveAmount": 14429.8182207,"createdAt": "2019-08-17T02:47:55.066Z1`

# Get Trade Status
GET `/api/trade/trade/:tradeId`
Response - `{"status": "success","trade": {"status": "waiting","payinAddress": "3BofZme8N8ww2AWT7pmPR9XSYcqkGFUPSK","payoutAddress": "nano_1brainb3zz81wmhxndsbrjb94hx3fhr1fyydmg6iresyk76f3k7y7jiazoji","fromCurrency": "btc","toCurrency": "nano","refundAddress": "3LKxArKXrJ7EfWrn1Ed6V82rVAQv8GML9s","id": 1,"updatedAt": "2019-08-17T02:47:55.066Z","expectedSendAmount": 1.5,"expectedReceiveAmount": 14429.8182207,"createdAt": "2019-08-17T02:47:55.066Z"}}`
