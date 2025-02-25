import React, { useState } from 'react';
import '../Styles/stylesPost.css';
import iconLaugh from '/laugh.webp';
import iconLink from '/link.webp';
import iconImage from '/image.webp';
import useMessage from './../Hooks/useMessage';
import sentimentalStates from '../Js/sentimentalStates';
import sliceText from './../Js/sliceText';
import DisplayMessage from './DisplayMessage';
import validateUrl from './../Js/validateUrl';
import { db, STORAGE } from '../ConfigFirebase/config.js';
import uuid from './../Js/uuid';
import { setDoc, doc, arrayUnion } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import encrypt from './../Js/encrypt';
import convertToWebP from '../Js/convertToWebp.js';

const Post = React.memo(({ currentUser }) => {
  const { name, imageProfile, isOnline, uid } = currentUser || {};
  const [message, messageError] = useMessage();
  const [popupType, setPopupType] = useState(null);
  const [selectedSentiment, setSelectedSentiment] = useState("");
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [link, setLink] = useState("");
  const [textPublish, setTextPublish] = useState('');
  const [isCreatedPublish, setIsCreatedPublish] = useState(false);
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const IMAGE_MAX_SIZE = 3 * 1024 * 1024; // 3 MB
  const VIDEO_MAX_SIZE = 10 * 1024 * 1024; // 10 MB

  const isValidFile = (file) => {
    if (file.type.startsWith("image/")) {
      if (file.size > IMAGE_MAX_SIZE) {
        messageError("La imagen supera el tamaño máximo de 3MB");
        return false;
      }
    } else if (file.type.startsWith("video/")) {
      if (file.size > VIDEO_MAX_SIZE) {
        messageError("El video supera el tamaño máximo de 10MB");
        return false;
      }
    } else {
      messageError("Solo se permiten archivos de imagen o video");
      return false;
    }
    return true;
  };

  const handleValidation = () => {
    if (!textPublish.trim() && !files.length) {
      messageError('Añade contenido multimedia o texto');
      setIsCreatedPublish(false);
      return false;
    }
    if (link && !validateUrl(link)) {
      messageError('La URL no es válida, por favor introduce una URL correcta');
      setIsCreatedPublish(false);
      setLink('');
      return false;
    }
    return true;
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => isValidFile(file));
    if (validFiles.length + files.length > 2) {
      messageError('Solo se permiten 2 archivos');
      return;
    }
    setFiles((prevFiles) => [...prevFiles, ...validFiles].slice(0, 2));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleRemoveFile = (fileToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
  };

  const handleAddLink = () => {
    setPopupType("link");
  };

  const handleAddSentiment = () => {
    setPopupType("sentiment");
  };

  const clearInputs = () => {
    setTextPublish('');
    setFiles([]);
    setLink('');
    setSelectedSentiment('');
  };

  const compressVideoBackend = async (file) => {
    const formData = new FormData();
    formData.append("video", file);
    const response = await fetch("https://compress-service-656742567649.us-central1.run.app/compress", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al comprimir el video: ${errorText}`);
    }
    const data = await response.json();
    return data.url; // URL pública del video comprimido
  };

  // Función para subir imágenes (ya que se procesan en el frontend)
  const uploadFileWithProgress = (processedFile, fileIndex, totalFiles) => {
    return new Promise((resolve, reject) => {
      const fileRef = ref(STORAGE, `posts/${uid}/${uuid(15)}`);
      const uploadTask = uploadBytesResumable(fileRef, processedFile);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progressCurrent = snapshot.bytesTransferred / snapshot.totalBytes;
          const overallProgress = ((fileIndex + progressCurrent) / totalFiles) * 100;
          setUploadProgress(Math.round(overallProgress));
        },
        (error) => {
          console.error("Error en la carga:", error);
          reject(error);
        },
        async () => {
          try {
            const fileURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(fileURL);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  };

  const handleAddContent = async () => {
    setIsCreatedPublish(true);
    setLoadingModalVisible(true);
    setUploadProgress(0);
    try {
      if (handleValidation()) {
        const docRef = doc(db, "USERS", uid);
        const uploadedFiles = [];
        const totalFiles = files.length;
        for (let i = 0; i < totalFiles; i++) {
          const file = files[i];
          if (file.type.startsWith("image/")) {
            const processedFile = await convertToWebP(file);
            const fileURL = await uploadFileWithProgress(processedFile, i, totalFiles);
            uploadedFiles.push({
              f: fileURL,
              t: "image"
            });
          } else if (file.type.startsWith("video/")) {
            // Envía el video al backend para que se comprima y suba a GCS
            const videoUrl = await compressVideoBackend(file);
            uploadedFiles.push({
              f: videoUrl,
              t: "video"
            });
          }
        }
        const createdAt = new Date().toISOString();
        const post_id = uuid(30);
        const objectPost = {
          d: textPublish ? encrypt(textPublish) : '',
          m: uploadedFiles,
          l: link ? encrypt(link) : '',
          s: selectedSentiment ? encrypt(selectedSentiment) : '',
          c_a: createdAt,
          post_id,
          likes: [],
          comments: [],
          shared: [],
          i_sh: false
        };
        await setDoc(docRef, { posts: arrayUnion(objectPost) }, { merge: true });
        setIsCreatedPublish(false);
        messageError("Publicación creada exitosamente 😄");
      }
    } catch (error) {
      console.error(error);
      setIsCreatedPublish(false);
      messageError("Error al crear la publicación");
    }
    clearInputs();
    setLoadingModalVisible(false);
    setUploadProgress(0);
  };

  return (
    <>
      <main id='main-post'>
        {currentUser && (
          <div className="post">
            <section className="post__header">
              <img id='photo-profile' src={imageProfile} alt={name} />
              <div id='isOnline' style={{ backgroundColor: isOnline ? 'greenyellow' : 'red' }}></div>
              {selectedSentiment && <h5>{`Me siento ${selectedSentiment}`}</h5>}
            </section>
            <section className="post__content">
              <textarea placeholder={`Escribe aquí ${name}...`} id="textarea-post" maxLength={255} value={textPublish} onChange={(e) => setTextPublish(e.target.value)} />
              <div id='cont-icons-actions' className='btns-for-create-publish'>
                <button onClick={handleAddSentiment}><img src={iconLaugh} title="Añadir estado sentimental" alt="" /></button>
                <button onClick={handleAddLink}><img src={iconLink} title="Añadir enlace" alt="" />{link && "✅"}</button>
                <button onClick={() => setPopupType('image')}>
                  <img src={iconImage} title="Añadir multimedia" alt="" />{files.length > 0 ? files.length : ''}
                </button>
                <button className='back-blue-dark' onClick={handleAddContent}>
                  <h5 id='text-btn'>{isCreatedPublish ? 'Subiendo publicación...' : 'Crear Publicación'}</h5>
                </button>
              </div>
            </section>
          </div>
        )}
        {popupType === "sentiment" && (
          <div className="popup-overlay">
            <div className="popup-content">
              <select className='link' onChange={(e) => setSelectedSentiment(e.target.value)} value={selectedSentiment}>
                <option value="">Selecciona un estado sentimental</option>
                {sentimentalStates.map((state, index) => (
                  <option key={index} value={state}>{state}</option>
                ))}
              </select>
              <button onClick={() => setPopupType(null)}>X</button>
            </div>
          </div>
        )}
        {popupType === "link" && (
          <div className="popup-overlay">
            <div className="popup-content">
              <input className='link' type="text" placeholder="Ingresa un enlace" onChange={(e) => setLink(e.target.value)} value={link} />
              <button onClick={() => setPopupType(null)}>X</button>
            </div>
          </div>
        )}
        {popupType === "image" && (
          <div className="popup-overlay">
            <div className="popup-content">
              <div className={`drag-drop-area ${dragging ? 'dragging' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleFileDrop}>
                {files.length === 0 ? (
                  <label id="add-photo-product" htmlFor="inputImageProduct" className={dragging ? 'dragging' : ''}>
                    {dragging ? '¡ Suelta el archivo aquí !' : <p>Selecciona o <span id='message-drop-span'>arrastra y suelta</span></p>}
                    <input
                      style={{ display: 'none' }}
                      type="file"
                      accept="image/*,video/*"
                      id="inputImageProduct"
                      multiple
                      onChange={(e) => {
                        const selectedFiles = Array.from(e.target.files).filter(isValidFile);
                        setFiles(prevFiles => [...prevFiles, ...selectedFiles].slice(0, 2));
                      }}
                    />
                  </label>
                ) : (
                  files.slice(0, 2).map((file, index) => (
                    <div key={index} className="file-preview">
                      {file.type.startsWith("image/") ? (
                        <img id='photo-preview' src={URL.createObjectURL(file)} alt="" />
                      ) : (
                        <video id='photo-preview' src={URL.createObjectURL(file)} controls muted />
                      )}
                      <p>{sliceText(file.name, 10)}</p>
                      <button onClick={() => handleRemoveFile(file)}>Eliminar</button>
                    </div>
                  ))
                )}
              </div>
              <h6>{dragging ? '¡Suelta el archivo!' : 'Arrastra y suelta 1 o 2 imágenes o videos'}</h6>
              <button onClick={() => setPopupType(null)}>X</button>
            </div>
          </div>
        )}
      </main>
      {loadingModalVisible && (
        <div className="loading-modal">
          <div className="loading-modal-content">
            <h2>Subiendo publicación...</h2>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p>{uploadProgress}%</p>
          </div>
        </div>
      )}
      <DisplayMessage message={message} />
    </>
  );
});

export default Post;
