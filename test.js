/* @flow */

import models from './models';

const User = models.models.User;
const Account = models.models.Account;
const BBTransaction = models.models.BBTransaction;
const TempAddress = models.models.TempAddress;
/*
 * Functions
 */

async function clearTestData() : Promise<boolean> {
    
    let user = await User.findOne({
        where: {
            username: 'test'
        },
        cascade: true
    });

    if (user) {
        let accs = await user.getAccounts();
        for (let acc in accs) {
            if (accs[acc]) {
                accs[acc].destroy();
            }
        }

        let addr = await user.getTempAddresses();
        for (let a in addr) {
            if (addr[a]) {
                addr[a].destroy();
            }
        }

        return user.destroy();
    } else { return true; }
}

async function testUserAccountAddressRelations(nextTest) : Promise<boolean> {

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

        await user.getAccounts();


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
                        if (tempAddresses.length !== 2) {
                            return false;
                        }
                        if (nextTest) {
                            return nextTest();
                        }
                        return true;
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

    } catch (err) {
        console.error(err);
        return false;
    }
}

async function testBBTransactionRelations() : Promise<boolean> {
    
    let user = await User.findOne({ where: { username: 'test' } });

    if (user) {
        return Account.findAll({ where: { userId: user.id } })
            .then((accs) => {
                if (accs.length === 2) {
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
                        .then(() => {
                            return Promise.all([
                                accs[0].getSends(),
                                accs[1].getReceives()
                            ])
                                .then((res) => {
                                    if (res[0].length === res[1].length) // same sends and receives
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

/**
 * Run tests
 */
(async () => {
    
    await clearTestData();
    
    let successes = {};

    Promise.all([
        testUserAccountAddressRelations(testBBTransactionRelations).then((res) => { successes.testUserAccountAddressRelations = res; })
        // more tests here
    ])
        .then(() => console.log(successes))
        .catch((err) => console.log(err));

})();
