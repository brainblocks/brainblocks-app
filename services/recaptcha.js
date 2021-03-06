/* @flow */
import axios from 'axios';

export default class Recaptcha {
    static async verify(recaptcha : string) : Promise<boolean> {
        try {
            const { data } = await axios({
                method:  'post',
                url:     'https://www.google.com/recaptcha/api/siteverify',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                },
                params: {
                    secret:   process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
                    response: recaptcha
                }
            });

            if (!data.success) {
                return false;
            }
        } catch (err) {
            return false;
        }
        return true;
    }
}
