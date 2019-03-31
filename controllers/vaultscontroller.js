/* @flow */
import models from '../models';
import SuccessResponse from '../responses/success_response';
import ErrorResponse from '../responses/error_response';

import crypto from 'crypto';

const { Vault, PINKey } = models.models;
const Op = models.Sequelize.Op

export default class {

    static async get (req : Object, res : Object) : Promise<void> {
        let user = req.user;
        let success = new SuccessResponse(res);
        let error = new ErrorResponse(res);

        let vault : Object | void;
        try {
            vault = await user.getVault();
            success.send({
                vault: vault.toJSON()
            });
        } catch (err) {
            console.error(`No vault found for user ${ user.id }`, err);
            return error.notFound('No vault found');
        }
    }

    static async create(req : Object, res : Object) : Promise<void> {
        let user = req.user;
        let success = new SuccessResponse(res);
        let error = new ErrorResponse(res);
        let vault = await user.getVault();

        if (vault) {
            return error.badRequest('This user already has a vault');
        }

        const create = {
            userId:       user.id,
            wallet:       req.body.wallet,
            walletBackup: req.body.wallet
        };
        vault = await Vault.create(create);

        if (vault) {
            success.send({
                vault: vault.toJSON()
            });
        } else {
            error.notFound();
        }
    }

    static async update(req : Object, res : Object) : Promise<void> {
        let user = req.user;
        let success = new SuccessResponse(res);
        let error = new ErrorResponse(res);
        let vault = await user.getVault();
        let wallet = req.body.wallet;

        if (!vault) {
            return error.notFound('No vault found');
        }

        // wallet is the only editable field
        if (!wallet) {
            error.badRequest('Invalid parameters');
        }

        vault.wallet = wallet;

        try {
            vault.save({ fields: [ 'wallet' ] });
            success.send({
                vault: vault.toJSON()
            });
        } catch (err) {
            console.error('Error updating vault', err);
            error.send('Error updating vault');
        }
    }

    static async getNewPINKey(req : Object, res : Object) : Object {
        let user = req.user;
        let PIN = req.body.PIN;
        let key = crypto.randomBytes(32).toString('hex');

        let pinKey = await PINKey.findOne({
            where: {
                userId: user.id,
                sessionId: req.token.id,
                PIN
            }
        });

        if (pinKey) {
            // already exists a key for this session under this PIN, update it and return it
            pinKey.expires = new Date(Date.now() + 30 * 60 * 1000);
            pinKey.key = key;
            pinKey.save();
            return success.send({
                PIN: pinKey.PIN,
                key: pinKey.key
            });
        }

        // doesnt exist, create one
        PINKey.create({
            userId: user.id,
            PIN,
            key,
            sessionId: req.token.id
        }).then((pinkey) => {
            success.send({
                PIN: pinKey.PIN,
                key: pinKey.key
            });
        }).catch((err) => {
            console.error('Error generating pinKey ', err);
            error.send('Error generating pinKey');
        });

    }

    static async getPINKey(req : Object, res : Object) : Object {
        let user = req.user;

        let where = {
            userId: user.id,
            sessionId: req.token.id,
            expires: {
                [Op.gt]: new Date()
            }
        };

        if (req.body.PIN) {
            where.PIN = req.body.PIN;
        }

        // not searching by pin code too because it is not needed if session is not older than 30 minutes
        let pinKeys = await PINKey.findAll({
            where: {
                userId: user.id,
                sessionId: req.token.id,
                expires: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (pinKeys.length == 0) {
            return error.notFound('No active pinKeys found');
        }

        // if session is not older than 30 minutes return key without checking pin, unless it's in the request
        let ret = [];
        let formatted = {};
        for (pinKey of pinKeys) {
            formatted[pinKey.PIN] = {
                key: pinKey.key,
                PIN: pinKey.PIN
            };
        }

        if (req.body.PIN) {
            return success.send({ [req.body.PIN]: formatted[PIN] });
        } else {
            // return all pins
            return success.send(formatted);
        }
    }

    
}
