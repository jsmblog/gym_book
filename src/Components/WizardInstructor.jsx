import React, { useState } from "react";
import { db } from "../ConfigFirebase/config.js";
import "../Styles/stylesWizardInstructor.css";
import { specialties, modalities } from '../Js/instructor.js';
import is_am_or_pm from "../Js/pm_am.js";
import payments from "../Js/payments.js";
import LoaderSuccess from "./LoaderSuccess.jsx";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { getDownloadURL,ref, uploadBytes } from 'firebase/storage';
import {AUTH_USER,STORAGE} from '../ConfigFirebase/config.js'
import formatDate from '../Js/formatDate.js';
import convertToWebP from '../Js/convertToWebp.js';
import { collection, doc, getFirestore, setDoc } from 'firebase/firestore';

const MODES = ["presencial", "online", "hibrido"];

const WizardInstructor = React.memo(({instructorData }) => {
    const { paymentMethodsList, plans, paymentTypes } = payments;
    const [loaderMessageSuccess, setLoaderMessageSuccess] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        ...instructorData,
        p_i: { // professionalInfo
            s: [], // specialties
            exp: "", // experienceYears
            c: [], // certifications
            b: "", // bio
            p_m:[]
        },
        avb: { // availability
            d: [],
            schedules: [],
            m: [], // mode
        },
        s_l: {
            wh: '',
            fb: '',
            tk: '',
            ig: '',
            yt: '',
            lk: ''
        },
    });
    const [newSchedule, setNewSchedule] = useState({
        d: [],
        schedules: []
    });

    console.log(formData)
    console.log(instructorData)

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleNext = () => setStep((prev) => prev + 1);
    const handlePrev = () => setStep((prev) => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            
            alert("Registro completado");
        } catch (error) {
            console.error("Error al guardar:", error);
        }
    };

    const handleDaySelection = (day) => {
        setNewSchedule((prev) => ({
            ...prev,
            d: prev.d.includes(day) ? prev.d.filter((d) => d !== day) : [...prev.d, day],
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

            return { ...prevData.p_i, p_m: updatedMethods };
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

            <div className="step" id="step-1">
                <h3>Información Profesional</h3>
                <select
                    id="select-specialties"
                    multiple
                    name="specialties"
                    onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        if (selected.length <= 3) {
                            setFormData(prev => ({
                                ...prev,
                                p_i: { ...prev.p_i, s: selected }
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
                    name="experienceYears"
                    placeholder="Años de experiencia"
                    className="input-field"
                    min={0}
                    onChange={handleChange}
                />
                <textarea
                    name="bio"
                    maxLength={255}
                    placeholder="Descríbete en una breve biografía"
                    className="input-field"
                    onChange={handleChange}
                />
            </div>
        ),
        (
            <div className="step" id="step-2">
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
                            checked={formData.avb?.m.includes(mode)}
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
        ), (
            <div className="step" id="step-3">
                <div className="methods_payment">
                    <h4>Métodos de pago aceptados:</h4>
                    {paymentMethodsList.map((method, index) => (
                        <div key={index}>
                            <label htmlFor={`payment-${method}`}>
                                {method}
                                <input
                                    type="checkbox"
                                    id={`payment-${method}`}
                                    checked={formData.p_i.p_m?.includes(method)}
                                    onChange={() => handlePaymentChange(method)}
                                />
                            </label>
                        </div>
                    ))}
                </div>

                <div className="rrss-links">
                    <label>Redes sociales (opcional)</label>
                    <input type="url" name="wh" placeholder="WhatsApp: https://wa.me/123456789" value={formData.s_l.wh} onChange={handleChange} />
                    <input type="url" name="fb" placeholder="Facebook: https://www.facebook.com/mi-perfil" value={formData.s_l.fb} onChange={handleChange} />
                    <input type="url" name="tk" placeholder="TikTok: https://www.tiktok.com/@mi-perfil" value={formData.s_l.tk} onChange={handleChange} />
                    <input type="url" name="ig" placeholder="Instagram: https://www.instagram.com/mi-perfil" value={formData.s_l.ig} onChange={handleChange} />
                    <input type="url" name="lk" placeholder="Instagram: https://www.linkedIn.com/mi-perfil" value={formData.s_l.lk} onChange={handleChange} />
                    <input type="url" name="yt" placeholder="Instagram: https://www.youtube.com/mi-perfil" value={formData.s_l.yt} onChange={handleChange} />
                </div>
            </div>
        )
    ]

    return (
        <>
            <div className="wizard-container">
                <h2 className="wizard-title">Registro de Instructor</h2>
                <span className="current-step"> {`${step} / ${steps?.length}`} </span>
                <form onSubmit={handleSubmit}>
                    {steps[step - 1]}
                    <div className="navigation-buttons">
                        {step > 1 && <button type="button" onClick={handlePrev}>Volver</button>}
                        {step < steps.length ? (
                            <button type="button" className="back-blue-dark" onClick={handleNext}>Siguiente</button>
                        ) : (
                            <button type="submit" className="back-blue-dark">{loaderMessageSuccess ? "Registrando..." : "Guardar y registrar"}</button>
                        )}
                    </div>
                </form>
            </div>
            <LoaderSuccess loaderMessageSuccess={loaderMessageSuccess} text={'Espere un momento'} />
        </>
    );
});

export default WizardInstructor;
