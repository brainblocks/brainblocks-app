# Get array of Supported Currencies from ChangeNOW
GET `/api/trade/currencies`
Response - Array of Currencies `{"status": "success","currencies": [{"ticker": "btc","image": "https://changenow.io/images/coins/btc.svg","hasExternalId": false,"isFiat": false,"supportsFixedRate": true,"featured": false}]`

# Get array of every market pair
GET `/api/trade/pairs`
Response - Array of Pairs `{"status": "success","pairs": ["ant_bat","ant_ardr"]}`

# Get array of trading pairs for a currency
POST `/api/trade/currencyPairs`
Request Body - `{"currency": "NANO"}`
Response - Array of Currencies `{"status": "success","currencies": [{"ticker": "btc","image": "https://changenow.io/images/coins/btc.svg","hasExternalId": false,"isFiat": false,"supportsFixedRate": true,"featured": false}]`

# Get Minimal Amount for trade
POST `/api/trade/minAmount`
Request Body - `{"pair": "BTC_NANO"}`
Response - `{"status": "success","minAmount": 0.0028174}`

# Get a Trade Estimate
POST `/api/trade/estimate`
Request Body - `{amount": 1.5, "pair": "ETH_NANO"}` (Trade Pair format: "FROM_TO")
Response - `{"status": "success","estimate": {"estimatedAmount": 267.9558662,"transactionSpeedForecast": "10-60","warningMessage": null}}`

# Create Trade Transaction
POST `/api/trade/create`
Request Body - `{"pair": "BTC_NANO", "receiveAddress": "nano_1brainb3zz81wmhxndsbrjb94hx3fhr1fyydmg6iresyk76f3k7y7jiazoji", "tradeAmount": 1.5, "extraId": "null", "refundAddress": "3LKxArKXrJ7EfWrn1Ed6V82rVAQv8GML9s"}` (Extra Id for currencies that require it. Pair is "FROM_TO")
Response - `{"status": "success","trade": {"payinAddress": "34CnksbiGVVt4jBn1u37kcS9WWocReK1eD","payoutAddress": "nano_1brainb3zz81wmhxndsbrjb94hx3fhr1fyydmg6iresyk76f3k7y7jiazoji","fromCurrency": "btc","toCurrency": "nano","refundAddress": "3LKxArKXrJ7EfWrn1Ed6V82rVAQv8GML9s","id": "c956509259f767","amount": 17246.3333805}}`

# Get Trade Status
POST `/api/trade/status`
Request Body - `{"pair": "BTC_NANO", "receiveAddress": "nano_1brainb3zz81wmhxndsbrjb94hx3fhr1fyydmg6iresyk76f3k7y7jiazoji", "tradeAmount": 1.5, "extraId": "null", "refundAddress": "3LKxArKXrJ7EfWrn1Ed6V82rVAQv8GML9s"}` (Extra Id for currencies that require it. Pair is "FROM_TO")
Response - `{"status": "success","trade": {"status": "waiting","payinAddress": "3HQ5KPg2bjZxRLixftXVygfXGF2YdJKdDW","payoutAddress": "nano_1brainb3zz81wmhxndsbrjb94hx3fhr1fyydmg6iresyk76f3k7y7jiazoji","fromCurrency": "btc","toCurrency": "nano","id": "22bbed1f24fe9e","updatedAt": "2019-08-16T20:50:54.557Z","expectedSendAmount": 1.75,"expectedReceiveAmount": 17280.7534505,"createdAt": "2019-08-16T20:50:54.557Z","isPartner": false}}`
