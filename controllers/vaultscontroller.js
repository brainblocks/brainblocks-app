/* @flow */
import crypto from 'crypto';

import models from '../models';
import SuccessResponse from '../responses/success_response';
import ErrorResponse from '../responses/error_response';

const { Vault, PINKey } = models.models;
const Op = models.Sequelize.Op;

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

    static async createPINKey(req : Object, res : Object) : Object {
        let success = new SuccessResponse(res);
        let error = new ErrorResponse(res);
        let user = req.user;
        let PIN = req.body.PIN;
        let key = crypto.randomBytes(32).toString('hex');

        let pinKey = await PINKey.findOne({
            where: {
                userId:    user.id,
                sessionId: req.token.id,
                PIN
            }
        });

        if (pinKey) {
            // already exists a key for this session under this PIN, update it and return it
            pinKey.expires = new Date((Date.now() + 30) * 60 * 1000);
            pinKey.key = key;
            pinKey.save();
            return success.send({
                PIN: pinKey.PIN,
                key: pinKey.key
            });
        }

        // doesnt exist, create one
        PINKey.create({
            userId:    user.id,
            PIN,
            key,
            sessionId: req.token.id
        }).then((newPinKey) => {
            success.send({
                PIN: newPinKey.PIN,
                key: newPinKey.key
            });
        }).catch((err) => {
            console.error('Error generating pinKey ', err);
            error.send('Error generating pinKey');
        });

    }

    static async getPINKey(req : Object, res : Object) : Object {
        let success = new SuccessResponse(res);
        let error = new ErrorResponse(res);
        let user = req.user;

        let where = {
            userId:    user.id,
            sessionId: req.token.id,
            PIN:       null,
            expires:   {
                [Op.gt]: new Date()
            }
        };

        if (req.params.PIN) {
            where.PIN = req.params.PIN;
        }

        let pinKeys = await PINKey.findAll({
            where
        });

        if (pinKeys.length === 0) {
            return error.notFound('No active pinKeys found');
        }

        let formatted = {};
        for (let pinKey of pinKeys) {
            formatted[pinKey.PIN] = {
                key: pinKey.key,
                PIN: pinKey.PIN
            };
        }

        if (req.params.PIN) {
            return success.send({ pinKeys: formatted });
        } else {
            // return all pins if session is not older than 30 minutes
            if ((req.token.createdAt.getTime() + 30) * 60 * 1000 > Date.now()) {
                return success.send({ pinKeys: formatted });
            }
            return error.badRequest('PIN code is missing or session is older than 30 minutes.');
        }
    }
}
