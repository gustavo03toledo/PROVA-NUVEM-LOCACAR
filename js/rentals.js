// Lógica para a aba de Locações

const rentalForm = document.getElementById('rental-form');
const rentalList = document.getElementById('rental-list');
const rentalFormContainer = document.getElementById('rental-form-container');
const rentalClientSelect = document.getElementById('rental-client');
const rentalVehicleSelect = document.getElementById('rental-vehicle');

async function renderRentalList() {
    const rentals = await apiFetch('/locacoes');
    rentalList.innerHTML = '';
    rentals.forEach(rental => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <span>Cliente: ${rental.cliente_nome} | Veículo: ${rental.veiculo_marca} ${rental.veiculo_modelo} | De: ${new Date(rental.data_inicio).toLocaleDateString()} | Até: ${new Date(rental.data_fim).toLocaleDateString()}</span>
            <div>
                <button onclick="cancelRental(${rental.id})">Cancelar</button>
            </div>
        `;
        rentalList.appendChild(item);
    });
}

async function populateRentalFormSelects() {
    // Popula clientes
    rentalClientSelect.innerHTML = '<option value="">Selecione um Cliente</option>';
    const clients = await apiFetch('/clientes');
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.nome;
        rentalClientSelect.appendChild(option);
    });

    // Popula veículos disponíveis
    rentalVehicleSelect.innerHTML = '<option value="">Selecione um Veículo</option>';
    const vehicles = await apiFetch('/veiculos?disponibilidade=true');
    vehicles.forEach(vehicle => {
        const option = document.createElement('option');
        option.value = vehicle.id;
        option.textContent = `${vehicle.marca} ${vehicle.modelo}`;
        rentalVehicleSelect.appendChild(option);
    });
}

function showRentalForm() {
    rentalForm.reset();
    document.getElementById('rental-id').value = '';
    populateRentalFormSelects();
    rentalFormContainer.style.display = 'block';
}

function hideRentalForm() {
    rentalFormContainer.style.display = 'none';
}

// A API não suporta edição de locação, apenas cancelamento
// function editRental(id) { ... }

async function cancelRental(id) {
    if (confirm('Tem certeza que deseja cancelar esta locação?')) {
        await apiFetch(`/locacoes/${id}/cancelar`, { method: 'PUT' });
        renderRentalList();
    }
}

rentalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // A API não suporta edição, apenas criação
    const rental = {
        cliente_id: parseInt(document.getElementById('rental-client').value),
        veiculo_id: parseInt(document.getElementById('rental-vehicle').value),
        data_inicio: document.getElementById('rental-start-date').value,
        data_fim: document.getElementById('rental-end-date').value,
        valor: parseFloat(document.getElementById('rental-value').value),
    };

    await apiFetch('/locacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rental)
    });

    hideRentalForm();
    renderRentalList();
});
