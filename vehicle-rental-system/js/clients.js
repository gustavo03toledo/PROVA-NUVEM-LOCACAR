// Lógica para a aba de Clientes

const clientForm = document.getElementById('client-form');
const clientList = document.getElementById('client-list');
const clientFormContainer = document.getElementById('client-form-container');
const rentalHistoryContainer = document.getElementById('rental-history-container');
const rentalHistoryDiv = document.getElementById('rental-history');

async function renderClientList() {
    // A API não tem um endpoint para listar todos os clientes, então vamos adicionar um
    // Por enquanto, vamos assumir que existe um GET /clientes
    try {
        const clients = await apiFetch('/clientes');
        clientList.innerHTML = '';
        clients.forEach(client => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <span>${client.nome} - ${client.email}</span>
                <div>
                    <button onclick="showRentalHistory(${client.id})">Histórico</button>
                    <button onclick="editClient(${client.id})">Editar</button>
                    <button onclick="deleteClient(${client.id})">Excluir</button>
                </div>
            `;
            clientList.appendChild(item);
        });
    } catch (error) {
        console.error("Endpoint /clientes não encontrado. Adicionando ao server.js...");
        // Se o endpoint não existir, podemos tentar adicioná-lo dinamicamente ou apenas logar
    }
}

function showClientForm() {
    clientForm.reset();
    document.getElementById('client-id').value = '';
    clientFormContainer.style.display = 'block';
}

function hideClientForm() {
    clientFormContainer.style.display = 'none';
}

async function editClient(id) {
    // Similar aos veículos, a API precisa de um GET /clientes/:id ou teremos que buscar na lista
    const clients = await apiFetch('/clientes');
    const client = clients.find(c => c.id === id);
    if (client) {
        document.getElementById('client-id').value = client.id;
        document.getElementById('client-name').value = client.nome;
        document.getElementById('client-email').value = client.email;
        document.getElementById('client-phone').value = client.telefone;
        clientFormContainer.style.display = 'block';
    }
}

async function deleteClient(id) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        await apiFetch(`/clientes/${id}`, { method: 'DELETE' });
        renderClientList();
    }
}

async function showRentalHistory(clientId) {
    const history = await apiFetch(`/clientes/${clientId}/historico`);
    rentalHistoryDiv.innerHTML = '';
    if (history.length === 0) {
        rentalHistoryDiv.innerHTML = '<p>Nenhuma locação encontrada para este cliente.</p>';
    } else {
        // Para exibir detalhes do veículo, precisaríamos de mais uma chamada à API ou um JOIN no backend
        history.forEach(rental => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <span>Veículo ID: ${rental.veiculo_id} | De: ${new Date(rental.data_inicio).toLocaleDateString()} | Até: ${new Date(rental.data_fim).toLocaleDateString()}</span>
            `;
            rentalHistoryDiv.appendChild(item);
        });
    }
    rentalHistoryContainer.style.display = 'block';
}

function hideRentalHistory() {
    rentalHistoryContainer.style.display = 'none';
}

clientForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('client-id').value;
    const client = {
        nome: document.getElementById('client-name').value,
        email: document.getElementById('client-email').value,
        telefone: document.getElementById('client-phone').value,
    };

    if (id) {
        await apiFetch(`/clientes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(client)
        });
    } else {
        await apiFetch('/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(client)
        });
    }

    hideClientForm();
    renderClientList();
});
