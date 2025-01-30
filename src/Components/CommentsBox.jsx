import React, { useState } from "react";
import "../Styles/stylesCommentsBox.css";
import iconImage from "/image.png";
import iconEmptyComments from "/conjunto-vacio.png";
import { db } from "../ConfigFirebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import useMessage from "../Hooks/useMessage";
import DisplayMessage from "./DisplayMessage";
import uuid from "../Js/uuid";
import formatDate from "../Js/formatDate";
import encrypt from "../Js/encrypt";
import decrypt from "../Js/decrypt";
const CommentsBox = React.memo(({ publication, setIsOnBoxComments, currentUser ,ownerId }) => {
    const [comment, setComment] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, messageError] = useMessage();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const maxSize = 50 * 1024 * 1024
        if (file.size > maxSize) {
            messageError("El archivo es demasiado grande");
            return;
        }
        setImage(file);
    };
    const clearInputs = () => {
        setComment("");
        setImage(null);
        setLoading(false);
        setIsOnBoxComments(false)
    }
    const createdComment = async () => {
        if (!comment.trim() && !image) {
            messageError("El comentario no puede estar vacío.");
            return;
        }

        setLoading(true);

        try {
            const docRef = doc(db, "USERS", ownerId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                console.error("User document not found!");
                return;
            }

            const userData = docSnap.data();
            const posts = userData.posts || [];
            const createdAt = new Date().toISOString()

            const newComment = {
                id: uuid(35),
                t: encrypt(comment), // text-comment
                img: image ? URL.createObjectURL(image) : null,
                c_a:createdAt,
                n: encrypt(currentUser.name),
                p_u: encrypt(currentUser.imageProfile)
            };

            const updatedPosts = posts.map((p) => {
                if (p.post_id === publication.post_id) {
                    return {
                        ...p,
                        comments: p.comments ? [...p.comments, newComment] : [newComment],
                    };
                }
                messageError("Comentario agregado con éxito!");
                return p;
            });

            await updateDoc(docRef, { posts: updatedPosts });
        } catch (error) {
            console.error("Error al agregar el comentario:", error.message);
            setLoading(false);
        }
        clearInputs();
    };

    return (
        <>
            <section className="commentsBox">
                <div className="commentsBox__header slide-in-bottom">
                    <h2>
                        {`${publication?.comments?.length} ${publication?.comments?.length === 1 ? "comentario" : "comentarios"
                            }`}
                    </h2>

                    <div className="commentsBox__header__comments">
                        {publication?.comments?.length > 0 ? (
                            <div className="commentsBox__header__comments__list">
                                {publication.comments.map((c, index) => (
                                    <div key={index} className="comment">
                                        <div className="comment__avatar"> 
                                        <img src={decrypt(c.p_u)} alt={c.n} />
                                        <h5>{decrypt(c.name)}</h5>
                                        </div>
                                        <div className="comment__text">
                                        <p>{decrypt(c.t)}</p>
                                        {c.img && <img src={c.img} alt="Comentario" />}
                                        </div>
                                        <small className="createdAt_comment">{formatDate(c.c_a)}</small>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="commentsBox__empty">
                                <img src={iconEmptyComments} width={120} alt="" />
                                <h3 className="message_empty_comments">Sé el primero en comentar</h3>
                            </div>
                        )}
                    </div>

                    <div className="commentsBox__actions">
                        <label className="commentsBox__actions__label">
                            <input
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                type="text"
                                maxLength={255}
                                placeholder="Comenta aquí..."
                            />
                        </label>
                        <label htmlFor="fileUpload">
                            <img src={iconImage} width={20} alt="Subir imagen" />
                            <input style={{ display: 'none' }} type="file" onChange={handleFileChange} accept="image/*,video/*" hidden id="fileUpload" />
                        </label>
                        <button onClick={createdComment} className="back-blue-dark" disabled={loading}>
                            {loading ? "comentando..." : "Comentar"}
                        </button>
                    </div>

                    <button onClick={() => setIsOnBoxComments(false)} className="close_comments_box">
                        X
                    </button>
                </div>
            </section>
            <DisplayMessage message={message} />
        </>
    );
});

export default CommentsBox;
