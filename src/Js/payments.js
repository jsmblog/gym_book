const paymentMethodsList = ['Tarjeta de crédito', 'Tarjeta de débito', 'Transferencia bancaria','Efectivo'];
const plans = [
  { id: "basic", name: "Básico" } ,
  { id: "intermediate", name: "Intermedio" },
  { id: "premium", name: "Premium" },
];

const paymentTypes = [
  { id: "diario", name: "Diario" },
  { id: "mensualidad", name: "Mensualidad" },
  { id: "anualidad", name: "Anualidad" },
  { id: "trimestral", name: "Trimestral" },
  { id: "Semestral", name: "Semestral" },
];

export default {
    paymentMethodsList,
    plans,
    paymentTypes
}