/* @flow */
import request from 'request-promise';

const CHANGENOW_KEY = process.env.CHANGENOW_KEY || '';

type TransactionOptions = {
  to : ?string,
  from : ?string,
  status : ?string,
  limit : ?number,
  offset : ?number
};

export async function wait(ms : number) : Promise<void> {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

export async function marketPairs() : Promise<Array<string>> {
    let res;

    try {
        res = await request({
            method:                  'GET',
            uri:                     `https://changenow.io/api/v1/market-info/available-pairs`,
            resolveWithFullResponse: true
        });
    } catch (err) {
        await wait(1000);

        res = await request({
            method:                  'GET',
            uri:                     `https://changenow.io/api/v1/market-info/available-pairs`,
            resolveWithFullResponse: true
        });
    }

    return JSON.parse(res.body);
}

export async function tradeCurrencies() : Promise<Array<{ticker : string, image : string, hasExternalId : boolean, isFiat : boolean, supportsFixedRate : boolean, featured : boolean}>> {
    let res;

    try {
        res = await request({
            method:                  'GET',
            uri:                     `https://changenow.io/api/v1/currencies`,
            resolveWithFullResponse: true
        });
    } catch (err) {
        await wait(1000);

        res = await request({
            method:                  'GET',
            uri:                     `https://changenow.io/api/v1/currencies`,
            resolveWithFullResponse: true
        });
    }

    return JSON.parse(res.body);
}

export async function tradePairs(currency : string) : Promise<Array<{ticker : string, image : string, hasExternalId : boolean, isFiat : boolean, supportsFixedRate : boolean, featured : boolean}>> {
    let res;

    try {
        res = await request({
            method:                  'GET',
            uri:                     `https://changenow.io/api/v1/currencies-to/${ currency }`,
            resolveWithFullResponse: true
        });
    } catch (err) {
        await wait(1000);

        res = await request({
            method:                  'GET',
            uri:                     `https://changenow.io/api/v1/currencies-to/${ currency }`,
            resolveWithFullResponse: true
        });
    }

    return JSON.parse(res.body);
}

export async function minimalAmount(pair : string) : Promise<number> {
    let res;

    try {
        res = await request({
            method:                  'GET',
            uri:                     `https://changenow.io/api/v1/min-amount/${ pair }`,
            resolveWithFullResponse: true
        });
    } catch (err) {
        await wait(1000);

        res = await request({
            method:                  'GET',
            uri:                     `https://changenow.io/api/v1/min-amount/${ pair }`,
            resolveWithFullResponse: true
        });
    }

    return JSON.parse(res.body).minAmount;
}

export async function tradeEstimate(pair : string, amount : number) : Promise<{estimatedAmount : number, transactionSpeedForecast : string, warningMessage : string}> {
    let res;

    try {
        res = await request({
            method:                  'GET',
            uri:                     `https://changenow.io/api/v1/exchange-amount/${ amount }/${ pair }`,
            resolveWithFullResponse: true
        });
    } catch (err) {
        await wait(1000);

        res = await request({
            method:                  'GET',
            uri:                     `https://changenow.io/api/v1/exchange-amount/${ amount }/${ pair }`,
            resolveWithFullResponse: true
        });
    }

    return JSON.parse(res.body);
}

export async function createTrade(pair : string, receiveAddress : string, tradeAmount : number, extraId : string, refundAddress : string) : Promise<void> {
    let res;

    // split out trade pair
    // had to use this method due to 5 function param limit
    let from = pair.split('_')[0];
    let to = pair.split('_')[1];
    let body = JSON.stringify({ from, to, address: receiveAddress, amount: tradeAmount, extraId, refundAddress });

    try {
        res = await request({
            method:                  'POST',
            uri:                     `https://changenow.io/api/v1/transactions/${ CHANGENOW_KEY }`,
            headers: {
                'content-type': 'application/json'
            },
            body,
            resolveWithFullResponse: true
        });
    } catch (err) {
        await wait(1000);

        res = await request({
            method:                  'POST',
            uri:                     `https://changenow.io/api/v1/transactions/${ CHANGENOW_KEY }`,
            headers: {
                'content-type': 'application/json'
            },
            body,
            resolveWithFullResponse: true
        });
    }

    return JSON.parse(res.body);
}

export async function tradeStatus(id : string) : Promise<{id : string, status : string, hash : string, payinHash : string, payoutHash : string, payinAddress : string, payoutAddress : string, payinExtraId : string, payoutExtraId : string, fromCurrency : string, toCurrency : string, amountSend : number, amountReceive : number, networkFee : number, updatedAt : string, isPartner : boolean}> {
    let res;

    try {
        res = await request({
            method:                  'GET',
            uri:                     `https://changenow.io/api/v1/transactions/${ id }/${ CHANGENOW_KEY }`,
            resolveWithFullResponse: true
        });
    } catch (err) {
        await wait(1000);

        res = await request({
            method:                  'GET',
            uri:                     `https://changenow.io/api/v1/transactions/${ id }/${ CHANGENOW_KEY }`,
            resolveWithFullResponse: true
        });
    }

    return JSON.parse(res.body);
}

export async function getTransactions(options : TransactionOptions) : Promise<Array<{id : string, status : string, hash : string, payinHash : string, payoutHash : string, payinAddress : string, payoutAddress : string, payinExtraId : string, payoutExtraId : string, fromCurrency : string, toCurrency : string, amountSend : number, amountReceive : number, networkFee : number, updatedAt : string, isPartner : boolean}>> {
    let res;

    try {
        res = await request({
            method:                  'GET',
            uri:                     `https://changenow.io/api/v1/transactions/${ CHANGENOW_KEY }`,
            qs:                      options,
            resolveWithFullResponse: true
        });
    } catch (err) {
        await wait(1000);

        res = await request({
            method:                  'GET',
            uri:                     `https://changenow.io/api/v1/transactions/${ CHANGENOW_KEY }`,
            qs:                      options,
            resolveWithFullResponse: true
        });
    }

    return JSON.parse(res.body);
}
