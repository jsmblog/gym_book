import React, { useState } from 'react';
import '../Styles/stylesWizard.css';

const GymOwnerWizard = () => {
  // Estados para almacenar los datos del formulario
  const [gymData, setGymData] = useState({
    gymType: '',
    description: '',
    hours: '',
    maxMembers: '',
    services: '',
    paymentMethods: '',
    membershipPlans: '',
    socialMediaLinks: '',
    gallery: [],
    trainerCertifications: '',
    healthSafety: '',
    cancellationPolicy: '',
    promotions: '',
    equipmentBrands: '',
    preferredLanguage: '',
  });

  // Estado de paso actual
  const [step, setStep] = useState(1);

  // Función para manejar el cambio de valor en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGymData({
      ...gymData,
      [name]: value,
    });
  };

  // Función para manejar la galería de imágenes
  const handleFileChange = (e) => {
    setGymData({
      ...gymData,
      gallery: [...gymData.gallery, ...e.target.files],
    });
  };

  // Función para ir al siguiente paso
  const nextStep = () => setStep(step + 1);

  // Función para ir al paso anterior
  const prevStep = () => setStep(step - 1);

  // Función para manejar el envío del formulario
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(gymData);
  };

  // Estructura de los pasos
  const steps = [
    (
      <div className="step">
        <label>Tipo de gimnasio:</label>
        <input type="text" name="gymType" value={gymData.gymType} onChange={handleInputChange} />

        <label>Descripción del gimnasio:</label>
        <textarea name="description" value={gymData.description} onChange={handleInputChange} />

      </div>
    ),
    (
      <div className="step">
        <label>Horario de funcionamiento:</label>
        <input type="text" name="hours" value={gymData.hours} onChange={handleInputChange} />

        <label>Capacidad máxima de miembros:</label>
        <input type="number" name="maxMembers" value={gymData.maxMembers} onChange={handleInputChange} />
      </div>
    ),
    (
      <div className="step">
        <label>Servicios ofrecidos:</label>
        <textarea name="services" value={gymData.services} onChange={handleInputChange} />

        <label>Métodos de pago:</label>
        <input type="text" name="paymentMethods" value={gymData.paymentMethods} onChange={handleInputChange} />
      </div>
    ),
    (
      <div className="step">
        <label>Planes de membresía y precios:</label>
        <textarea name="membershipPlans" value={gymData.membershipPlans} onChange={handleInputChange} />

        <label>Redes sociales y enlaces web:</label>
        <input type="text" name="socialMediaLinks" value={gymData.socialMediaLinks} onChange={handleInputChange} />
      </div>
    ),
    (
      <div className="step">
        <label>Fotos o galería de imágenes:</label>
        <input type="file" multiple onChange={handleFileChange} />

        <label>Certificación de entrenadores:</label>
        <input type="text" name="trainerCertifications" value={gymData.trainerCertifications} onChange={handleInputChange} />
      </div>
    ),
    (
      <div className="step">
        <label>Política de salud y seguridad:</label>
        <textarea name="healthSafety" value={gymData.healthSafety} onChange={handleInputChange} />

        <label>Condiciones de cancelación o reembolsos:</label>
        <textarea name="cancellationPolicy" value={gymData.cancellationPolicy} onChange={handleInputChange} />
      </div>
    ),
    (
      <div className="step">
        <label>Promociones o descuentos especiales:</label>
        <textarea name="promotions" value={gymData.promotions} onChange={handleInputChange} />
      </div>
    )
  ];

  return (
    <div className="wizard-container">
      <h2 className='merriweather-bold'>Complete los siguientes campos</h2>
      <form onSubmit={handleSubmit}>
        {steps[step - 1]} 
        <div className="navigation-buttons">
          {step > 1 && (
            <button type="button" onClick={prevStep}>Volver</button>
          )}
          {step < steps.length ? (
            <button className='back-blue-dark' type="button" onClick={nextStep}>Siguiente</button>
          ) : (
            <button className='back-blue-dark' type="submit">Guardar Información</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default GymOwnerWizard;
