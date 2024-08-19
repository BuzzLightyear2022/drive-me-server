import { UserModel } from "../sql_setup.mjs";

export const checkMFASecretInDatabase = async (userId: string) => {
    const userData = await UserModel.findOne({ where: { id: userId } });

    if (userData?.dataValues.mfa_secret) {
        return true;
    } else {
        return false;
    }
}