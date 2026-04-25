export default function ProductList({ products, onProductClick, onEdit, onDelete }) {
  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
        <p>Nenhum produto encontrado. Tente uma busca diferente.</p>
      </div>
    )
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <div
          key={product.id_produto}
          className="product-card"
        >
          <h3 onClick={() => onProductClick(product.id_produto)} style={{ cursor: 'pointer', color: '#667eea' }}>
            {product.nome_produto}
          </h3>
          <div className="category">{product.categoria_produto}</div>
          
          {product.peso_produto_gramas && (
            <p>⚖️ Peso: {product.peso_produto_gramas}g</p>
          )}
          
          {product.comprimento_centimetros && (
            <p>📏 Comprimento: {product.comprimento_centimetros}cm</p>
          )}
          
          {product.altura_centimetros && (
            <p>📐 Altura: {product.altura_centimetros}cm</p>
          )}
          
          {product.largura_centimetros && (
            <p>📊 Largura: {product.largura_centimetros}cm</p>
          )}
          
          <p style={{ marginTop: '15px', color: '#667eea', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => onProductClick(product.id_produto)}>
            👁️ Ver Detalhes →
          </p>

          <div style={{ display: 'flex', gap: '8px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f0f0f0' }}>
            <button 
              className="btn btn-primary"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(product)
              }}
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.9rem' }}
            >
              ✏️ Editar
            </button>
            <button 
              className="btn btn-danger"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(product.id_produto)
              }}
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.9rem' }}
            >
              🗑️ Deletar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
