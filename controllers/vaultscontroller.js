/* @flow */
import models from '../models';
import SuccessResponse from '../responses/success_response';
import ErrorResponse from '../responses/error_response';

const { Vault } = models.models;

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

    
}
