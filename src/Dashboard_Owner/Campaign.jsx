import React, { useState } from 'react';
import useMessage from './../Hooks/useMessage';
import DisplayMessage from './../Components/DisplayMessage';

const Campaign = React.memo(() => {
  // Estados para el formulario
  const [campaignName, setCampaignName] = useState('');
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [segment, setSegment] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [message,messageError] = useMessage();
  const [isSending, setIsSending] = useState(false);
  
  const segments = [
    'Todos los clientes',
    'Clientes Activos',
    'Clientes Inactivos',
    'Clientes Premium'
  ];

  const resetForm = () => {
    setCampaignName('');
      setCampaignSubject('');
      setCampaignMessage('');
      setScheduledDate('');
      setSegment('');
      setAttachment(null);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    if (!campaignName || !campaignSubject || !campaignMessage || !scheduledDate || !segment) {
      messageError('Por favor, complete todos los campos obligatorios.');
      setIsSending(false);
      return;
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      messageError('La campaña se ha programado y enviado exitosamente.');
      
      resetForm();
    } catch (error) {
      messageError('Hubo un error al enviar la campaña, inténtelo nuevamente.');
    }
    
    setIsSending(false);
  };

  const handleAttachmentChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  return (
    <>
    <section className="campaigns-section">
      <h2 className='libre-Baskerville'>Crea campañas de email marketing</h2> 
      <p>
        Esta sección permite crear y gestionar campañas de email, promociones y notificaciones.
        Aquí podrás programar envíos masivos, segmentar clientes y personalizar tus mensajes.
      </p>
      <form className="campaign-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="campaignName">Nombre de la campaña:</label>
          <input
            type="text"
            id="campaignName"
            placeholder="Nombre de la campaña"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="campaignSubject">Asunto:</label>
          <input
            type="text"
            id="campaignSubject"
            placeholder="Asunto del email"
            value={campaignSubject}
            onChange={(e) => setCampaignSubject(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="campaignMessage">Mensaje:</label>
          <textarea
            id="campaignMessage"
            placeholder="Escribe el mensaje de la campaña"
            value={campaignMessage}
            onChange={(e) => setCampaignMessage(e.target.value)}
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="scheduledDate">Fecha y hora de envío:</label>
          <input
            type="datetime-local"
            id="scheduledDate"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="segment">Segmento de clientes:</label>
          <select
            id="segment"
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
          >
            <option value="">Seleccione un segmento</option>
            {segments.map((seg, index) => (
              <option key={index} value={seg}>
                {seg}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="attachment">Adjuntar archivo (opcional):</label>
          <input
            type="file"
            id="attachment"
            onChange={handleAttachmentChange}
          />
        </div>
        <button type="submit" className="back-blue-dark send-campaign" disabled={isSending}>
          {isSending ? 'Enviando...' : 'Enviar Campaña'}
        </button>
      </form>
    </section>
    <DisplayMessage message={message} />
    </>    
  );
});

export default Campaign;
