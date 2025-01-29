const controlPassword = (password) => {
    const pass = password.length;
    return pass <= 2 ? "Está contraseña no parece ser segura..." : pass <= 5 ? "¡ Tú contraseña sigue siendo insegura !" : pass <= 7 ? "Tú contraseña es un 75% segura..." : pass >= 8 ? "¡ Contraseña segura , comisariato cleymer te felicita !" : "La contraseña debe tener minímo 8 caracteres";
}
export default controlPassword;