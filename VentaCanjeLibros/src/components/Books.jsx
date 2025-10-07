import { useEffect, useState } from "react";
import { FaSearch, FaPlus, FaTimes } from "react-icons/fa";

import useFetchBooks from "../hooks/useFetchBooks";

function Products() {
  const {
    books: initialProducts,
    fetchBooks,
    isLoading,
    error,
    done,
  } = useFetchBooks();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    stock: "",
    barcode: "",
    price: "",
  });

  // Fetch inicial - solo una vez
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]); // Solo al montar el componente

  // Cargar categorías al montar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/categories");
        if (!response.ok) throw new Error("Error al cargar categorías");
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    };

    fetchCategories();
    fetchBooks();
  }, []); // Array vacío para ejecutar solo una vez
  // Sincronizar products cuando books cambia
  useEffect(() => {
    if (done && initialProducts) {
      setProducts(initialProducts);
    }
  }, [done, initialProducts]);

  const filteredProducts = (products || []).filter((product) => {
    if (!product || !product.name) {
      return false;
    }
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = product.name.toLowerCase().includes(searchLower);
    const barcodeMatch =
      product.barcode && product.barcode.toString().includes(searchLower);
    return nameMatch || barcodeMatch;
  });

  const handleQuickSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      author: product.author || "",
      stock: product.stock || "",
    });
  };
  const handleCreateClick = () => {
    setShowCreateForm(true);
    setEditingProduct(null);
    setFormData({
      name: "",
      author: "",
      stock: "",
      category: "",
    });
  };
  const handleDeleteClick = async (product) => {
    if (
      window.confirm(`¿Estás seguro de eliminar el libro "${product.name}"? Esta acción no se puede deshacer.`)
    ) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/books/delete/${product._id}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) throw new Error("Error al eliminar el producto");
        setProducts(products.filter((p) => p._id !== product._id));
      } catch (err) {
        console.error("Error al eliminar:", err);
        alert("Error al eliminar el libro");
      }
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/books/update/${editingProduct._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) throw new Error("Error al actualizar el producto");
      const updatedProduct = await response.json();
      setProducts(
        products.map((p) => (p._id === editingProduct._id ? updatedProduct : p))
      );
      setEditingProduct(null);
    } catch (err) {
      console.error("Error al actualizar:", err);
      alert("Error al actualizar el libro");
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/books/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Error al crear");
      const newBook = await response.json();
      setProducts([...products, newBook]);
      setShowCreateForm(false);
      setFormData({ name: "", author: "", stock: "", category: "" });
      alert("Libro creado correctamente");
    } catch (err) {
      console.error("Error:", err);
      alert("Error al crear el libro");
    }
  };
  if (isLoading) {
    return (
      <div>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "10px",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>⏳</div>
            <h2 style={{ color: "#333", margin: "0 0 10px 0" }}>
              Cargando Productos
            </h2>
            <p style={{ color: "#666", margin: 0 }}>Por favor espera...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              padding: "20px",
              backgroundColor: "#fee",
              borderRadius: "10px",
              border: "1px solid #fcc",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>❌</div>
            <h2 style={{ color: "#c33", margin: "0 0 10px 0" }}>
              Error al Cargar
            </h2>
            <p style={{ color: "#c33", margin: "0 0 15px 0" }}>{error}</p>
            <button
              onClick={fetchBooks}
              style={{
                padding: "12px 24px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              🔄 Intentar de Nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div
          className="sidebarContent"
          style={{ width: "250px", padding: "20px" }}
        >
          <div style={{ marginBottom: "25px" }}>
            <h4 className="sidebarLogoBusqueda">
              <FaSearch /> Búsqueda
            </h4>
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              className="sidebarInputBusqueda"
              value={searchTerm}
              onChange={handleQuickSearch}
              onFocus={(e) => (e.target.style.borderColor = "#007bff")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            />
          </div>
          <button
            onClick={handleCreateClick}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <FaPlus /> Crear Nuevo Libro
          </button>
        </div>

        <div
          style={{
            padding: "25px",
            flex: 1,
            backgroundColor: "#ffffff",
            margin: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          {showCreateForm && (
            <div
              style={{
                marginBottom: "25px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "2px solid #28a745",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <h3 style={{ margin: 0, color: "#28a745" }}>
                  Crear Nuevo Libro
                </h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                    color: "#666",
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Nombre del Libro*
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: Cien años de soledad"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Autor
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    placeholder="Ej: Gabriel García Márquez"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Stock*
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    placeholder="Ej: 10"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Categoría*
                  </label>
                  <input
                    type="text"
                    list="categories"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="Categoría"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                    }}
                  />
                  <datalist id="categories">
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div
                style={{
                  marginTop: "15px",
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={
                    !formData.name || !formData.stock || !formData.category
                  }
                  style={{
                    padding: "10px 20px",
                    backgroundColor:
                      formData.name && formData.stock && formData.category
                        ? "#28a745"
                        : "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor:
                      formData.name && formData.stock && formData.category
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  Crear Libro
                </button>
              </div>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "25px",
              paddingBottom: "15px",
              borderBottom: "2px solid #e9ecef",
            }}
          >
            <h2
              style={{
                margin: "0 0 5px 0",
                color: "#333",
                fontSize: "28px",
                fontWeight: "700",
              }}
            >
              Libros en stock
            </h2>
            <div
              style={{ textAlign: "right", fontSize: "14px", color: "#666" }}
            >
              <div>
                <strong>Total libros:</strong> {filteredProducts.length}
              </div>
              {searchTerm && (
                <div style={{ color: "#007bff" }}>
                  🔍 Filtrado: "{searchTerm}"
                </div>
              )}
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                Stock bajo (&lt;10):{" "}
                {filteredProducts.filter((p) => p.stock < 10).length}
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
                border: "2px dashed #dee2e6",
              }}
            >
              <div
                style={{
                  fontSize: "4rem",
                  marginBottom: "20px",
                  opacity: "0.5",
                }}
              >
                📭
              </div>
              <h3 style={{ color: "#666", margin: "0 0 10px 0" }}>
                No hay libros disponibles
              </h3>
              {searchTerm ? (
                <p className="infoBusquedaProductos">
                  No se encontraron libros con el término "{searchTerm}"
                  <br />
                  <button
                    onClick={() => setSearchTerm("")}
                    className="limpiaBusquedaProductos"
                    style={{
                      padding: "8px 16px",
                      marginTop: "10px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                    }}
                  >
                    Limpiar búsqueda
                  </button>
                </p>
              ) : (
                <p className="infoBusquedaProductos">
                  Agrega libros para comenzar a trabajar
                </p>
              )}
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid #e9ecef",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th className="titulosProductos">Libro</th>
                    <th className="titulosProductos">Autor</th>
                    <th className="titulosProductos">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr
                      key={product._id}
                      style={{
                        borderBottom: "1px solid #dee2e6",
                        backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                        transition: "background-color 0.2s",
                        textAlign: "center",
                      }}
                      onMouseOver={(e) =>
                        (e.target.parentNode.style.backgroundColor = "#f0f8ff")
                      }
                      onMouseOut={(e) =>
                        (e.target.parentNode.style.backgroundColor =
                          index % 2 === 0 ? "#fff" : "#f9f9f9")
                      }
                    >
                      {editingProduct && editingProduct._id === product._id ? (
                        <>
                          <td style={{ padding: "14px" }}>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              className="inputEdicionProducto"
                              style={{
                                padding: "8px",
                                width: "100%",
                                borderRadius: "4px",
                                border: "1px solid #ddd",
                              }}
                            />
                          </td>
                          <td style={{ padding: "14px" }}>
                            <input
                              type="text"
                              value={formData.author}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  author: e.target.value,
                                })
                              }
                              className="inputEdicionProducto"
                              style={{
                                padding: "8px",
                                width: "100%",
                                borderRadius: "4px",
                                border: "1px solid #ddd",
                              }}
                            />
                          </td>

                          <td style={{ padding: "14px" }}>
                            <input
                              type="number"
                              value={formData.stock}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  stock: e.target.value,
                                })
                              }
                              className="inputEdicionProducto"
                              style={{
                                padding: "8px",
                                width: "100%",
                                borderRadius: "4px",
                                border: "1px solid #ddd",
                              }}
                            />
                          </td>
                          <td style={{ padding: "14px", textAlign: "center" }}>
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                justifyContent: "center",
                              }}
                            >
                              <button
                                onClick={handleUpdate}
                                className="botonEdicionProducto"
                                style={{
                                  padding: "8px 16px",
                                  backgroundColor: "#28a745",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                }}
                              >
                                ✅ Guardar
                              </button>
                              <button
                                onClick={() => setEditingProduct(null)}
                                className="cancelarEdicionProducto"
                                style={{
                                  padding: "8px 16px",
                                  backgroundColor: "#dc3545",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                }}
                              >
                                ❌ Cancelar
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ padding: "14px" }}>
                            <div
                              style={{
                                fontWeight: "600",
                                color: "#333",
                                fontSize: "15px",
                                marginBottom: "4px",
                              }}
                            >
                              {product.name}
                            </div>
                          </td>
                          <td style={{ padding: "14px" }}>
                            <div
                              style={{
                                fontWeight: "600",
                                color: "#333",
                                fontSize: "15px",
                                marginBottom: "4px",
                              }}
                            >
                              {product.author}
                            </div>
                          </td>

                          <td style={{ padding: "14px" }}>{product.stock}</td>
                          <td style={{ padding: "14px", textAlign: "center" }}>
                            <div
                              style={{
                                display: "flex",
                                gap: "6px",
                                justifyContent: "center",
                              }}
                            >
                              <button
                                onClick={() => handleEditClick(product)}
                                className="botonEditarProducto"
                                title="Editar producto"
                                style={{
                                  padding: "6px 12px",
                                  backgroundColor: "#007bff",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                }}
                              >
                                ✏️ Editar
                              </button>
                              <button
                                onClick={() => handleDeleteClick(product)}
                                className="botonEliminarProducto"
                                title="Eliminar producto"
                                style={{
                                  padding: "6px 12px",
                                  backgroundColor: "#dc3545",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                }}
                              >
                                🗑️ Eliminar
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div
              className="filtradoProductosEstadistica"
              style={{ marginTop: "20px" }}
            >
              <h4 className="h4FiltradoProductosEstadistica">
                📊 Estadísticas de Inventario
              </h4>
              <div
                className="stockContent"
                style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}
              >
                <div
                  className="stockContentFondo"
                  style={{ textAlign: "center" }}
                >
                  <div
                    className="stockContentLetras"
                    style={{ fontSize: "24px", fontWeight: "bold" }}
                  >
                    {filteredProducts.filter((p) => p.stock >= 20).length}
                  </div>
                  <div style={{ fontSize: "12px", color: "#155724" }}>
                    Stock Alto (≥20)
                  </div>
                </div>
                <div
                  className="stockMedioContent"
                  style={{ textAlign: "center" }}
                >
                  <div
                    className="stockMedioFondo"
                    style={{ fontSize: "24px", fontWeight: "bold" }}
                  >
                    {
                      filteredProducts.filter(
                        (p) => p.stock >= 10 && p.stock < 20
                      ).length
                    }
                  </div>
                  <div style={{ fontSize: "12px", color: "#856404" }}>
                    Stock Medio (10-19)
                  </div>
                </div>
                <div
                  className="stockMedioLetra"
                  style={{ textAlign: "center" }}
                >
                  <div
                    className="stockBajoContent"
                    style={{ fontSize: "24px", fontWeight: "bold" }}
                  >
                    {filteredProducts.filter((p) => p.stock < 10).length}
                  </div>
                  <div style={{ fontSize: "12px", color: "#721c24" }}>
                    Stock Bajo (&lt;10)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;
