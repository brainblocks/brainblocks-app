/* @flow */
import Sequelize from 'sequelize';

class LoginLog extends Sequelize.Model {
    static init (sequelize : Object, DataTypes : Object) : Sequelize.Model {
        return super.init(
            {
                userId:       DataTypes.INTEGER,
                success:      DataTypes.BOOLEAN,
                failReason:   DataTypes.STRING,
                attemptCount: DataTypes.INTEGER,
                ip:           DataTypes.STRING,
                requestData:  DataTypes.STRING
            },
            {
                sequelize,
                timestamps:  true,
                underscored: false
            }
        );
    }
}

export default LoginLog;
