import { useState, useEffect } from 'react'
import axios from 'axios'
import ProductList from './components/ProductList'
import ProductDetail from './components/ProductDetail'
import ProductFormModal from './components/ProductFormModal'

const API_URL = 'http://127.0.0.1:8000'

function App() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  // Fetch all products
  const fetchProducts = async (search = '') => {
    setLoading(true)
    setError(null)
    try {
      const params = search ? { search } : {}
      const response = await axios.get(`${API_URL}/products`, { params })
      setProducts(response.data)
      setFilteredProducts(response.data)
    } catch (err) {
      setError('Erro ao carregar produtos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch product details
  const fetchProductDetails = async (productId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${API_URL}/products/${productId}`)
      setSelectedProduct(response.data)
    } catch (err) {
      setError('Erro ao carregar detalhes do produto: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Search products
  const handleSearch = async () => {
    await fetchProducts(searchTerm)
  }

  // Handle Enter key in search
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Close product details
  const closeDetail = () => {
    setSelectedProduct(null)
  }

  // Open new product modal
  const openNewModal = () => {
    setEditingProduct(null)
    setShowNewModal(true)
  }

  // Open edit modal
  const openEditModal = (product) => {
    setEditingProduct(product)
    setShowNewModal(true)
  }

  // Delete product
  const deleteProduct = async (productId) => {
    if (!window.confirm('⚠️ Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      return
    }
    try {
      await axios.delete(`${API_URL}/products/${productId}`)
      setMessage({ type: 'success', text: '✅ Produto deletado com sucesso!' })
      refreshProducts()
      if (selectedProduct?.produto?.id_produto === productId) {
        closeDetail()
      }
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Erro ao deletar produto: ' + err.message })
    }
  }

  // Refresh products after CRUD operations
  const refreshProducts = () => {
    fetchProducts(searchTerm)
  }

  // Handle form success
  const handleFormSuccess = (isNew) => {
    setMessage({ 
      type: 'success', 
      text: isNew ? '✅ Produto criado com sucesso!' : '✅ Produto atualizado com sucesso!' 
    })
    setShowNewModal(false)
    setEditingProduct(null)
    refreshProducts()
  }

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Load products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <div>
      <header>
        <div className="container">
          <h1>🛍️ Sistema de Compras Online</h1>
          <p>Catálogo completo de produtos com histórico de vendas e avaliações</p>
        </div>
      </header>

      <div className="container">
        {message && (
          <div className={message.type === 'error' ? 'error' : 'success'}>
            {message.text}
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', alignItems: 'flex-start' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Buscar por nome ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
            />
            <button onClick={handleSearch}>🔍 Buscar</button>
          </div>
          <button 
            className="btn btn-success"
            onClick={openNewModal}
            style={{ marginTop: '0', padding: '12px 30px', whiteSpace: 'nowrap' }}
          >
            ➕ Novo Produto
          </button>
        </div>

        {loading ? (
          <div className="loading">⏳ Carregando produtos...</div>
        ) : filteredProducts.length === 0 && searchTerm ? (
          <div className="loading" style={{ color: '#ff6b6b', fontSize: '1.2rem' }}>
            🔍 Nenhum produto encontrado para "{searchTerm}"
          </div>
        ) : (
          <>
            <ProductList
              products={filteredProducts}
              onProductClick={fetchProductDetails}
              onEdit={openEditModal}
              onDelete={deleteProduct}
            />

            {selectedProduct && (
              <ProductDetail
                product={selectedProduct}
                onClose={closeDetail}
                onEdit={openEditModal}
                onDelete={deleteProduct}
              />
            )}
          </>
        )}

        {showNewModal && (
          <ProductFormModal
            product={editingProduct}
            onClose={() => {
              setShowNewModal(false)
              setEditingProduct(null)
            }}
            onSuccess={handleFormSuccess}
            onError={(errMsg) => {
              setMessage({ type: 'error', text: errMsg })
            }}
          />
        )}
      </div>
    </div>
  )
}

export default App
