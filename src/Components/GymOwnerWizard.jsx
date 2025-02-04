import React, { useState } from 'react';
import '../Styles/stylesWizard.css';
import gymTypes from '../Js/gymTypes';
import useMessage from '../Hooks/useMessage';
import DisplayMessage from './DisplayMessage';
import payments from '../Js/payments.js'
import LoaderSuccess from './LoaderSuccess.jsx';
import convertToWebP from '../Js/convertToWebp.js';
import { db } from '../ConfigFirebase/config.js';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { getDownloadURL,ref, uploadBytes } from 'firebase/storage';
import {AUTH_USER,STORAGE} from '../ConfigFirebase/config.js'
import { collection, doc, getFirestore, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import decrypt from './../Js/decrypt';
import encrypt from '../Js/encrypt.js';
import is_am_or_pm from '../Js/pm_am.js';
const GymOwnerWizard = React.memo(({infoPrincipalGym}) => {
  const navigate = useNavigate();
  const { paymentMethodsList, plans, paymentTypes } = payments;
  const [message, messageError] = useMessage()
  const [selectedPlan, setSelectedPlan] = useState("");
  const [loaderMessageSuccess, setLoaderMessageSuccess] = useState(false);
  const [price, setPrice] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [gymData, setGymData] = useState({
    g_t: '', // gym type
    des: '', // description
    m_m: '', // max members
    h: [], // hours
    p_m: [], // payment methods
    m_p: [], // membership plans
    s_l: { 
      wh: '',
      fb: '',
      tk: '',
      ig: ''
    }, // social media links
  });
  console.log(infoPrincipalGym)
  console.log(gymData)

  const [step, setStep] = useState(1);
  const [newSchedule, setNewSchedule] = useState({
    d: [], // Días seleccionados
    schedules: [] // Lista de horarios [{on: "06:00", off: "12:00"}, {on: "13:00", off: "21:00"}]
  });
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoaderMessageSuccess(true);
    const hasEmptyFields = Object.entries(gymData).some(([key, value]) => {
      if (key === "des" || key === "s_l") return false;
      
      if (Array.isArray(value)) {
        return value.length === 0; 
      }
      return !value; 
    });
    
    try {
      const {address,name,nameGym,email,imageProfile,createAccount,userRole,password,province,isOnline,numberTelf,emailVerified} = infoPrincipalGym || {};
      const userCredential = await createUserWithEmailAndPassword(AUTH_USER, email, decrypt(password));
      const userId = userCredential.user.uid;
  
      await updateProfile(userCredential.user, {
        displayName: name,
      });
      await sendEmailVerification(userCredential.user);
  
      const webpImage = await convertToWebP(imageProfile);
      const storageRef = ref(STORAGE, `profileImgOwner/${userId}/image.webp`);
      await uploadBytes(storageRef, webpImage);
      const downloadUrl = await getDownloadURL(storageRef);  
      const userDoc = {
        n: encrypt(name), // name -> n
        n_g :encrypt(nameGym),
        e: encrypt(email), // email -> e
        img: encrypt(downloadUrl), // imageProfile -> img
        c_a:createAccount, // createAccount -> c_a
        rol: userRole, // userRole -> rol
        uid: userId,
        pro: encrypt(province), // province -> prov
        dir: encrypt(address) ,
        on: isOnline, // isOnline -> on
        tel: encrypt(numberTelf), // numberTelf -> tel
        v: emailVerified, // emailVerified -> v
        posts: [],
        gymData: gymData,
      };
  
      const collectionUsers = collection(db, "USERS");
      await setDoc(doc(collectionUsers, userId), userDoc, { merge: true });
      navigate("/area-de-espera", { replace: true });
      setLoaderMessageSuccess(false);
  
    } catch (error) {
      console.error("Error al registrar usuario:", error.message);
      messageError("No se pudo registrar el usuario. Inténtalo de nuevo.");
    }
  };
  
  // Manejar cambios en inputs generales
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGymData({
      ...gymData,
      [name]: value,
    });
  };

  // Manejar cambios en las redes sociales
  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setGymData({
      ...gymData,
      s_l: {
        ...gymData.s_l,
        [name]: value
      }
    });
  };

  // Manejar selección de métodos de pago
  const handlePaymentChange = (method) => {
    setGymData((prevData) => {
      const updatedMethods = prevData.p_m.includes(method)
        ? prevData.p_m.filter((m) => m !== method)
        : [...prevData.p_m, method];

      return { ...prevData, p_m: updatedMethods };
    });
  };

  // Manejar planes de membresía
  
  const addMembershipPlan = () => {
    if ((gymData.m_p?.length || 0) >= 3) {
      messageError("Solo se pueden agregar 3 planes de membresía");
      return;
    }
    if (selectedPlan && price && paymentType) {
      setGymData((prevData) => ({
        ...prevData, 
        m_p: [
          ...prevData.m_p,
          { plan: selectedPlan, pr: `$${price}`, pay:paymentType },
        ],
      }));      
      setSelectedPlan("");
      setPrice("");
      setPaymentType("");
    }
  };

  const removeMembershipPlan = (index) => {
    setGymData((prevData) => ({
      ...prevData, 
      m_p: prevData.m_p.filter((_, i) => i !== index),
    }));
  };
  const handleDaySelection = (day) => {
    setNewSchedule((prev) => ({
      ...prev,
      d: prev.d.includes(day)
        ? prev.d.filter((d) => d !== day) // Si ya está, lo eliminamos
        : [...prev.d, day] // Si no está, lo agregamos
    }));
  };
  
  const handleTimeChange = (field, value, index) => {
    const updatedSchedules = [...newSchedule.schedules];
    updatedSchedules[index][field] = value;
    setNewSchedule((prev) => ({ ...prev, schedules: updatedSchedules }));
  };
  
  const addSchedule = () => {
    if (newSchedule.d.length === 0 || newSchedule.schedules.length === 0) return;
  
    setGymData((prev) => ({
      ...prev,
      h: [...prev.h, { d: [...newSchedule.d], schedules: [...newSchedule.schedules] }]
    }));
  
    // Reiniciamos el formulario
    setNewSchedule({ d: [], schedules: [] });
  };
  
  const addTimeSlot = () => {
    setNewSchedule((prev) => ({
      ...prev,
      schedules: [...prev.schedules, { on: "", off: "" }]
    }));
  };
  
  const removeSchedule = (index) => {
    setGymData((prev) => ({
      ...prev,
      h: prev.h.filter((_, i) => i !== index)
    }));
  };
  const steps = [
    (
      <div className="step">
        <label>Tipo de gimnasio:</label>
        <select name="g_t" onChange={handleInputChange}>
          <option disabled>Elegir tipo</option>
          {gymTypes.map((type, index) => (
            <option key={index} value={type}>{type}</option>
          ))}
        </select>

        <label>Descripción del gimnasio:</label>
        <textarea name="des" maxLength={200} placeholder="¡Describe tu gimnasio! (Opcional)" value={gymData.des} onChange={handleInputChange} />

        <label>Capacidad máxima de miembros:</label>
        <input type="number" name="m_m" min="0" placeholder="Ejemplo: 100" value={gymData.m_m} onChange={handleInputChange} />

      </div>
    ),
    (
      <div className="step">
  <div className="schedule-container">
    <label>Horario de funcionamiento:</label>
    <div className="schedule">
      <div className="day-selection">
        {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day) => (
          <label key={day}>
            <input type="checkbox" checked={newSchedule.d.includes(day)} onChange={() => handleDaySelection(day)} />
            {day}
          </label>
        ))}
      </div>

      <div className="schedule-row">
        {newSchedule.schedules.map((timeSlot, index) => (
          <div key={index} className="time-slot">
            <input
              type="time"
              value={timeSlot.on}
              onChange={(e) => handleTimeChange("on", e.target.value, index)}
            />
            -
            <input
              type="time"
              value={timeSlot.off}
              onChange={(e) => handleTimeChange("off", e.target.value, index)}
            />
          </div>
        ))}
        <button type="button" onClick={addTimeSlot} className="add-time-slot">➕ Agregar horario</button>
      </div>

      <button type="button" className="btn-save-shedule" onClick={addSchedule} disabled={gymData.h.length >= 3}>
        Hecho ✅
      </button>
    </div>

    <div>
      <table id="table_wizard">
        <thead>
          <tr>
            <th>Días</th>
            <th>Horarios</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {gymData.h.map((hour, index) => (
            <tr key={index}>
              <td>{hour.d.join(", ")}</td>
              <td>
                {hour.schedules.map((s, i) => (
                  <div key={i}>{`${s.on} ${is_am_or_pm(s.on)} - ${s.off} ${is_am_or_pm(s.off)}`}</div>
                ))}
              </td>
              <td>
                <button className="delete_schedule" type="button" onClick={() => removeSchedule(index)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
    ),
    (
      <div className="step">
        <div className="methods_payment">
          <h4>Métodos de pago aceptados:</h4>
          {paymentMethodsList.map((method, index) => (
            <div key={index}>
              <label htmlFor={`payment-${method}`}>
                {method}
                <input
                  type="checkbox"
                  id={`payment-${method}`}
                  checked={gymData.p_m.includes(method)}
                  onChange={() => handlePaymentChange(method)}
                />
              </label>
            </div>
          ))}
        </div>
      </div>
    ),
    (
      <div className="step">
        <div className="schedule-container">
          <label>Planes de membresía y precios:</label>
          <div className="schedule schedule_plans">
            <div id='plans-inputs'>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              aria-label="Selecciona un plan predefinido"
            >
              <option value="">Seleccionar plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.name}>
                  {plan.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              id='amount-to-pay'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Cantidad a pagar"
              min="0"
              aria-label="Cantidad a pagar por membresía"
            />

            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              aria-label="Selecciona el tipo de pago"
            >
              <option value="">Seleccionar tipo de pago</option>
              {paymentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            </div>
            <button
              type="button"
              className='btn-add-plans back-blue-dark'
              onClick={addMembershipPlan}
              disabled={(gymData.m_p?.length || 0) >= 3 || !selectedPlan || !price || !paymentType}
              aria-disabled={(gymData.m_p?.length || 0) >= 3 || !selectedPlan || !price || !paymentType}
            >
              Agregar
            </button>
          </div>
          <table id='table_wizard'>
            <thead>
              <tr>
                <th>Tipo de plan</th>
                <th>Precio</th>
                <th>Tipo de pago</th>
                <th>Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {gymData.m_p.map((plan, index) => (
                <tr key={index}>
                  <td>{plan.plan}</td>
                  <td>{plan.pr}</td>
                  <td>{plan.pay}</td>
                  <td><button className='delete_shedule' type="button" onClick={() => removeMembershipPlan(index)}>❌</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rrss-links">
          <label>Redes sociales (opcional)</label>
          <input type="url" name="wh" placeholder="WhatsApp: https://wa.me/123456789" value={gymData.s_l.wh} onChange={handleSocialMediaChange} />
          <input type="url" name="fb" placeholder="Facebook: https://www.facebook.com/TuGimnasio" value={gymData.s_l.fb} onChange={handleSocialMediaChange} />
          <input type="url" name="tk" placeholder="TikTok: https://www.tiktok.com/@TuGimnasio" value={gymData.s_l.tk} onChange={handleSocialMediaChange} />
          <input type="url" name="ig" placeholder="Instagram: https://www.instagram.com/TuGimnasio" value={gymData.s_l.ig} onChange={handleSocialMediaChange} />
        </div>
      </div>
    )
  ];

  return (
    <>
      <div className="wizard-container">
        <div>
          <h2 className="merriweather-bold">Rellene los campos solicitados para continuar.</h2>
        </div>
          <span className="current-step"> {`${step} / ${steps?.length}`} </span>
        <form onSubmit={handleSubmit}>
          {steps[step - 1]}
          <div className="navigation-buttons">
            {step > 1 && <button type="button" onClick={() => setStep(step - 1)}>Volver</button>}
            {step < steps.length ? (
              <button type="button" className="back-blue-dark" onClick={() => setStep(step + 1)}>Siguiente</button>
            ) : (
              <button type="submit" className="back-blue-dark">{loaderMessageSuccess ? "Registrando..." :"Guardar y registrar"}</button>
            )}
          </div>
        </form>
      </div>
      <DisplayMessage message={message} />
      <LoaderSuccess loaderMessageSuccess={loaderMessageSuccess} text={'Espere un momento'} />
    </>
  );
})

export default GymOwnerWizard;
