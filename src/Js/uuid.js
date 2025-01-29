const uuid = (LENGTH) => {
    const options = 'abcdefghijklmnñopqrstuvwxyzABCDEFGHIFGHIJKLMNÑOPQRSTUVWXYZ0123456789#$%&=!¡';
    let uid = '';
    for (let i = 0; i < LENGTH; i++) {
        let indexRandom = Math.floor(Math.random() * options.length);
        uid += options[indexRandom] ;
        
    }
    return uid ;
    }
    export default uuid;