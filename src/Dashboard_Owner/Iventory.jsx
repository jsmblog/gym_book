import React, { useEffect, useState } from 'react';
import fakeInventory from './Js/fakeInventory';
import optionsForms from './Js/optionsForm';
import useMessage from './../Hooks/useMessage';
import DisplayMessage from './../Components/DisplayMessage';
import { db } from '../ConfigFirebase/config.js';
import { arrayRemove, arrayUnion, doc, setDoc, updateDoc } from 'firebase/firestore';
import uuid from './../Js/uuid';
import ExcelJS from 'exceljs'
import {saveAs} from 'file-saver'

const Iventory = React.memo(({ currentUserData }) => {
  // Estados para el formulario de agregar producto
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [useLocation, setUseLocation] = useState('');
  const [status, setStatus] = useState('');
  const { gymProductCategories, gymProductStatus, gymProductLocations } = optionsForms || {};
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [date, setDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false)
  // Estados para el inventario y filtrado
  const [inventory, setInventory] = useState([]);
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [inventoryDates, setInventoryDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [categorySelected, setCategorySelected] = useState('');
  const [currentInventoryPage, setCurrentInventoryPage] = useState(1);
  const inventoryItemsPerPage = 10;
  
  // Estado para manejar envío y mensajes
  const [saving, setSaving] = useState(false);
  const [message, messageError] = useMessage();

  // Estados para edición inline
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingProductData, setEditingProductData] = useState({
    p: '',
    c: '',
    b: '',
    q: '',
    pr: '',
    l: '',
    s: '',
    d: ''
  });
  
  useEffect(() => {
    const userInventory = currentUserData.paid?.i_p ? currentUserData.inv : fakeInventory;
    setInventory(userInventory);
    setFilteredInventory(userInventory);
    const uniqueDates = [...new Set(userInventory.map(item => item.d))].filter(date => date);
    setInventoryDates(uniqueDates);
  }, [currentUserData]);

  // Filtrado del inventario según búsqueda, fecha y categoría
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
    if (categorySelected) {
      filtered = filtered.filter(item => item.c === categorySelected);
    }
    setFilteredInventory(filtered);
    setCurrentInventoryPage(1);
  }, [inventorySearchQuery, selectedDate, categorySelected, inventory]);

  // Cálculos de paginación
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
  };

  // Agregar nuevo producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (!productName || !category || !brand || !quantity || !price || !useLocation || !status) {
      messageError("Complete los campos");
      setSaving(false);
      return;
    }
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
      const docRef = doc(db, 'USERS', currentUserData?.uid);
      await setDoc(docRef, { inv: arrayUnion(newProduct) }, { merge: true });
      messageError("¡¡ Éxito !!");
      resetForm();
    } catch (error) {
      console.error('Error al guardar:', error);
      messageError("Sucedió un error, intentalo nuevamente");
    }
    setSaving(false);
  };

  const removeProductTable = async (id) => {
    try {
      if(!currentUserData.paid.i_p){
        messageError("¡¡ Suscríbete a un plan !!");
        return;
        }
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
  };

  // Funciones para edición inline
  const handleEditClick = (product) => {
    setEditingProductId(product.i);
    setEditingProductData({
      p: product.p,
      c: product.c,
      b: product.b,
      q: product.q,
      pr: product.pr,
      l: product.l,
      s: product.s,
      d: product.d
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (id) => {
    if(!currentUserData.paid.i_p){
      messageError("¡¡ Suscríbete a un plan !!");
      return;
      }
    const oldProduct = inventory.find(prod => prod.i === id);
    if (!oldProduct) {
      messageError("Producto no encontrado");
      return;
    }
    const updatedProduct = { ...oldProduct, ...editingProductData };
    setIsUpdating(true);
    try {
      const docRef = doc(db, 'USERS', currentUserData?.uid);
      await updateDoc(docRef, {
        inv: arrayRemove(oldProduct)
      });
      await updateDoc(docRef, {
        inv: arrayUnion(updatedProduct)
      });
      messageError("Producto actualizado con éxito");
      setEditingProductId(null);
      setTimeout(() => {
        setIsUpdating(false);
      }, 1000);
      setEditingProductData({ p: '', c: '', b: '', q: '', pr: '', l: '', s: '', d: '' });
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      messageError("Error al actualizar el producto");
    }
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditingProductData({ p: '', c: '', b: '', q: '', pr: '', l: '', s: '', d: '' });
  };
  
  const handleDownloadExcel = async () => {
    const dataForExcel = filteredInventory; 
    
    if (dataForExcel.length === 0) {
      messageError("No hay datos para exportar.");
      return;
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventario');
  
    const headerRow = worksheet.addRow([
      "ID", "Producto", "Marca", "Categoría", "Fecha de adquisición", "Ubicación", "Estado", "Cantidad", "Costo de adquisición", "Total"
    ]);
    
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E88E5' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
  
    // Agregar filas de datos
    dataForExcel.forEach((product, index) => {
      const row = worksheet.addRow([
        index + 1,
        product.p,
        product.b,
        product.c,
        product.d,
        product.l,
        product.s,
        product.q,
        `$ ${product.pr}`,
        parseFloat(product.q * product.pr)
      ]);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });
    });
  
    // Ajustar ancho de las columnas
    worksheet.columns.forEach((column) => {
      let maxLength = 10;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = maxLength + 2;
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const fileName = selectedDate ? `Inventario_${selectedDate}.xlsx` : "Inventario.xlsx";
    saveAs(blob, fileName);
  };
    return (
    <>
      <section className="users-management">
        <h4 className='added'>{`${currentInventoryItems.length} ${inventory?.length === 0 || inventory?.length > 1 ? `productos añadidos` : `producto añadido`}`}</h4>
        <div className="table-header">
          <h2 className='libre-Baskerville'>Gestión de Inventario {!currentUserData.paid?.i_p && '(ejemplo)'}</h2>
        {isUpdating && <div className='updating'></div>}
          <div className="header-actions">
            <input
              type="text"
              placeholder="Buscar por producto o categoría..."
              value={inventorySearchQuery}
              onChange={(e) => setInventorySearchQuery(e.target.value)}
            />
            <select id='select-category' onChange={(e) => setCategorySelected(e.target.value)}>
              <option value="">--Filtra por categoría--</option>
              {gymProductCategories.map((c, index) => (
                <option key={index} value={c}>{c}</option>
              ))}
            </select>
            <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
              <option value="">-- Filtre por fecha --</option>
              {inventoryDates.map((date, index) => (
                <option key={index} value={date}>{date}</option>
              ))}
            </select>
            {currentUserData.paid?.i_p ? (
              <button className="back-blue-dark" onClick={() => setShowAddProductForm(true)}>
                Agregar
              </button>
            ) : (
              <button className="back-blue-dark">Susbríbete a un plan</button>
            )}
            <button id='donwload-data-excel' onClick={handleDownloadExcel}>
              Descargar datos a excel
            </button>
          </div>
        </div>

        {showAddProductForm && (
          <form onSubmit={handleSubmit} className="add-user-form fade-in">
            <div className="form-group">
              <label>Producto:</label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Categoría:</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option disabled>--Selecciona una categoría--</option>
                {gymProductCategories.map((c, index) => (
                  <option key={index} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Marca:</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Cantidad:</label>
              <input type="number" min='0' value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Fecha de adquisición:</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Costo de adquisición:</label>
              <input type="number" step="0.01" min='0' value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Ubicación:</label>
              <select value={useLocation} onChange={(e) => setUseLocation(e.target.value)} required>
                <option disabled>--Seleccione una ubicación--</option>
                {gymProductLocations.map((l, index) => (
                  <option key={index} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Estado:</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} required>
                <option disabled>--Seleccione un estado--</option>
                {gymProductStatus.map((s, index) => (
                  <option key={index} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-submit back-blue-dark" disabled={saving}>
                {saving ? 'Guardando...' : 'Hecho ✅'}
              </button>
            </div>
            <button type="button" className="btn-delete" onClick={() => setShowAddProductForm(false)}>
              X
            </button>
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
                currentInventoryItems.map((p,index) => (
                  <tr key={p.i}>
                    <td>{index +1}</td>
                    <td>
                      {editingProductId === p.i ? (
                        <input type="text" name="p" value={editingProductData.p} onChange={handleEditChange} />
                      ) : (
                        p.p
                      )}
                    </td>
                    <td>
                      {editingProductId === p.i ? (
                        <input type="text" name="b" value={editingProductData.b} onChange={handleEditChange} />
                      ) : (
                        p.b
                      )}
                    </td>
                    <td>
                      {editingProductId === p.i ? (
                        <select name="c" value={editingProductData.c} onChange={handleEditChange}>
                          <option value="">--Selecciona una categoría--</option>
                          {gymProductCategories.map((c, index) => (
                            <option key={index} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        p.c
                      )}
                    </td>
                    <td>{p.d}</td>
                    <td>
                      {editingProductId === p.i ? (
                        <select name="l" value={editingProductData.l} onChange={handleEditChange}>
                          <option value="">--Seleccione una ubicación--</option>
                          {gymProductLocations.map((l, index) => (
                            <option key={index} value={l}>{l}</option>
                          ))}
                        </select>
                      ) : (
                        p.l
                      )}
                    </td>
                    <td>
                      {editingProductId === p.i ? (
                        <select name="s" value={editingProductData.s} onChange={handleEditChange}>
                          <option value="">--Seleccione un estado--</option>
                          {gymProductStatus.map((s, index) => (
                            <option key={index} value={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        p.s
                      )}
                    </td>
                    <td>
                      {editingProductId === p.i ? (
                        <input type="number" min={0} name="q" value={editingProductData.q} onChange={handleEditChange} />
                      ) : (
                        p.q
                      )}
                    </td>
                    <td>
                      {editingProductId === p.i ? (
                        <input type="number" min={0} name="pr" value={editingProductData.pr} onChange={handleEditChange} />
                      ) : (
                        <span>$ {p.pr}</span>
                      )}
                    </td>
                    <td>$ {p.q * p.pr}</td>
                    <td className="td-actions">
                      {editingProductId === p.i ? (
                        <>
                          <div className="cancel-or-saved">
                          <button className="btn-save" onClick={() => handleSaveEdit(p.i)}>Guardar</button>
                          <button className="btn-cancel" onClick={handleCancelEdit}>Cancelar</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <button className="btn-edit" onClick={() => handleEditClick(p)}>🖋️</button>
                          <button className="btn-delete" onClick={() => removeProductTable(p.i)}>🗑️</button>
                        </>
                      )}
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
