import Sequelize from 'sequelize';
import sequelize from '../config/orm.js';

const { DataTypes } = Sequelize;

/**
 * Reúne as consultas SQL ligadas à entidade cliente.
 */
const Cliente = {
  /**
   * Retorna todos os clientes ordenados por nome.
   */
  async listarTodos() {
    const pool = obterPool();

    return pool.query(sql`
      select id, nome, telefone
      from clientes
      order by nome asc
    `);
  },

  /**
   * Busca um cliente específico pelo identificador.
   */
  async buscarPorId(id) {
    const pool = obterPool();

    return pool.row(sql`
      select id, nome, telefone
      from clientes
      where id = ${id}
    `);
  },

  /**
   * Insere um novo cliente e devolve o registro salvo.
   */
  async criar(dadosCliente) {
    const pool = obterPool();

    await pool.exec(sql.insert('clientes', dadosCliente));

    return this.buscarPorId(dadosCliente.id);
  },

  /**
   * Atualiza os dados de um cliente existente e devolve o valor final.
   */
  async atualizar(id, dadosCliente) {
    const pool = obterPool();

    await pool.exec(sql`
      update clientes
      set ${sql.set(dadosCliente)}
      where id = ${id}
    `);

    return this.buscarPorId(id);
  },

  /**
   * Remove um cliente do banco com base no ID.
   */
  async remover(id) {
    const pool = obterPool();

    await pool.exec(sql`
      delete from clientes
      where id = ${id}
    `);
  },

  /**
   * Conta quantos pedidos ainda estão associados a esse cliente.
   */
  async contarPedidosVinculados(idCliente) {
    const pool = obterPool();

    return pool.count(sql`
      select *
      from pedidos
      where idCliente = ${idCliente}
    `);
  }
};

export default Cliente;
