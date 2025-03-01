import React, { useState } from "react";
import "../Styles/stylesWizardInstructor.css";
import { specialties, modalities } from '../Js/instructor.js';
import is_am_or_pm from "../Js/pm_am.js";
import payments from "../Js/payments.js";
import LoaderSuccess from "./LoaderSuccess.jsx";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { AUTH_USER, STORAGE, db } from '../ConfigFirebase/config.js';
import formatDate from '../Js/formatDate.js';
import convertToWebP from '../Js/convertToWebp.js';
import { collection, doc, setDoc } from 'firebase/firestore';
import useMessage from "../Hooks/useMessage.js";
import DisplayMessage from "./DisplayMessage.jsx";
import { useNavigate } from "react-router-dom";
import decrypt from "../Js/decrypt.js";
import encrypt from "../Js/encrypt.js";

const MODES = ["presencial", "online", "hibrido"];

const WizardInstructor = React.memo(({ instructorData }) => {
  const { paymentMethodsList, plans, paymentTypes } = payments;
  const navigate = useNavigate();
  const [message, messageError] = useMessage();
  const [loaderMessageSuccess, setLoaderMessageSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    p_i: { // professionalInfo
      s: [],    // specialties
      exp: "",  // experienceYears
      bio: "",  // biografía
      p_m: [],  // payment methods
    },
    avb: { // availability
      schedules: [],
      m: [],  // modes: presencial, online, hibrido
    },
    s_l: { // social links
      wh: '',
      fb: '',
      tk: '',
      ig: '',
      yt: '',
      lk: '',
    },
  });
  const [newSchedule, setNewSchedule] = useState({
    d: [],
    schedules: []
  });

  console.log(formData);
  console.log(instructorData);

  const handleSectionChange = (section, e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [name]: value,
      },
    }));
  };

  // Para campos top-level (si llegara a haber)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => prev - 1);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoaderMessageSuccess(true);
    const { p_i, avb } = formData;

  if (
    !p_i.s.length ||
    !p_i.exp.trim() ||
    !p_i.bio.trim() ||
    !p_i.p_m.length
  ) {
    messageError("Complete todos los campos");
    setLoaderMessageSuccess(false);
    return;
  }

  if (
    !avb.schedules.length ||
    !avb.m.length
  ) {
    messageError("Complete todos los campos");
    setLoaderMessageSuccess(false);
    return;
  }
    try {
      const {
        name, email, imageProfile, createAccount, userRole, dateBirth,
        password, province, gender, isOnline, numberTelf, emailVerified , country
      } = instructorData || {};
      const userCredential = await createUserWithEmailAndPassword(AUTH_USER, email, decrypt(password));
      const userId = userCredential.user.uid;

      await updateProfile(userCredential.user, {
        displayName: name,
      });
      await sendEmailVerification(userCredential.user);

      const webpImage = await convertToWebP(imageProfile);
      const storageRef = ref(STORAGE, `profileImgInstructor/${userId}/image.webp`);
      await uploadBytes(storageRef, webpImage);
      const downloadUrl = await getDownloadURL(storageRef);
      const userDoc = {
        n: name,         // name -> n
        e: encrypt(email),        // email -> e
        i: downloadUrl,// imageProfile -> i
        ca: formatDate(createAccount), // createAccount -> ca
        r: userRole,            // userRole -> rol
        uid: userId,
        g: gender,
        c: country,   // country -> c
        pr: province,   // province -> prov
        b: dateBirth,
        on: isOnline,             // isOnline -> on
        t: numberTelf, // numberTelf -> tel
        v: emailVerified,         // emailVerified -> v
        p: [], // posts
        f_d:formData,
        u:[],
        paid:{i_p:false,t_p:'',d:''},
        s:[] // stadistics -> s
      };

      const collectionUsers = collection(db, "USERS");
      await setDoc(doc(collectionUsers, userId), userDoc, { merge: true });
      navigate("/area-de-espera", { replace: true });
      setLoaderMessageSuccess(false);

    } catch (error) {
      console.error("Error al registrar usuario:", error.message);
      messageError("No se pudo registrar el usuario. Inténtalo de nuevo.");
      setLoaderMessageSuccess(false);
    }
  };

  const handleDaySelection = (day) => {
    setNewSchedule((prev) => ({
      ...prev,
      d: prev.d.includes(day)
        ? prev.d.filter((d) => d !== day)
        : [...prev.d, day],
    }));
  };

  const handleTimeChange = (field, value, index) => {
    const updatedSchedules = [...newSchedule.schedules];
    updatedSchedules[index] = { ...updatedSchedules[index], [field]: value };
    setNewSchedule((prev) => ({ ...prev, schedules: updatedSchedules }));
  };

  const addSchedule = () => {
    if (newSchedule.d.length === 0 || newSchedule.schedules.length === 0) return;

    setFormData((prev) => ({
      ...prev,
      avb: {
        ...prev.avb,
        schedules: [...prev.avb.schedules, { d: [...newSchedule.d], schedules: [...newSchedule.schedules] }],
      },
    }));

    setNewSchedule({ d: [], schedules: [] });
  };

  const addTimeSlot = () => {
    setNewSchedule((prev) => ({
      ...prev,
      schedules: [...prev.schedules, { on: "", off: "" }],
    }));
  };

  const handlePaymentChange = (method) => {
    setFormData((prevData) => {
      const updatedMethods = prevData.p_i.p_m.includes(method)
        ? prevData.p_i.p_m.filter((m) => m !== method)
        : [...prevData.p_i.p_m, method];

      return {
        ...prevData,
        p_i: {
          ...prevData.p_i,
          p_m: updatedMethods,
        },
      };
    });
  };

  const removeSchedule = (index) => {
    setFormData((prev) => ({
      ...prev,
      avb: {
        ...prev.avb,
        schedules: prev.avb.schedules.filter((_, i) => i !== index),
      },
    }));
  };

  const handleModeSelection = (mode) => {
    setFormData((prev) => ({
      ...prev,
      avb: {
        ...prev.avb,
        m: prev.avb.m.includes(mode)
          ? prev.avb.m.filter((m) => m !== mode)
          : [...prev.avb.m, mode],
      },
    }));
  };

  const steps = [
    (
      <div className="step" id="step-1" key="step-1">
        <h3>Información Profesional</h3>
        <p>{`[ ${formData.p_i.s.join(" , ")} ]`}</p>
<select
  id="select-specialties"
  multiple
  name="s"
  onChange={(e) => {
    const selected = new Set([...formData.p_i.s, ...Array.from(e.target.selectedOptions, option => option.value)]);
    
    if (selected.size <= 3) { 
      setFormData(prev => ({
        ...prev,
        p_i: { ...prev.p_i, s: Array.from(selected) }
      }));
    }
  }}
>

          <option disabled>Seleccione una o más habilidades</option>
          {specialties.map((sp, index) => (
            <option key={index} value={sp}>
              {sp}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="exp"
          placeholder="Años de experiencia"
          className="input-field"
          min={0}
          onChange={(e) => handleSectionChange("p_i", e)}
        />
        <textarea
          name="bio"
          maxLength={255}
          placeholder="Descríbete en una breve biografía"
          className="input-field"
          onChange={(e) => handleSectionChange("p_i", e)}
        />
      </div>
    ),
    (
      <div className="step" id="step-2" key="step-2">
        <div className="schedule-container">
          <label>Horario de funcionamiento:</label>
          <div className="schedule">
            <div className="day-selection">
              {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day) => (
                <label key={day}>
                  <input
                    type="checkbox"
                    checked={newSchedule.d.includes(day)}
                    onChange={() => handleDaySelection(day)}
                  />
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
              <button type="button" onClick={addTimeSlot} className="add-time-slot">
                ➕ Agregar horario
              </button>
            </div>
            <button type="button" className="btn-save-schedule" onClick={addSchedule}>
              Hecho ✅
            </button>
            <div className="methods_payment">
              <h4>Modalidades de trabajo</h4>
              {MODES.map((mode) => (
                <label key={mode}>
                  <input
                    type="checkbox"
                    checked={formData.avb.m.includes(mode)}
                    onChange={() => handleModeSelection(mode)}
                  />
                  {mode}
                </label>
              ))}
            </div>
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
                {formData.avb.schedules.map((hour, index) => (
                  <tr key={index}>
                    <td>{hour.d.join(", ")}</td>
                    <td>
                      {hour.schedules.map((s, i) => (
                        <div key={i}>
                          {`${s.on} ${is_am_or_pm(s.on)} - ${s.off} ${is_am_or_pm(s.off)}`}
                        </div>
                      ))}
                    </td>
                    <td>
                      <button className="delete_schedule" type="button" onClick={() => removeSchedule(index)}>
                        ❌
                      </button>
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
      <div className="step" id="step-3" key="step-3">
        <div className="methods_payment">
          <h4>Métodos de pago aceptados:</h4>
          {paymentMethodsList.map((method, index) => (
            <div key={index}>
              <label htmlFor={`payment-${method}`}>
                {method}
                <input
                  type="checkbox"
                  id={`payment-${method}`}
                  checked={formData.p_i.p_m.includes(method)}
                  onChange={() => handlePaymentChange(method)}
                />
              </label>
            </div>
          ))}
        </div>
        <div className="rrss-links">
          <label>Redes sociales (opcional)</label>
          <input
            type="url"
            name="wh"
            placeholder="WhatsApp: https://wa.me/123456789"
            value={formData.s_l.wh}
            onChange={(e) => handleSectionChange("s_l", e)}
          />
          <input
            type="url"
            name="fb"
            placeholder="Facebook: https://www.facebook.com/mi-perfil"
            value={formData.s_l.fb}
            onChange={(e) => handleSectionChange("s_l", e)}
          />
          <input
            type="url"
            name="tk"
            placeholder="TikTok: https://www.tiktok.com/@mi-perfil"
            value={formData.s_l.tk}
            onChange={(e) => handleSectionChange("s_l", e)}
          />
          <input
            type="url"
            name="ig"
            placeholder="Instagram: https://www.instagram.com/mi-perfil"
            value={formData.s_l.ig}
            onChange={(e) => handleSectionChange("s_l", e)}
          />
          <input
            type="url"
            name="lk"
            placeholder="LinkedIn: https://www.linkedIn.com/mi-perfil"
            value={formData.s_l.lk}
            onChange={(e) => handleSectionChange("s_l", e)}
          />
          <input
            type="url"
            name="yt"
            placeholder="YouTube: https://www.youtube.com/mi-perfil"
            value={formData.s_l.yt}
            onChange={(e) => handleSectionChange("s_l", e)}
          />
        </div>
      </div>
    )
  ];

  return (
    <>
      <div className="wizard-container">
        <h2 className="wizard-title">Registro de Instructor</h2>
        <span className="current-step">{`${step} / ${steps.length}`}</span>
        <form onSubmit={handleSubmit}>
          {steps[step - 1]}
          <div className="navigation-buttons">
            {step > 1 && <button type="button" onClick={handlePrev}>Volver</button>}
            {step < steps.length ? (
              <button type="button" className="back-blue-dark" onClick={handleNext}>Siguiente</button>
            ) : (
              <button type="submit" className="back-blue-dark">
                {loaderMessageSuccess ? "Registrando..." : "Guardar y registrar"}
              </button>
            )}
          </div>
        </form>
      </div>
      <DisplayMessage message={message} />
      <LoaderSuccess loaderMessageSuccess={loaderMessageSuccess} text={'Espere un momento'} />
    </>
  );
});

export default WizardInstructor;
