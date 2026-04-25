import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

export default function ProductFormModal({ product, onClose, onSuccess, onError }) {
  const [formData, setFormData] = useState({
    nome_produto: '',
    categoria_produto: '',
    peso_produto_gramas: '',
    comprimento_centimetros: '',
    altura_centimetros: '',
    largura_centimetros: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        nome_produto: product?.nome_produto || '',
        categoria_produto: product?.categoria_produto || '',
        peso_produto_gramas: product?.peso_produto_gramas || '',
        comprimento_centimetros: product?.comprimento_centimetros || '',
        altura_centimetros: product?.altura_centimetros || '',
        largura_centimetros: product?.largura_centimetros || ''
      })
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : name.includes('gramas') || name.includes('centimetros') ? parseFloat(value) || '' : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.nome_produto || !formData.categoria_produto) {
      onError('❌ Nome e categoria são obrigatórios!')
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('nome_produto', formData.nome_produto)
      params.append('categoria_produto', formData.categoria_produto)
      if (formData.peso_produto_gramas) params.append('peso_produto_gramas', formData.peso_produto_gramas)
      if (formData.comprimento_centimetros) params.append('comprimento_centimetros', formData.comprimento_centimetros)
      if (formData.altura_centimetros) params.append('altura_centimetros', formData.altura_centimetros)
      if (formData.largura_centimetros) params.append('largura_centimetros', formData.largura_centimetros)

      if (product) {
        // UPDATE
        await axios.put(`${API_URL}/products/${product.id_produto}`, null, { params })
        onSuccess(false)
      } else {
        // CREATE
        await axios.post(`${API_URL}/products`, null, { params })
        onSuccess(true)
      }
    } catch (err) {
      onError('❌ Erro ao salvar produto: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal active">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <h2 style={{ color: '#667eea', marginBottom: '20px' }}>
          {product ? '✏️ Editar Produto' : '➕ Novo Produto'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome do Produto *</label>
            <input
              type="text"
              name="nome_produto"
              value={formData.nome_produto}
              onChange={handleChange}
              placeholder="Ex: Notebook Dell Inspiron"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Categoria *</label>
            <input
              type="text"
              name="categoria_produto"
              value={formData.categoria_produto}
              onChange={handleChange}
              placeholder="Ex: Eletrônicos"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Peso (gramas)</label>
            <input
              type="number"
              name="peso_produto_gramas"
              value={formData.peso_produto_gramas}
              onChange={handleChange}
              placeholder="Ex: 1500"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Comprimento (cm)</label>
            <input
              type="number"
              name="comprimento_centimetros"
              value={formData.comprimento_centimetros}
              onChange={handleChange}
              placeholder="Ex: 35"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Altura (cm)</label>
            <input
              type="number"
              name="altura_centimetros"
              value={formData.altura_centimetros}
              onChange={handleChange}
              placeholder="Ex: 25"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Largura (cm)</label>
            <input
              type="number"
              name="largura_centimetros"
              value={formData.largura_centimetros}
              onChange={handleChange}
              placeholder="Ex: 20"
              disabled={loading}
            />
          </div>

          <div className="button-group">
            <button 
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? 'Salvando...' : product ? '✅ Atualizar' : '✅ Criar'}
            </button>
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              ✕ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
