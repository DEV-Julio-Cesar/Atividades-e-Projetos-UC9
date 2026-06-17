import Cliente from './cliente.model.js'
import Prato from './prato.model.js'
import Pedido from './pedido.model.js'
import ItemPedido from './itemPedido.model.js'

// Pedido has many ItemPedido
Pedido.hasMany(ItemPedido, {
  foreignKey: 'idPedido',
  as: 'itens'
})

// ItemPedido belongs to Pedido
ItemPedido.belongsTo(Pedido, {
  foreignKey: 'idPedido',
  as: 'pedido'
})

// ItemPedido belongs to Prato
ItemPedido.belongsTo(Prato, {
  foreignKey: 'idPrato',
  as: 'prato'
})

// Prato has many ItemPedido
Prato.hasMany(ItemPedido, {
  foreignKey: 'idPrato'
})

// Pedido belongs to Cliente
Pedido.belongsTo(Cliente, {
  foreignKey: 'idCliente',
  as: 'cliente'
})

// Cliente has many Pedido
Cliente.hasMany(Pedido, {
  foreignKey: 'idCliente'
})

export { Cliente, Prato, Pedido, ItemPedido }
