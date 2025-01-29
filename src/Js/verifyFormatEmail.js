const verifyFormatEmail =(email) => {
    return !/\S+@\S+\.\S+/.test(email);
}
export default verifyFormatEmail ;