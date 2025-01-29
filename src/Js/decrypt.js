import CryptoJS from "crypto-js";
import {CUSTOM_KEY} from '../FirebaseEnv/firebaseEnv.js'
const decrypt = (message)=>{
    try{
const bytes = CryptoJS.AES.decrypt(message,CUSTOM_KEY);
const returnToText = bytes.toString(CryptoJS.enc.Utf8);
return returnToText ;
    }catch(error){
console.log(error)
    }
}
export default decrypt;