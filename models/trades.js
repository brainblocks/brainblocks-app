/* @flow */
import Sequelize from 'sequelize';

class Trades extends Sequelize.Model {
    static init (sequelize : Object, DataTypes : Object) : Sequelize.Model {
        return super.init(
            {
                userId:  DataTypes.INTEGER,
                tradeId: DataTypes.STRING,
                from:    DataTypes.STRING,
                to:      DataTypes.STRING
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false
            }
        );
    }

    static associate(models : Object) {
        this.user = this.belongsTo(models.User, { foreignKey: 'userId' });
    }
}

export default Trades;
