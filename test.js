/* @flow */


import { User } from './models';

const Account = require('./models').Account;
const TempAddress = require('./models').TempAddress;
const BBTransaction = require('./models').BBTransaction;

const async = require('async');


(async function() {
    
    await clearTestData();
    
    let successes = {};

    Promise.all([
        testUserAccountAddressRelations(testBBTransactionRelations).then((res) => successes.testUserAccountAddressRelations = res)
        // more tests here
    ])
        .then(() => console.log(successes))
        .catch((err) => console.log(err));

}());


/*
 * Functions
 */

async function clearTestData() {
    
    let user = await User.findOne({
        where: {
            username: 'test'
        },
        cascade: true
    });

    if (user) {
        let accs = await user.getAccounts();
        for (acc in accs) {
            accs[acc].destroy();
        }

        let addr = await user.getTempAddresses();
        for (a in addr) {
            addr[a].destroy();
        }

        return user.destroy();
    } else { return true; }
}

async function testUserAccountAddressRelations(nextTest) {

    let user = await User.create({
        username: 'test',
        passHash: 'xxxx',
        email:    'test@test.com'
    });

    try {
        let accs = await Promise.all([
            Account.create({
                userId: user.id,
                label:  'test1'
            }),
            Account.create({
                userId: user.id,
                label:  'test2'
            })
        ]);

        let accs2 = await user.getAccounts();


        return Promise.all([
            TempAddress.create({
                userId:              user.id,
                accountId:           accs[0].id,
                encryptedPrivateKey: 'sasaa',
                nanoAddress:         'asas'
            }),
            TempAddress.create({
                userId:              user.id,
                accountId:           accs[0].id,
                encryptedPrivateKey: 'asasa',
                nanoAddress:         'asasasasas'
            })
        ])
            .then(() => {
                return accs[0].getTempAddresses()
                    .then((tempAddresses) => {
                        if (tempAddresses.length != 2) { return false; }
                        if (nextTest) { return nextTest(); }
                        return true;
                    })
                    .catch((err) => { console.error(err); return false; });
            })
            .catch((err) => { console.error(err); return false; });

    } catch (err) {
        console.error(err);
        return false;
    }
}

async function testBBTransactionRelations() {
    let user = await User.findOne({ where: { username: 'test' } });

    if (user) {
        return Account.findAll({ where: { userId: user.id } })
            .then((accs) => {
                if (accs.length == 2) {
                    return Promise.all([
                        BBTransaction.create({
                            fromAccount: accs[0].id,
                            toAccount:   accs[1].id,
                            amountRai:   1000,
                            amountUSD:   10.00
                        }),
                        BBTransaction.create({
                            fromAccount: accs[0].id,
                            toAccount:   accs[1].id,
                            amountRai:   20000,
                            amountUSD:   0.01
                        }),
                        BBTransaction.create({
                            fromAccount: accs[0].id,
                            toAccount:   accs[1].id,
                            amountRai:   1,
                            amountUSD:   0
                        })
                    ])
                        .then((res) => {
                            return Promise.all([
                                accs[0].getSends(),
                                accs[1].getReceives()
                            ])
                                .then((res) => {
                                    if (res[0].length == res[1].length) // same sends and receives
                                    { return true; }
                                    return false;
                                })
                                .catch((err) => {
                                    console.error(err);
                                    return false;
                                });
                        })
                        .catch((err) => {
                            console.error(err);
                            return false;
                        });
                }
                return false;
            })
            .catch((err) => {
                console.error(err);
                return false;
            });
    }
    return false;
}
