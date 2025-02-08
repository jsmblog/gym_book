import React, { useEffect, useState } from 'react';
import fakeInventory from './Js/fakeInventory';
import optionsForms from './Js/optionsForm'
import useMessage from './../Hooks/useMessage';
import DisplayMessage from './../Components/DisplayMessage';
import { db } from '../ConfigFirebase/config.js'
import { arrayRemove, arrayUnion, doc, setDoc, updateDoc } from 'firebase/firestore';
import uuid from './../Js/uuid';

const Iventory = React.memo(({ currentUserData }) => {
    const [productName, setProductName] = useState('');
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('')
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [useLocation, setUseLocation] = useState('')
    const [status, setStatus] = useState('')
    const { gymProductCategories, gymProductStatus, gymProductLocations } = optionsForms || {};
    const [showAddProductForm, setShowAddProductForm] = useState(false);
    const [date, setDate] = useState('')
    const [inventory, setInventory] = useState([]);
    const [inventorySearchQuery, setInventorySearchQuery] = useState('');
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [currentInventoryPage, setCurrentInventoryPage] = useState(1);
    const [saving, setSaving] = useState(false);
    const [inventoryDates, setInventoryDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [categorySelected, setCategorySelected] = useState('');
    const inventoryItemsPerPage = 10;

    const [message, messageError] = useMessage();
    console.log(currentUserData)
    useEffect(() => {
        const userInventory = currentUserData.paid?.i_p ? currentUserData.inv : fakeInventory;
        setInventory(userInventory);
        setFilteredInventory(userInventory);

        const uniqueDates = [...new Set(userInventory.map(item => item.d))].filter(date => date);
        setInventoryDates(uniqueDates);
    }, [currentUserData]);

    useEffect(() => {
        let filtered = inventory;

        if (inventorySearchQuery) {
            filtered = filtered.filter(({ p, c }) =>
                p.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
                c.toLowerCase().includes(inventorySearchQuery.toLowerCase())
            );
        }
        if (selectedDate) {
            filtered = filtered.filter(item => item.d === selectedDate);
        }
        if(categorySelected){
            filtered = filtered.filter(item => item.c === categorySelected);
        }

        setFilteredInventory(filtered);
        setCurrentInventoryPage(1);
    }, [inventorySearchQuery, selectedDate,categorySelected, inventory]);

    // Cálculos para la paginación
    const indexOfLastInventory = currentInventoryPage * inventoryItemsPerPage;
    const indexOfFirstInventory = indexOfLastInventory - inventoryItemsPerPage;
    const currentInventoryItems = filteredInventory.slice(indexOfFirstInventory, indexOfLastInventory);
    const totalInventoryPages = Math.ceil(filteredInventory.length / inventoryItemsPerPage);
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
        if (!productName || !category || !brand || !quantity || !price || !useLocation || !status) {
            messageError("Complete los campos");
            setSaving(false);
            return
        };
        const newProduct = {
            i: uuid(5),
            p: productName,
            c: category,
            b: brand,
            q: Number(quantity),
            pr: Number(price),
            l: useLocation,
            s: status,
            d: date,
        };
        try {
            const docRef = doc(db, 'USERS', currentUserData?.uid)
            await setDoc(docRef, { inv: arrayUnion(newProduct) }, { merge: true });
            messageError("¡¡ Exito !!");
            setSaving(false);
            resetForm();
        } catch (error) {
            console.error('Error al guardar:', error);
            messageError("Sucedió un error , intentalo nuevamente");
        }
        setSaving(false);
    };

    const removeProductTable = async (id) => {
        try {
            if (currentUserData.rol === 'owner') {
                const docRef = doc(db, 'USERS', currentUserData?.uid);
                const productToRemove = inventory.find(product => product.i === id);
                if (!productToRemove) {
                    messageError("Producto no encontrado");
                    return;
                }

                await updateDoc(docRef, {
                    inv: arrayRemove(productToRemove)
                });
            }
        } catch (error) {
            console.log(error.message);
        }
    }
    return (
        <>
            <section className="users-management">
            <h4 className='added'>{`${inventory?.length} ${inventory?.length === 0 || inventory?.length > 1 ? `productos añadidos` : `producto añadido`}`}</h4>
                <div className="table-header">
                    <h2 className='libre-Baskerville'>Gestión de Inventario {!currentUserData.paid?.i_p && '(ejemplo)'} </h2>
                    <div className="header-actions">
                        <input
                            type="text"
                            placeholder="Buscar por producto o categoría..."
                            value={inventorySearchQuery}
                            onChange={(e) => setInventorySearchQuery(e.target.value)}
                        />
                        <select id='select-category' onChange={(e) => setCategorySelected(e.target.value)} >
                            <option value="">--Filtra por categoría--</option>
                            {gymProductCategories.map((c, index) => (<option key={index} value={c}>{c}</option>))}
                        </select>
                        <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
                            <option value="">-- Filtre por fecha --</option>
                            {inventoryDates.map((date, index) => (
                                <option key={index} value={date}>{date}</option>
                            ))}
                        </select>
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
                        <button type="button" className="btn-delete" onClick={() => setShowAddProductForm(false)}>X</button>
                    </form>
                )}
                           <div className="table-container-admin">
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
                            {currentInventoryItems.length > 0 ? (
                                currentInventoryItems.map((p) => (
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
                                            <button className="btn-delete" onClick={() => removeProductTable(p.i)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="11" className="no-results">
                                        No se encontraron productos
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
