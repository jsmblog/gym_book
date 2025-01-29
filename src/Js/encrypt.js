import CryptoJS from "crypto-js";
import {CUSTOM_KEY} from '../FirebaseEnv/firebaseEnv.js'
const encryptText = (message)=> {
    const text = CryptoJS.AES.encrypt(message,CUSTOM_KEY).toString();
    return text;
}
export default encryptText