from pathlib import Path

import pandas as pd
from app.database import SessionLocal, engine, Base
from app import models


BASE_DIR = Path(__file__).resolve().parent

def populate():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    model_order = [
        models.Consumidor,
        models.Produto,
        models.Vendedor,
        models.Pedido,
        models.ItemPedido,
        models.AvaliacaoPedido,
    ]


    for model_class in reversed(model_order):
        db.query(model_class).delete(synchronize_session=False)
    db.commit()
    
    data_map = [
        ('dim_vendedores.csv', models.Vendedor),
        ('dim_consumidores.csv', models.Consumidor),
        ('dim_produtos.csv', models.Produto),
        ('fat_pedidos.csv', models.Pedido),
        ('fat_itens_pedidos.csv', models.ItemPedido),
        ('fat_avaliacoes_pedidos.csv', models.AvaliacaoPedido),
    ]

    for file_name, model_class in data_map:
        print(f"Processando {file_name}...")
        file_path = BASE_DIR / file_name
        df = pd.read_csv(file_path)

        
        # 1. Datas (Conversão obrigatória para o SQLite)
        date_cols = {
            'fat_pedidos.csv': ['pedido_compra_timestamp', 'pedido_entregue_timestamp', 'data_estimada_entrega'],
            'fat_avaliacoes_pedidos.csv': ['data_comentario', 'data_resposta']
        }
        if file_name in date_cols:
            for col in date_cols[file_name]:
                df[col] = pd.to_datetime(df[col], errors='coerce')

        # 2. Produtos (Limpeza de nulos)
        if file_name == 'dim_produtos.csv':
            df['categoria_produto'] = df['categoria_produto'].fillna('outros')
            cols_medidas = ['peso_produto_gramas', 'comprimento_centimetros', 'altura_centimetros', 'largura_centimetros']
            df[cols_medidas] = df[cols_medidas].fillna(0)

        pk_columns = [column.name for column in model_class.__table__.primary_key.columns]
        if pk_columns:
            df = df.drop_duplicates(subset=pk_columns, keep='last')

    
        df = df.astype(object).where(pd.notnull(df), None)
        


        records = df.to_dict(orient='records')
        db.bulk_insert_mappings(model_class, records)
        db.commit()
        print(f"✅ {file_name} importado!")

    db.close()

if __name__ == "__main__":
    try:
        populate()
        print("\n🚀 BANCO DE DADOS POPULADO E PRONTO!")
    except Exception as e:
        db = SessionLocal()
        db.rollback() # Garante que não fiquem transações abertas em caso de erro
        print(f"\n❌ Erro crítico: {e}")