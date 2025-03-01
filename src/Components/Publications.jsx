import React, { useState } from "react";
import "../Styles/stylesPublications.css";
import decrypt from "../Js/decrypt";
import sliceText from "../Js/sliceText";
import formatDate from "./../Js/formatDate";
import iconHeart from "/heart.webp";
import iconHeartRed from "/amor.webp";
import iconShare from "/share.webp";
import iconComment from "/comment.webp";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "../ConfigFirebase/config";
import useMessage from "../Hooks/useMessage";
import DisplayMessage from "./DisplayMessage";
import uuid from './../Js/uuid';
import encrypt from "../Js/encrypt";
import CommentsBox from "./CommentsBox";
import { useNavigate } from "react-router-dom";
import formatDateCompleted from "../Js/formatDateCompleted";
const COUNT = 10
const Publications = React.memo(({ users, currentUser, allUsers }) => {
  const [visibleCount, setVisibleCount] = useState(COUNT);
  const navigate = useNavigate();
  const [isOnBoxComments, setIsOnBoxComments] = useState(false)
  const [message, messageError] = useMessage();
  const [currentComments, setCurrentComments] = useState([]);
  const [ownerId, setOwnerId] = useState('');
  const showMorePublications = () => {
    const nextCount = visibleCount + COUNT;

    if (nextCount <= users.length) {
      setVisibleCount(nextCount);
    } else {
      setVisibleCount(users.length);
    }
  };

  const visiblePublications = users.slice(0, visibleCount);

  const handleLiked = async (post, userId) => {
    try {
      // Se busca en el contexto la información actualizada del usuario cuyo documento se va a actualizar
      const userData = allUsers.find((u) => u.uid === userId);
      if (!userData) {
        console.error("User document not found in context!");
        return;
      }
      const posts = userData.posts || [];
      const timeStampLike = new Date().toISOString();
      // Nota: Si la intención es registrar el like del usuario actual, se podría usar currentUser.uid;
      // sin embargo, se mantiene userId para respetar la lógica original.
      const userLiked = {
        id: userId,
        c: formatDate(timeStampLike),
        n: currentUser.name,
        p: currentUser.imageProfile,
      };
  
      // Se actualiza el post correspondiente
      const updatedPosts = posts.map((p) => {
        if (p.post_id === post.post_id) {
          const hasLiked = p.likes?.some((like) => like.id === userId);
          if (hasLiked) {
            messageError("¡Ya diste like a esta publicación!");
            return p;
          }
          const updatedLikes = p.likes ? [...p.likes, userLiked] : [userLiked];
          messageError("Me gusta enviado con éxito");
          return { ...p, likes: updatedLikes };
        }
        return p;
      });
  
      // Se actualiza el documento en Firestore con el array de posts modificado
      const docRef = doc(db, "USERS", userId);
      await updateDoc(docRef, { p: updatedPosts });
    } catch (error) {
      console.error("Error liking the post:", error.message);
    }
  };
  
  const handleShared = async (post, userId) => {
    try {
      if (currentUser?.uid === userId) {
        messageError("No puedes compartir tu propia publicación");
        return;
      }
      // Se obtienen los datos actualizados del propietario y del usuario actual desde el contexto
      const ownerData = allUsers.find((u) => u.uid === userId);
      const currentUserData = allUsers.find((u) => u.uid === currentUser.uid);
      if (!ownerData) {
        console.error("Owner document not found in context!");
        return;
      }
      if (!currentUserData) {
        console.error("Current user document not found in context!");
        return;
      }
  
      // Se verifica si el usuario actual ya compartió la publicación
      const hasShared = currentUserData.posts.some(
        (p) => p.post_id === post.post_id && p.i_sh
      );
      if (hasShared) {
        messageError("¡Ya compartiste esta publicación!");
        return;
      }
      const createdAt = new Date().toISOString();
      const sharedPost = {
        c_a: createdAt,
        d: post.d || "",
        s: "",
        m: post.m || [],
        l: post.l || "",
        post_id: uuid(35),
        i_sh: true,
        likes: [],
        comments: [],
        shared: [],
      };
  
      // Se agrega la publicación compartida al array de posts del usuario actual
      const updatedCurrentUserPosts = [...(currentUserData.posts || []), sharedPost];
      const docRefCurrentUser = doc(db, "USERS", currentUser.uid);
      await updateDoc(docRefCurrentUser, { p: updatedCurrentUserPosts });
  
      const timeStampShare = new Date().toISOString();
      const user = {
        id: currentUser.uid,
        c: formatDate(timeStampShare),
        n: encrypt(currentUser.name),
        p: encrypt(currentUser.imageProfile),
      };
  
      // Se actualiza el post en el documento del propietario, agregando el usuario que compartió
      const updatedOwnerPosts = (ownerData.posts || []).map((p) => {
        if (p.post_id === post.post_id) {
          const updatedShared = p.shared ? [...p.shared, user] : [user];
          return { ...p, shared: updatedShared };
        }
        return p;
      });
      const docRefOwner = doc(db, "USERS", userId);
      await updateDoc(docRefOwner, { p: updatedOwnerPosts });
  
      messageError("¡Publicación compartida con éxito!");
    } catch (error) {
      console.error("Error sharing the post:", error.message);
    }
  };  

  const handleComments = async (comments, uidOwner) => {
    setIsOnBoxComments(!isOnBoxComments)
    setCurrentComments(comments);
    setOwnerId(uidOwner)
  }

  const navigateToPerfilUserSelected = async (user) => {
    try {
      if (!user) {
        messageError("Error: usuario no definido");
        return;
      }
  
      const { rol, ownerId, paid, s = [] } = user;
      const timeStamp = new Date().toISOString();
  
      if (paid.i_p && (rol === "owner" || rol === "instructor") && currentUser.rol === "user") {
        const refOwner = doc(db, "USERS", ownerId);
  
        const hasVisitedPerfil = s.some((v) => v.id === currentUser.uid);
  
        if (!hasVisitedPerfil) {
          const calculatedAge = new Date().getFullYear() - new Date(currentUser.birth).getFullYear();
  
          const visitorData = {
            c: formatDateCompleted(timeStamp),         // Fecha de la primera visita
            id: currentUser.uid,             // ID del usuario visitante
            n: currentUser.name,             // Nombre
            p: currentUser.imageProfile,      // Foto
            pr: currentUser.province,        // Provincia
            g: currentUser.gender,           // Género
            t: currentUser.numberTelf,       // Teléfono
            b: calculatedAge,                // Edad
            v: {
              c: 1,                          // Contador de visitas
              l: formatDateCompleted(timeStamp), // Última vez visitado
            },
          };
  
          await updateDoc(refOwner, {
            s: arrayUnion(visitorData),
          });
        } else {
          const updatedVisitors = s.map((visitor) =>
            visitor.id === currentUser.uid
              ? {
                  ...visitor,
                  v: {
                    c: (visitor.v?.c ?? 0) + 1,
                    l: formatDateCompleted(timeStamp),
                  },
                }
              : visitor
          );
  
          await updateDoc(refOwner, { s: updatedVisitors });
        }
      }
  
      const userSelected = allUsers.find((u) => u.uid === ownerId);
      navigate(`/perfil/${ownerId}`, { state: userSelected || null });
  
    } catch (error) {
      messageError("Ha ocurrido un error inesperado.");
    }
  };
  
  return (
    <>
      <section id="sect-publications">
        <div className="container-publications">
          {visiblePublications?.map((user) => (
            <div key={user.post.post_id} style={{ border: user.rol === 'owner' ? '1px solid #818080' : '' }} className="publication">
              <div className="publication-header">
                <div>
                  <img onClick={() => navigateToPerfilUserSelected(user)} src={user.ownerPhoto} alt={user.owner} />
                  <p className="name-navigate" onClick={() => navigateToPerfilUserSelected(user)}><h4 id="name_gym">{user.name_gym || ''}</h4> {user.rol === 'instructor' ? 'Instr :' : ''} {user.owner}</p>
                  {user.post?.s && (
                    <span id="sentiment-user">{`se siente ${user.post?.s}`}</span>
                  )}
                </div>
                <span>{formatDate(user.post?.c_a)}</span>
              </div>
              <p className="libre-Baskerville paragrahp">{decrypt(user.post?.d) || ""}</p>
              {user.post?.m?.length > 0 &&
                <div className="publication-media">
                  {user.post?.m?.map((media, index) => (
                    media.t === "image" ? (
                      <img className="width-media" key={index} src={media.f} alt={`publicación creada por ${user.owner}`} />
                    ) : (
                      <video className="width-media" key={index} muted controls>
                        <source src={media.f} type="video/mp4" />
                        Tu navegador no soporta la reproducción de videos.
                      </video>
                    )
                  ))}
                </div>
              }
              <a
                id="link-user"
                href={decrypt(user.post?.l)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {sliceText(decrypt(user.post?.l), 25)}
              </a>
              {user.post.i_sh && <h6 id="isShared">publicación compartida</h6>}
              <div className="reactions">
                <button onClick={() => handleLiked(user.post, user.ownerId)}>
                  <img src={user.post?.likes?.some(like => like.id === user.ownerId) ? iconHeartRed : iconHeart} alt="like" />
                  <span>{user.post?.likes?.length}</span>
                </button>
                <button onClick={() => handleComments(user.post, user.ownerId)} >
                  <img src={iconComment} alt="comment" />
                  <span>{user.post?.comments?.length}</span>
                </button>
                <button onClick={() => handleShared(user.post, user.ownerId)}>
                  <img src={iconShare} alt="share" />
                  <span>{user.post?.shared?.length}</span>
                </button>
              </div>
            </div>
          ))}

        </div>
        <div id="btn-filter">
          {visiblePublications.length === 0 && (
            <p className="no-publications-message">
              No hay publicaciones disponibles.
            </p>
          )}
          {visibleCount < users.length && (
            <button onClick={showMorePublications} className="btn-show-more fade-in">
              Filtrar más publicaciones ⟳
            </button>
          )}
        </div>
      </section>
      {
        isOnBoxComments && (
          <CommentsBox ownerId={ownerId} publication={currentComments} setIsOnBoxComments={setIsOnBoxComments} currentUser={currentUser} />
        )
      }
      <DisplayMessage message={message} />
    </>
  );
});

export default Publications;
