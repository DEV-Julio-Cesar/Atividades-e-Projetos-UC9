import Sequelize from 'sequelize'
import sequelize from '../config/orm.js'

const { DataTypes } = Sequelize

const Pedido = sequelize.define('Pedido', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  mesa: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING
  },
  idCliente: {
    type: DataTypes.STRING,
    foreignKey: true
  }
}, {
  tableName: 'pedidos',
  timestamps: false
})

export default Pedido
  return {
    id: linha.itemId,
    quantidade: Number(linha.itemQuantidade),
    idPedido: linha.id,
    idPrato: linha.itemPratoId,
    prato: linha.itemPratoId
      ? {
          id: linha.itemPratoId,
          nome: linha.itemPratoNome,
          preco: linha.itemPratoPreco,
          categoria: linha.itemPratoCategoria
        }
      : null
  };


/**
 * Monta a estrutura final de um pedido a partir da linha base.
 */
function criarPedidoBase(linha) {
  return {
    id: linha.id,
    mesa: Number(linha.mesa),
    status: linha.status,
    idCliente: linha.idCliente,
    cliente: linha.idCliente
      ? {
          id: linha.idCliente,
          nome: linha.clienteNome,
          telefone: linha.clienteTelefone
        }
      : null,
    itens: []
  };
}

/**
 * Reúne as operações SQL dos pedidos.
 */
const Pedido = {
  /**
   * Lista todos os pedidos com cliente e itens associados.
   */
  async listarTodos() {
    const pool = obterPool();
    const linhas = await pool.query(sql`
      select
        p.id,
        p.mesa,
        p.status,
        p.idCliente,
        c.nome as clienteNome,
        c.telefone as clienteTelefone,
        i.id as itemId,
        i.quantidade as itemQuantidade,
        i.idPrato as itemPratoId,
        pr.nome as itemPratoNome,
        pr.preco as itemPratoPreco,
        pr.categoria as itemPratoCategoria
      from pedidos p
      left join clientes c on c.id = p.idCliente
      left join itensPedido i on i.idPedido = p.id
      left join pratos pr on pr.id = i.idPrato
      order by p.mesa asc, p.id asc, i.id asc
    `);

    const mapaPedidos = new Map();

    for (const linha of linhas) {
      if (!mapaPedidos.has(linha.id)) {
        mapaPedidos.set(linha.id, criarPedidoBase(linha));
      }

      if (linha.itemId) {
        mapaPedidos.get(linha.id).itens.push(mapearItemDoPedido(linha));
      }
    }

    return Array.from(mapaPedidos.values());
  },

  /**
   * Busca um único pedido pelo ID, com cliente e itens.
   */
  async buscarPorId(id) {
    const pool = obterPool();
    const linhas = await pool.query(sql`
      select
        p.id,
        p.mesa,
        p.status,
        p.idCliente,
        c.nome as clienteNome,
        c.telefone as clienteTelefone,
        i.id as itemId,
        i.quantidade as itemQuantidade,
        i.idPrato as itemPratoId,
        pr.nome as itemPratoNome,
        pr.preco as itemPratoPreco,
        pr.categoria as itemPratoCategoria
      from pedidos p
      left join clientes c on c.id = p.idCliente
      left join itensPedido i on i.idPedido = p.id
      left join pratos pr on pr.id = i.idPrato
      where p.id = ${id}
      order by i.id asc
    `);

    if (!linhas.length) {
      return null;
    }

    const pedido = criarPedidoBase(linhas[0]);

    for (const linha of linhas) {
      if (linha.itemId) {
        pedido.itens.push(mapearItemDoPedido(linha));
      }
    }

    return pedido;
  },

  /**
   * Cria um pedido novo.
   */
  async criar(dadosPedido) {
    const pool = obterPool();

    await pool.exec(sql.insert('pedidos', dadosPedido));

    return this.buscarPorId(dadosPedido.id);
  },

  /**
   * Atualiza um pedido já existente.
   */
  async atualizar(id, dadosPedido) {
    const pool = obterPool();

    await pool.exec(sql`
      update pedidos
      set ${sql.set(dadosPedido)}
      where id = ${id}
    `);

    return this.buscarPorId(id);
  },

  /**
   * Remove um pedido pelo identificador.
   */
  async remover(id) {
    const pool = obterPool();

    await pool.exec(sql`
      delete from pedidos
      where id = ${id}
    `);
  }
};

export default Pedido;
