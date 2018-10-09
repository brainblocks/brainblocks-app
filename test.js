/* @flow */

import _ from 'lodash';
import Sequelize from 'sequelize';

import models from './models';

const User = models.models.User;
const Account = models.models.Account;
const BBTransaction = models.models.BBTransaction;
const TempAddress = models.models.TempAddress;
const HotWallet = models.models.HotWallet;
const ColdWallet = models.models.ColdWallet;
const HotColdWalletTransfer = models.models.HotColdWalletTransfer;

const Op = Sequelize.Op;
/*
 * Functions
 */

async function clearTestData() : Promise<boolean> {
    
    // delete test hot and cold wallets and their transfers
    HotWallet.destroy({
        where: {
            nanoAddress: {
                [Op.like]: 'test%'
            }
        }
    });

    ColdWallet.destroy({
        where: {
            nanoAddress: {
                [Op.like]: 'test%'
            }
        }
    });

    HotColdWalletTransfer.destroy({
        where: {
            nanoTxId: {
                [Op.like]: 'test%'
            }
        }
    });

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

function testHotColdWalletsRelations() : Promise<boolean> {
    // create test hot wallet
    // create test cold wallet
    // create a couple of test transfers
    return Promise.all([
        HotWallet.create({
            encryptedPrivateKey: 'fave',
            nanoAddress:         'test_addr1'
        }),
        ColdWallet.create({
            nanoAddress: 'test_addr2'
        })
    ]).then((wallets : Array<any>) => {
        return Promise.all([
            HotColdWalletTransfer.create({
                nanoTxId:    'test',
                type:        'hot_to_cold',
                fromAddress: wallets[0].nanoAddress,
                fromId:      wallets[0].id,
                toAddress:   wallets[1].nanoAddress,
                toId:        wallets[1].id,
                amountRai:   1000
            }),
            HotColdWalletTransfer.create({
                nanoTxId:    'test2',
                type:        'hot_to_cold',
                fromAddress: wallets[0].nanoAddress,
                fromId:      wallets[0].id,
                toAddress:   wallets[1].nanoAddress,
                toId:        wallets[1].id,
                amountRai:   20000000
            }),
            HotColdWalletTransfer.create({
                nanoTxId:    'test3',
                type:        'cold_to_hot',
                fromAddress: wallets[1].nanoAddress,
                fromId:      wallets[1].id,
                toAddress:   wallets[0].nanoAddress,
                toId:        wallets[0].id,
                amountRai:   99999
            })
        ]).then((transfers : Array<HotColdWalletTransfer>) => {
            return Promise.all([
                wallets[0].getTransfers(),
                wallets[0].getReceivedTransfers(),
                wallets[0].getSentTransfers(),
                wallets[1].getTransfers(),
                wallets[1].getReceivedTransfers(),
                wallets[1].getSentTransfers()
            ]).then((transfers0 : Array<Array<HotColdWalletTransfer>>) => {
                return _.isEqual(transfers0[0][0], transfers0[2][0]) &&
                       _.isEqual(transfers0[1][0], transfers0[5][0]) &&
                       _.isEqual(transfers0[2][0], transfers0[4][0]) &&
                       _.isEqual(transfers[0].getSender(), transfers[2].getReceiver());

            }).catch((err) => {
                console.error(err);
                return false;
            });

        }).catch((err) => {
            console.error(err);
            return false;
        });
    }).catch((err) => {
        console.error(err);
        return false;
    });
}

/**
 * Run tests
 */
(async () => {
    
    await clearTestData();
    
    let successes = {};

    Promise.all([
        testUserAccountAddressRelations(testBBTransactionRelations).then((res) => { successes.testUserAccountAddressRelations = res; }),
        testHotColdWalletsRelations().then((res) => { successes.testHotColdWalletsRelations = res; })
        // more tests here
    ])
        .then(() => console.log(successes))
        .catch((err) => console.log(err));

})();
