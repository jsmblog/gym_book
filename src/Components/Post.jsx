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
import { db, STORAGE } from '../ConfigFirebase/config.js'
import uuid from './../Js/uuid';
import { setDoc, doc, arrayUnion } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import encrypt from './../Js/encrypt';
import convertToWebP from '../Js/convertToWebp.js';
const Post = React.memo(({ currentUser }) => {
  const { name, imageProfile, isOnline, uid } = currentUser || null;
  const [message, messageError] = useMessage();
  const [popupType, setPopupType] = useState(null);
  const [selectedSentiment, setSelectedSentiment] = useState("");
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [link, setLink] = useState("");
  const [textPublish, setTextPublish] = useState('');
  const [isCreatedPublish, setIsCreatedPublish] = useState(false)

  const handleValidation = () => {
    if (!textPublish.trim() && !files.length) {
      messageError('Añade contenido multimedia o texto');
      setIsCreatedPublish(false)
      return;
    }
    if (link) {
      if (!validateUrl(link)) {
        messageError('La URL no es válida, por favor introduce una URL correcta');
        setIsCreatedPublish(false)
        setLink('')
        return;
      }
    }
    return true;
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const minSize = 1024 * 1024 * 10;
    const validFiles = droppedFiles.filter((file) => {
      const type = file.type.split('/')[0];
      return (type === 'image' || type === 'video');
    });

    if (validFiles.length + files.length > 2) {
      messageError('Solo se permiten 2 archivos');
      return;
    }
    const oversizedFiles = validFiles.filter((file) => file.size < minSize);

    setFiles((prevFiles) => {
      const newFiles = [...prevFiles, ...oversizedFiles].slice(0, 2);
      return newFiles;
    });
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
  }

  const handleAddContent = async () => {
    setIsCreatedPublish(true);
    try {
      if (handleValidation()) {
        const docRef = doc(db, "USERS", uid);
        const uploadedFiles = [];
  
        for (const file of files) {
          const fileRef = ref(STORAGE, `posts/${uid}/${uuid(15)}`);
          let imageConvert = file;
          
          if (file.type.startsWith("image/")) {
            imageConvert = await convertToWebP(file);
          }
  
          const snapshot = await uploadBytes(fileRef, imageConvert);
          const fileURL = await getDownloadURL(snapshot.ref);
          
          uploadedFiles.push({
            f: fileURL,
            t: file.type.startsWith("image/") ? "image" : "video"
          });
        }
  
        const createdAt = new Date().toISOString();
        const post_id = uuid(30);
        const objectPost = {
          d: textPublish ? encrypt(textPublish) : '',
          m: uploadedFiles || [],  
          l: link ? encrypt(link) : '',
          s: selectedSentiment ? encrypt(selectedSentiment) : '',
          c_a: createdAt,
          post_id,
          likes: [],
          comments: [],
          shared: [],
          i_sh: false
        };
  
        await setDoc(docRef, {
          posts: arrayUnion(objectPost)
        }, { merge: true });
  
        setIsCreatedPublish(false);
        messageError("Publicación creada exitosamente 😄");
      }
    } catch (error) {
      console.log(error.message);
    }
    clearInputs();
  };
  
  return (
    <>
      <main id='main-post'>
        {currentUser && (
          <div className="post">
            <section className="post__header">
              <img id='photo-profile' src={imageProfile} alt="" />
              <div id='isOnline' style={{ backgroundColor: isOnline ? 'greenyellow' : 'red' }}></div>
              {
                selectedSentiment && <h5>{`Me siento ${selectedSentiment}`}</h5>
              }
            </section>
            <section className="post__content">
              <textarea
                placeholder={`Escribe aquí ${name}...`}
                id="textarea-post"
                maxLength={255}
                value={textPublish}
                onChange={(e) => setTextPublish(e.target.value)}
              />
              <div id='cont-icons-actions' className='btns-for-create-publish'>
                <button onClick={handleAddSentiment}><img src={iconLaugh} title="Añadir estado sentimental" alt="" /></button>
                <button onClick={handleAddLink}><img src={iconLink} title="Añadir enlace" alt="" />{link && "✅"}</button>
                <button onClick={() => setPopupType('image')}><img src={iconImage} title="Añadir multimedia" alt="" />{files.length > 0 ? files.length : ''}</button>
                <button className='back-blue-dark' onClick={handleAddContent}><h5 id='text-btn'>{isCreatedPublish ? 'Subiendo publicación...' : 'Crear Publicación'}</h5></button>
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
              <input
                className='link'
                type="text"
                placeholder="Ingresa un enlace"
                onChange={(e) => setLink(e.target.value)}
                value={link}
              />
              <button onClick={() => setPopupType(null)}>X</button>
            </div>
          </div>
        )}

        {popupType === "image" && (
          <div className="popup-overlay">
            <div className="popup-content">
              <div
                className={`drag-drop-area ${dragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleFileDrop}
              >
                {files.length === 0 ? (
                  <label
                    id="add-photo-product"
                    htmlFor="inputImageProduct"
                    className={dragging ? 'dragging' : ''}
                  >
                    {dragging ? '¡ Suelta la imagen aquí !' : <p>Selecciona ó <span id='message-drop-span'>arrastra y suelta</span></p>}
                    <input
                      style={{ display: 'none' }}
                      type="file"
                      accept="image/*,video/*"
                      id="inputImageProduct"
                      multiple
                      onChange={(e) => {
                        const selectedFiles = Array.from(e.target.files);
                        const minSize = 1024 * 1024 * 10;
                        const oversizedFiles = selectedFiles.filter((file) => file.size < minSize);
                        if (oversizedFiles.length + files.length <= 2) {
                          setFiles(prevFiles => [...prevFiles, ...oversizedFiles].slice(0, 2));
                        }
                      }}
                    />
                  </label>
                ) : (
                  files.slice(0, 2).map((file, index) => (
                    <div key={index} className="file-preview">
                      <img id='photo-preview' src={URL.createObjectURL(file)} alt="" />
                      <p>{sliceText(file.name, 10)}</p>
                      <button onClick={() => handleRemoveFile(file)}>Eliminar</button>
                    </div>
                  ))
                )}
              </div>
              <h6>{dragging ? '¡Eso es, ahora suelta la imagen!' : 'Arrastra y suelta 1 o 2 imágenes o videos'}</h6>
              <button onClick={() => setPopupType(null)}>X</button>
            </div>
          </div>
        )}
      </main>
      <DisplayMessage message={message} />
    </>
  );
});

export default Post;
