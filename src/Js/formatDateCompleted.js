const formatDateCompleted = (fecha) => {
    if (fecha) {
      const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
      return fechaObj.toLocaleString([], {
        weekday: 'short', // Día de la semana en formato largo (ej: "lunes")
        day: '2-digit', // Día del mes en formato de dos dígitos (ej: "01")
        month: 'short', // Mes en formato largo (ej: "enero")
        year: 'numeric', // Año en formato numérico (ej: "2024")
        hour: '2-digit', // Hora en formato de dos dígitos (ej: "09")
        minute: '2-digit', // Minuto en formato de dos dígitos (ej: "05")
        second: '2-digit', // Segundo en formato de dos dígitos (ej: "02")
      });
    }
    return "";
  };
  
  export default formatDateCompleted;
  