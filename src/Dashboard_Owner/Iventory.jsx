import React, { useEffect, useState } from 'react';
import fakeInventory from './Js/fakeInventory';
import { useLocation } from 'react-router-dom';
import optionsForms from './Js/optionsForm'
import useMessage from './../Hooks/useMessage';
import DisplayMessage from './../Components/DisplayMessage';
import {db} from '../ConfigFirebase/config.js'
import { arrayUnion, doc, setDoc } from 'firebase/firestore';
import uuid from './../Js/uuid';

const Iventory = React.memo(({ currentUserData }) => {
    // Estados para el formulario de agregar producto
    const [productName, setProductName] = useState('');
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('')
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [useLocation, setUseLocation] = useState('')
    const [status, setStatus] = useState('')
    const {gymProductCategories,gymProductStatus,gymProductLocations} = optionsForms || {} ;
    const [showAddProductForm, setShowAddProductForm] = useState(false);
    const [date, setDate] = useState('')
    const [inventory, setInventory] = useState([]);
    const [inventorySearchQuery, setInventorySearchQuery] = useState('');
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [currentInventoryPage, setCurrentInventoryPage] = useState(1);
    const [saving, setSaving] = useState(false);
    const inventoryItemsPerPage = 1;

    const [message,messageError] = useMessage();
    console.log(currentUserData)
    useEffect(() => {
        setInventory(fakeInventory);
        setFilteredInventory(fakeInventory);
    }, []);

    useEffect(() => {
        const filtered = inventory.filter(item =>
            item.product.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(inventorySearchQuery.toLowerCase())
        );
        setFilteredInventory(filtered);
        setCurrentInventoryPage(1);
    }, [inventorySearchQuery, inventory]);

    // Cálculos para la paginación
    const indexOfLastInventory = currentInventoryPage * inventoryItemsPerPage;
    const indexOfFirstInventory = indexOfLastInventory - inventoryItemsPerPage;
    const currentInventoryItems = currentUserData.paid?.i_p ? currentUserData.inv.slice(indexOfFirstInventory, indexOfLastInventory) : 
     filteredInventory.slice(indexOfFirstInventory, indexOfLastInventory);
    const currentInventory = currentUserData.paid?.i_p ? currentUserData.inv.length : filteredInventory.length
    const totalInventoryPages = Math.ceil( currentInventory / inventoryItemsPerPage);
    const resetForm = () => {
        setProductName('');
            setCategory('');
            setBrand('');
            setQuantity('');
            setPrice('');
            setUseLocation('');
            setStatus('');
            setDate('');
            setShowAddProductForm(false);
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        if (!productName || !category || !brand || !quantity || !price || !useLocation || !status){ 
            messageError("Complete los campos");
            setSaving(false);
            return};
        const newProduct = {
            i: uuid(5),
            p: productName,
            c:category,
            b:brand,
            q: Number(quantity),
            pr: Number(price),
            l: useLocation,
            s:status,
            d: date,
        };
        try {
            const docRef = doc(db, 'USERS',currentUserData?.uid)
            await setDoc(docRef,{inv:arrayUnion(newProduct)},{ merge: true });
            messageError("¡¡ Exito !!");
            setSaving(false);
            resetForm();
        } catch (error) {
            console.error('Error al guardar:', error);
            messageError("Sucedió un error , intentalo nuevamente");
        }
        setSaving(false);
    };


    return (
        <>
            <section className="users-management">
                <div className="table-header">
                    <h2 className='libre-Baskerville'>Gestión de Inventario {!currentUserData.paid?.i_p && '(ejemplo)'} </h2>
                    <div className="header-actions">
                        <input
                            type="text"
                            placeholder="Buscar por producto o categoría..."
                            value={inventorySearchQuery}
                            onChange={(e) => setInventorySearchQuery(e.target.value)}
                        />
                        {
                            currentUserData.paid?.i_p ? <button className="back-blue-dark" onClick={() => setShowAddProductForm(true)}>
                                Agregar
                            </button> : <button className="back-blue-dark">Susbríbete a un plan</button>
                        }
                    </div>
                </div>

                {showAddProductForm && (
                <form onSubmit={handleSubmit} className="add-user-form fade-in">
                    <div className="form-group"><label>Producto:</label><input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} required /></div>
                    <div className="form-group"><label>Categoría:</label><select value={category} onChange={(e) => setCategory(e.target.value)} required><option disabled>--Selecciona una categoría--</option>{gymProductCategories.map((c, index) => (<option key={index}>{c}</option>))}</select></div>
                    <div className="form-group"><label>Marca:</label><input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required /></div>
                    <div className="form-group"><label>Cantidad:</label><input type="number" min='0' value={quantity} onChange={(e) => setQuantity(e.target.value)} required /></div>
                    <div className="form-group"><label>Fecha de adquisición:</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
                    <div className="form-group"><label>Costo de adquisición:</label><input type="number" step="0.01" min='0' value={price} onChange={(e) => setPrice(e.target.value)} required /></div>
                    <div className="form-group"><label>Ubicación:</label><select value={useLocation} onChange={(e) => setUseLocation(e.target.value)} required><option disabled>--Seleccione una ubicación--</option>{gymProductLocations.map((l, index) => (<option key={index}>{l}</option>))}</select></div>
                    <div className="form-group"><label>Estado:</label><select value={status} onChange={(e) => setStatus(e.target.value)} required><option disabled>--Seleccione un estado--</option>{gymProductStatus.map((s, index) => (<option key={index}>{s}</option>))}</select></div>
                    <div className="form-actions"><button type="submit" className="btn-submit back-blue-dark" disabled={saving}>{saving ? 'Guardando...' : 'Hecho ✅'}</button></div>
                    <button type="button" className="btn-delete" onClick={() => {
                        setShowAddProductForm(false)
                        resetForm()
                    }}>X</button>
                </form>
            )}
                {
                    currentUserData.paid?.i_p ? <div className="table-container-admin">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Producto</th>
                                    <th>Marca</th>
                                    <th>Categoría</th>
                                    <th>Fecha de Adquisición</th>
                                    <th>Ubicación</th>
                                    <th>Estado</th>
                                    <th>Cantidad</th>
                                    <th>Costo de Adquisición</th>
                                    <th>Total</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    currentUserData?.inv.length > 0 && (
                                        currentUserData.inv.map((p)=>(
                                            <tr key={p.i}>
                                    <td>{p.i}</td>
                                    <td>{p.p}</td>
                                    <td>{p.b}</td>
                                    <td>{p.c}</td>
                                    <td>{p.d}</td>
                                    <td>{p.l}</td>
                                    <td>{p.s}</td>
                                    <td>{p.q}</td>
                                    <td>{p.pr}</td>
                                    <td>$ {p.q * p.pr}</td>
                                    <td className="td-actions">
                        <button className="btn-edit">🖋️</button>
                        <button className="btn-delete">🗑️</button>
                      </td>
                                </tr>
                                        ))
                                    )
                                }
                            </tbody>
                        </table>
                    </div> : <div className="table-container-admin">
                        <table className="users-table">
                            <thead>
                                <tr>
                                <th>ID</th>
                                    <th>Producto</th>
                                    <th>Marca</th>
                                    <th>Categoría</th>
                                    <th>Fecha de Adquisición</th>
                                    <th>Estado</th>
                                    <th>Cantidad</th>
                                    <th>Costo de Adquisición</th>
                                    <th>Total</th>
                                    <th>Ubicación</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentInventoryItems.length > 0 ? (
                                    currentInventoryItems.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td>{item.product}</td>
                                            <td>{item.brand}</td>
                                            <td>{item.category}</td>
                                            <td>{item.lastUpdated}</td>
                                            <td>{item.location}</td>
                                            <td>{item.status}</td>
                                            <td>{item.quantity}</td>
                                            <td>${item.price}</td>
                                            <td>${item.quantity * item.price}</td>
                                            <td className="td-actions">
                                                <button className="btn-edit">🖋️</button>
                                                <button className="btn-delete">🗑️</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="no-results">No se encontraron productos</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                }
                <div className="pagination">
                    <button
                        onClick={() => setCurrentInventoryPage(currentInventoryPage - 1)}
                        disabled={currentInventoryPage === 1}
                    >
                        Anterior
                    </button>
                    {Array.from({ length: totalInventoryPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setCurrentInventoryPage(i + 1)}
                            className={currentInventoryPage === i + 1 ? 'active' : ''}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentInventoryPage(currentInventoryPage + 1)}
                        disabled={currentInventoryPage === totalInventoryPages}
                    >
                        Siguiente
                    </button>
                </div>
            </section>
            <DisplayMessage message={message} />
        </>
    );
});

export default Iventory;
