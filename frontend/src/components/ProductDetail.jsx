export default function ProductDetail({ product, onClose, onEdit, onDelete }) {
  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('⭐')
      } else if (i === fullStars && hasHalfStar) {
        stars.push('⭐')
      } else {
        stars.push('☆')
      }
    }
    return stars.join('')
  }

  const getBadgeColor = (rating) => {
    if (rating >= 4.5) return '#28a745'
    if (rating >= 3.5) return '#ffc107'
    if (rating >= 2.5) return '#ff9800'
    return '#dc3545'
  }

  return (
    <div className="modal active">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <div className="detail-header">
          <h2>{product.produto.nome_produto}</h2>
          <p style={{ color: '#999', marginBottom: '15px' }}>ID: {product.produto.id_produto}</p>
          <p>Categoria: <strong>{product.produto.categoria_produto}</strong></p>
          
          {product.media_avaliacao !== null && (
            <div style={{ 
              marginTop: '15px', 
              padding: '15px', 
              background: getBadgeColor(product.media_avaliacao), 
              color: 'white', 
              borderRadius: '8px',
              display: 'inline-block'
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '5px' }}>
                {renderStars(product.media_avaliacao)}
              </div>
              <div>
                <strong>{product.media_avaliacao.toFixed(1)}</strong> baseado em <strong>{product.total_avaliacoes}</strong> avaliações
              </div>
            </div>
          )}
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '2px solid #f0f0f0' }}>
          <button 
            className="btn btn-primary"
            onClick={() => onEdit(product.produto)}
          >
            ✏️ Editar
          </button>
          <button 
            className="btn btn-danger"
            onClick={() => onDelete(product.produto.id_produto)}
          >
            🗑️ Deletar
          </button>
        </div>

        {/* Dimensões */}
        <div className="section">
          <h3>📏 Dimensões e Peso</h3>
          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
            <p><strong>Peso:</strong> {product.produto.peso_produto_gramas || 'N/A'} gramas</p>
            <p><strong>Comprimento:</strong> {product.produto.comprimento_centimetros || 'N/A'} cm</p>
            <p><strong>Altura:</strong> {product.produto.altura_centimetros || 'N/A'} cm</p>
            <p><strong>Largura:</strong> {product.produto.largura_centimetros || 'N/A'} cm</p>
          </div>
        </div>

        {/* Histórico de Vendas */}
        {product.historico_vendas && product.historico_vendas.length > 0 && (
          <div className="section">
            <h3>📦 Histórico de Vendas ({product.historico_vendas.length})</h3>
            {product.historico_vendas.map((venda, idx) => (
              <div key={idx} className="sales-item">
                <p><strong>Pedido:</strong> {venda.id_pedido}</p>
                <p><strong>Status:</strong> {venda.status_pedido}</p>
                <p><strong>Consumidor ID:</strong> {venda.id_consumidor}</p>
                <p><strong>Data Compra:</strong> {formatDate(venda.data_compra)}</p>
                <p><strong>Data Entrega:</strong> {formatDate(venda.data_entrega)}</p>
                <p><strong>Data Estimada:</strong> {formatDate(venda.data_estimada_entrega)}</p>
                <p><strong>Tempo Entrega:</strong> {venda.tempo_entrega_dias || 'N/A'} dias</p>
                <p><strong>No Prazo:</strong> {venda.entrega_no_prazo || 'N/A'}</p>
                <p><strong>Preço:</strong> R$ {venda.preco_BRL.toFixed(2)}</p>
                <p><strong>Frete:</strong> R$ {venda.preco_frete.toFixed(2)}</p>
                
                {venda.vendedor && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
                    <p><strong>Vendedor:</strong> {venda.vendedor.nome_vendedor}</p>
                    <p>Cidade: {venda.vendedor.cidade}, {venda.vendedor.estado}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Avaliações */}
        {product.avaliacoes && product.avaliacoes.length > 0 && (
          <div className="section">
            <h3>⭐ Avaliações ({product.avaliacoes.length})</h3>
            {product.avaliacoes.map((avaliacao, idx) => (
              <div key={idx} className="evaluation-item">
                <div style={{ marginBottom: '10px' }}>
                  <strong>{renderStars(avaliacao.avaliacao)}</strong>
                  <span style={{ marginLeft: '10px', color: '#666' }}>({avaliacao.avaliacao}/5)</span>
                </div>
                {avaliacao.titulo_comentario && (
                  <p><strong>Título:</strong> {avaliacao.titulo_comentario}</p>
                )}
                {avaliacao.comentario && (
                  <p><strong>Comentário:</strong> {avaliacao.comentario}</p>
                )}
                <p style={{ fontSize: '0.9rem', color: '#999' }}>
                  <strong>Data:</strong> {formatDate(avaliacao.data_comentario)}
                </p>
                {avaliacao.data_resposta && (
                  <p style={{ fontSize: '0.9rem', color: '#999' }}>
                    <strong>Resposta em:</strong> {formatDate(avaliacao.data_resposta)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {(!product.avaliacoes || product.avaliacoes.length === 0) && (
          <div className="section">
            <p style={{ color: '#999' }}>Nenhuma avaliação ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
