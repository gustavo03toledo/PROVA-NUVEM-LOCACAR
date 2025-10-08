const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do Pool de Conexões com o Banco de Dados Azure MySQL
const pool = mysql.createPool({
    host: "server-bd-cn1.mysql.database.azure.com",
    user: "useradmin",
    password: "admin@123",
    database: "locadora_db",
    port: 3306,
    ssl: {
        rejectUnauthorized: true
    }
});

// Teste explícito de conexão
pool.getConnection((err, connection) => {
    if (err) {
        console.error("--- FALHA NA CONEXÃO COM O BANCO DE DADOS ---");
        console.error("Erro:", err.message);
        console.error("Código do Erro:", err.code);
        console.log("\nPossíveis Causas:");
        console.log("1. O 'Host' está incorreto? Verifique se usou o nome completo do portal Azure.");
        console.log("2. A senha está correta?");
        console.log("3. O seu IP atual está liberado no Firewall do Azure?");
        process.exit(1);
        return;
    }
    console.log("+++ CONEXÃO COM O AZURE MYSQL BEM-SUCEDIDA! +++");
    console.log(`Conectado ao servidor: ${connection.config.host}`);
    connection.release();
});

// --- Endpoints para Veículos ---

// POST /veiculos: Cadastra um novo veículo
app.post('/veiculos', (req, res) => {
    const { marca, modelo, ano, placa, preco_diaria, disponivel } = req.body;
    const query = 'INSERT INTO veiculos (marca, modelo, ano, placa, preco_diaria, disponivel) VALUES (?, ?, ?, ?, ?, ?)';
    pool.query(query, [marca, modelo, ano, placa, preco_diaria, disponivel], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: results.insertId, ...req.body });
    });
});

// GET /veiculos: Lista todos os veículos com filtros
app.get('/veiculos', (req, res) => {
    let query = 'SELECT * FROM veiculos';
    const { marca, modelo, disponibilidade } = req.query;
    const filters = [];
    const values = [];

    if (marca) {
        filters.push('marca LIKE ?');
        values.push(`%${marca}%`);
    }
    if (modelo) {
        filters.push('modelo LIKE ?');
        values.push(`%${modelo}%`);
    }
    if (disponibilidade) {
        filters.push('disponivel = ?');
        values.push(disponibilidade === 'true');
    }

    if (filters.length > 0) {
        query += ' WHERE ' + filters.join(' AND ');
    }

    pool.query(query, values, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// PUT /veiculos/:id: Atualiza um veículo
app.put('/veiculos/:id', (req, res) => {
    const { id } = req.params;
    const { marca, modelo, ano, placa, preco_diaria, disponivel } = req.body;
    const query = 'UPDATE veiculos SET marca = ?, modelo = ?, ano = ?, placa = ?, preco_diaria = ?, disponivel = ? WHERE id = ?';
    pool.query(query, [marca, modelo, ano, placa, preco_diaria, disponivel, id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Veículo não encontrado' });
        res.json({ message: 'Veículo atualizado com sucesso' });
    });
});

// DELETE /veiculos/:id: Exclui um veículo
app.delete('/veiculos/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM veiculos WHERE id = ?';
    pool.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Veículo não encontrado' });
        res.status(204).send();
    });
});


// --- Endpoints para Clientes ---

// GET /clientes: Lista todos os clientes
app.get('/clientes', (req, res) => {
    const query = 'SELECT * FROM clientes';
    pool.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST /clientes: Cadastra um novo cliente
app.post('/clientes', (req, res) => {
    const { nome, email, telefone } = req.body;
    const query = 'INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)';
    pool.query(query, [nome, email, telefone], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: results.insertId, ...req.body });
    });
});

// PUT /clientes/:id: Atualiza um cliente
app.put('/clientes/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone } = req.body;
    const query = 'UPDATE clientes SET nome = ?, email = ?, telefone = ? WHERE id = ?';
    pool.query(query, [nome, email, telefone, id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Cliente não encontrado' });
        res.json({ message: 'Cliente atualizado com sucesso' });
    });
});

// DELETE /clientes/:id: Exclui um cliente
app.delete('/clientes/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM clientes WHERE id = ?';
    pool.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Cliente não encontrado' });
        res.status(204).send();
    });
});

// GET /clientes/:id/historico: Retorna o histórico de locações de um cliente
app.get('/clientes/:id/historico', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM locacoes WHERE cliente_id = ?';
    pool.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// --- Endpoints para Locações ---

// GET /locacoes: Lista todas as locações
app.get('/locacoes', (req, res) => {
    // Um JOIN para trazer nomes em vez de apenas IDs
    const query = `
        SELECT 
            locacoes.*, 
            clientes.nome as cliente_nome, 
            veiculos.marca as veiculo_marca, 
            veiculos.modelo as veiculo_modelo 
        FROM locacoes
        JOIN clientes ON locacoes.cliente_id = clientes.id
        JOIN veiculos ON locacoes.veiculo_id = veiculos.id
    `;
    pool.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST /locacoes: Cria uma nova locação
app.post('/locacoes', (req, res) => {
    const { cliente_id, veiculo_id, data_inicio, data_fim, valor_total, status } = req.body;
    pool.getConnection((err, connection) => {
        if (err) return res.status(500).json({ error: err.message });
        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: err.message });
            }
            const insertQuery = 'INSERT INTO locacoes (cliente_id, veiculo_id, data_inicio, data_fim, valor_total, status) VALUES (?, ?, ?, ?, ?, ?)';
            connection.query(insertQuery, [cliente_id, veiculo_id, data_inicio, data_fim, valor_total, status || 'ativa'], (err, results) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ error: err.message });
                    });
                }
                const updateQuery = 'UPDATE veiculos SET disponivel = false WHERE id = ?';
                connection.query(updateQuery, [veiculo_id], (err, updateResults) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: err.message });
                        });
                    }
                    connection.commit(err => {
                        connection.release();
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        res.status(201).json({ message: 'Locação criada e veículo atualizado para indisponível.' });
                    });
                });
            });
        });
    });
});

// PUT /locacoes/:id/cancelar: Cancela uma locação
app.put('/locacoes/:id/cancelar', (req, res) => {
    const { id } = req.params;
    pool.getConnection((err, connection) => {
        if (err) return res.status(500).json({ error: err.message });
        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                return res.status(500).json({ error: err.message });
            }
            // Primeiro, obtemos o ID do veículo da locação que está sendo cancelada
            const findVehicleQuery = 'SELECT veiculo_id FROM locacoes WHERE id = ?';
            connection.query(findVehicleQuery, [id], (err, locacaoResults) => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ error: err.message });
                    });
                }
                if (locacaoResults.length === 0) {
                    return connection.rollback(() => {
                        connection.release();
                        res.status(404).json({ message: 'Locação não encontrada' });
                    });
                }
                const veiculo_id = locacaoResults[0].veiculo_id;
                // Aqui, vamos apenas deletar a locação para simplificar
                const deleteQuery = 'DELETE FROM locacoes WHERE id = ?';
                connection.query(deleteQuery, [id], (err, deleteResult) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: err.message });
                        });
                    }
                    // Atualiza o status do veículo para disponível
                    const updateVehicleQuery = 'UPDATE veiculos SET disponibilidade = true WHERE id = ?';
                    connection.query(updateVehicleQuery, [veiculo_id], (err, updateResult) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ error: err.message });
                            });
                        }
                        connection.commit(err => {
                            connection.release();
                            if (err) {
                                return res.status(500).json({ error: err.message });
                            }
                            res.json({ message: 'Locação cancelada e veículo atualizado para disponível.' });
                        });
                    });
                });
            });
        });
    });
});


// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor da API rodando em http://localhost:${port}`);
});
