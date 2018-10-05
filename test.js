

const User = require('./models').User;
const Account = require('./models').Account;
const TempAddress = require('./models').TempAddress;
const async = require('async');



(async function() {
    var successes = {};

    Promise.all([
        testUserAccountAddressRelations().then((res) => successes.testUserAccountAddressRelations = res),
        // more tests here
    ])
    .then(() => console.log(successes))
    .catch((err) => console.log(err));

})();


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

    if(user) {
        let accs = await user.getAccounts();
        for(acc in accs) {
            accs[acc].destroy();
        }

        let addr = await user.getTempAddresses();
        for(a in addr) {
            addr[a].destroy();
        }

        return user.destroy();
    } else
        return true;
}

async function testUserAccountAddressRelations() {
     
    await clearTestData();

    let user = await User.create({
        username: 'test',
        passHash: 'xxxx',
        email: 'test@test.com'
    });

    try{
        let accs = await Promise.all([
            Account.create({
                userId: user.id,
                label: 'test1'
            }),
            Account.create({
                userId: user.id,
                label: 'test2'
            })
        ]);

        let accs2 = await user.getAccounts();


        return Promise.all([
            TempAddress.create({
                userId: user.id,
                accountId: accs[0].id,
                encryptedPrivateKey: 'sasaa',
                nanoAddress: 'asas'
            }),
            TempAddress.create({
                userId: user.id,
                accountId: accs[0].id,
                encryptedPrivateKey: 'asasa',
                nanoAddress: 'asasasasas'
            })
        ])
        .then(() => {
            return accs[0].getTempAddresses()
            .then((tempAddresses) => {
                if (tempAddresses.length != 2)
                    return false;
                return true;
            })
            .catch((err) => {console.error(err); return false});
        })
        .catch((err) => {console.error(err); return false});

    }catch(err) {
        console.error(err);
        return false;
    }
}

