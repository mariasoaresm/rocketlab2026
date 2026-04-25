import { useState } from 'react'
import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

export default function CrudSection({ onProductCreated, onProductUpdated, onProductDeleted, onError }) {
  const [activeTab, setActiveTab] = useState('create')
  const [loading, setLoading] = useState(false)

  // CREATE
  const [createForm, setCreateForm] = useState({
    nome_produto: '',
    categoria_produto: '',
    peso_produto_gramas: '',
    comprimento_centimetros: '',
    altura_centimetros: '',
    largura_centimetros: ''
  })

  // UPDATE
  const [updateForm, setUpdateForm] = useState({
    product_id: '',
    nome_produto: '',
    categoria_produto: '',
    peso_produto_gramas: '',
    comprimento_centimetros: '',
    altura_centimetros: '',
    largura_centimetros: ''
  })

  // DELETE
  const [deleteForm, setDeleteForm] = useState({
    product_id: ''
  })

  const handleCreateChange = (e) => {
    const { name, value } = e.target
    setCreateForm(prev => ({
      ...prev,
      [name]: value === '' ? '' : name.includes('gramas') || name.includes('centimetros') ? parseFloat(value) || '' : value
    }))
  }

  const handleUpdateChange = (e) => {
    const { name, value } = e.target
    setUpdateForm(prev => ({
      ...prev,
      [name]: value === '' ? '' : name.includes('gramas') || name.includes('centimetros') ? parseFloat(value) || '' : value
    }))
  }

  const handleDeleteChange = (e) => {
    const { name, value } = e.target
    setDeleteForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreate = async () => {
    if (!createForm.nome_produto || !createForm.categoria_produto) {
      onError('Nome e categoria são obrigatórios!')
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('nome_produto', createForm.nome_produto)
      params.append('categoria_produto', createForm.categoria_produto)
      if (createForm.peso_produto_gramas) params.append('peso_produto_gramas', createForm.peso_produto_gramas)
      if (createForm.comprimento_centimetros) params.append('comprimento_centimetros', createForm.comprimento_centimetros)
      if (createForm.altura_centimetros) params.append('altura_centimetros', createForm.altura_centimetros)
      if (createForm.largura_centimetros) params.append('largura_centimetros', createForm.largura_centimetros)

      await axios.post(`${API_URL}/products`, null, { params })
      setCreateForm({
        nome_produto: '',
        categoria_produto: '',
        peso_produto_gramas: '',
        comprimento_centimetros: '',
        altura_centimetros: '',
        largura_centimetros: ''
      })
      onProductCreated()
    } catch (err) {
      onError('Erro ao criar produto: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!updateForm.product_id) {
      onError('ID do produto é obrigatório!')
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (updateForm.nome_produto) params.append('nome_produto', updateForm.nome_produto)
      if (updateForm.categoria_produto) params.append('categoria_produto', updateForm.categoria_produto)
      if (updateForm.peso_produto_gramas) params.append('peso_produto_gramas', updateForm.peso_produto_gramas)
      if (updateForm.comprimento_centimetros) params.append('comprimento_centimetros', updateForm.comprimento_centimetros)
      if (updateForm.altura_centimetros) params.append('altura_centimetros', updateForm.altura_centimetros)
      if (updateForm.largura_centimetros) params.append('largura_centimetros', updateForm.largura_centimetros)

      await axios.put(`${API_URL}/products/${updateForm.product_id}`, null, { params })
      setUpdateForm({
        product_id: '',
        nome_produto: '',
        categoria_produto: '',
        peso_produto_gramas: '',
        comprimento_centimetros: '',
        altura_centimetros: '',
        largura_centimetros: ''
      })
      onProductUpdated()
    } catch (err) {
      onError('Erro ao atualizar produto: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteForm.product_id) {
      onError('ID do produto é obrigatório!')
      return
    }

    if (window.confirm('Tem certeza que deseja deletar este produto?')) {
      setLoading(true)
      try {
        await axios.delete(`${API_URL}/products/${deleteForm.product_id}`)
        setDeleteForm({ product_id: '' })
        onProductDeleted()
      } catch (err) {
        onError('Erro ao deletar produto: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="crud-section">
      <h2 style={{ marginBottom: '25px', color: '#667eea' }}>⚙️ Operações CRUD</h2>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>
        <button
          className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('create')}
          disabled={loading}
        >
          ➕ Criar
        </button>
        <button
          className={`btn ${activeTab === 'update' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('update')}
          disabled={loading}
        >
          ✏️ Atualizar
        </button>
        <button
          className={`btn ${activeTab === 'delete' ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => setActiveTab('delete')}
          disabled={loading}
        >
          🗑️ Deletar
        </button>
      </div>

      {/* CREATE TAB */}
      {activeTab === 'create' && (
        <div>
          <h3 style={{ marginBottom: '15px' }}>Criar Novo Produto</h3>
          <div className="form-group">
            <label>Nome do Produto *</label>
            <input
              type="text"
              name="nome_produto"
              value={createForm.nome_produto}
              onChange={handleCreateChange}
              placeholder="Ex: Notebook Dell Inspiron"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Categoria *</label>
            <input
              type="text"
              name="categoria_produto"
              value={createForm.categoria_produto}
              onChange={handleCreateChange}
              placeholder="Ex: Eletrônicos"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Peso (gramas)</label>
            <input
              type="number"
              name="peso_produto_gramas"
              value={createForm.peso_produto_gramas}
              onChange={handleCreateChange}
              placeholder="Ex: 1500"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Comprimento (cm)</label>
            <input
              type="number"
              name="comprimento_centimetros"
              value={createForm.comprimento_centimetros}
              onChange={handleCreateChange}
              placeholder="Ex: 35"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Altura (cm)</label>
            <input
              type="number"
              name="altura_centimetros"
              value={createForm.altura_centimetros}
              onChange={handleCreateChange}
              placeholder="Ex: 25"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Largura (cm)</label>
            <input
              type="number"
              name="largura_centimetros"
              value={createForm.largura_centimetros}
              onChange={handleCreateChange}
              placeholder="Ex: 20"
              disabled={loading}
            />
          </div>

          <div className="button-group">
            <button className="btn btn-success" onClick={handleCreate} disabled={loading}>
              {loading ? 'Criando...' : 'Criar Produto'}
            </button>
          </div>
        </div>
      )}

      {/* UPDATE TAB */}
      {activeTab === 'update' && (
        <div>
          <h3 style={{ marginBottom: '15px' }}>Atualizar Produto</h3>
          
          <div className="form-group">
            <label>ID do Produto *</label>
            <input
              type="text"
              name="product_id"
              value={updateForm.product_id}
              onChange={handleUpdateChange}
              placeholder="Ex: 123e4567e89b12d3a456"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Nome do Produto</label>
            <input
              type="text"
              name="nome_produto"
              value={updateForm.nome_produto}
              onChange={handleUpdateChange}
              placeholder="Deixar em branco para não alterar"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Categoria</label>
            <input
              type="text"
              name="categoria_produto"
              value={updateForm.categoria_produto}
              onChange={handleUpdateChange}
              placeholder="Deixar em branco para não alterar"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Peso (gramas)</label>
            <input
              type="number"
              name="peso_produto_gramas"
              value={updateForm.peso_produto_gramas}
              onChange={handleUpdateChange}
              placeholder="Deixar em branco para não alterar"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Comprimento (cm)</label>
            <input
              type="number"
              name="comprimento_centimetros"
              value={updateForm.comprimento_centimetros}
              onChange={handleUpdateChange}
              placeholder="Deixar em branco para não alterar"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Altura (cm)</label>
            <input
              type="number"
              name="altura_centimetros"
              value={updateForm.altura_centimetros}
              onChange={handleUpdateChange}
              placeholder="Deixar em branco para não alterar"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Largura (cm)</label>
            <input
              type="number"
              name="largura_centimetros"
              value={updateForm.largura_centimetros}
              onChange={handleUpdateChange}
              placeholder="Deixar em branco para não alterar"
              disabled={loading}
            />
          </div>

          <div className="button-group">
            <button className="btn btn-success" onClick={handleUpdate} disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar Produto'}
            </button>
          </div>
        </div>
      )}

      {/* DELETE TAB */}
      {activeTab === 'delete' && (
        <div>
          <h3 style={{ marginBottom: '15px' }}>Deletar Produto</h3>
          
          <div className="form-group">
            <label>ID do Produto *</label>
            <input
              type="text"
              name="product_id"
              value={deleteForm.product_id}
              onChange={handleDeleteChange}
              placeholder="Ex: 123e4567e89b12d3a456"
              disabled={loading}
            />
          </div>

          <div className="button-group">
            <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
              {loading ? 'Deletando...' : 'Deletar Produto'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
