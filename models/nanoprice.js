/* @flow */
import Sequelize from 'sequelize';

class NanoPrice extends Sequelize.Model {
    static init (sequelize : Object, DataTypes : Object) : Sequelize.Model {
        return super.init(
            {
                usd: DataTypes.DOUBLE
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false
            }
        );
    }
}

export default NanoPrice;
