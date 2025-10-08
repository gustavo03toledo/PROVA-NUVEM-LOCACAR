// Lógica para a aba de Veículos

const vehicleForm = document.getElementById('vehicle-form');
const vehicleList = document.getElementById('vehicle-list');
const vehicleFormContainer = document.getElementById('vehicle-form-container');

async function renderVehicleList() {
    const brand = document.getElementById('search-brand').value;
    const model = document.getElementById('search-model').value;
    
    const query = new URLSearchParams({ brand, model }).toString();
    const vehicles = await apiFetch(`/veiculos?${query}`);
    
    vehicleList.innerHTML = '';
    vehicles.forEach(vehicle => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <span>${vehicle.marca} ${vehicle.modelo} (${vehicle.ano}) - Placa: ${vehicle.placa} - ${vehicle.disponivel ? 'Disponível' : 'Indisponível'} - R$ ${vehicle.preco_diaria}/dia</span>
            <div>
                <button onclick="editVehicle(${vehicle.id})">Editar</button>
                <button onclick="deleteVehicle(${vehicle.id})">Excluir</button>
            </div>
        `;
        vehicleList.appendChild(item);
    });
}

function showVehicleForm() {
    vehicleForm.reset();
    document.getElementById('vehicle-id').value = '';
    vehicleFormContainer.style.display = 'block';
}

function hideVehicleForm() {
    vehicleFormContainer.style.display = 'none';
}

async function editVehicle(id) {
    // A API não tem um endpoint para buscar um único veículo, então vamos buscar na lista já renderizada
    const vehicles = await apiFetch('/veiculos');
    const vehicle = vehicles.find(v => v.id === id);

    if (vehicle) {
        document.getElementById('vehicle-id').value = vehicle.id;
        document.getElementById('vehicle-brand').value = vehicle.marca;
        document.getElementById('vehicle-model').value = vehicle.modelo;
        document.getElementById('vehicle-year').value = vehicle.ano;
        document.getElementById('vehicle-plate').value = vehicle.placa;
        document.getElementById('vehicle-availability').value = vehicle.disponivel;
        document.getElementById('vehicle-price').value = vehicle.preco_diaria;
        vehicleFormContainer.style.display = 'block';
    }
}

async function deleteVehicle(id) {
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
        await apiFetch(`/veiculos/${id}`, { method: 'DELETE' });
        renderVehicleList();
    }
}

vehicleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('vehicle-id').value;
    const vehicle = {
        marca: document.getElementById('vehicle-brand').value,
        modelo: document.getElementById('vehicle-model').value,
        ano: parseInt(document.getElementById('vehicle-year').value),
        placa: document.getElementById('vehicle-plate').value,
        disponivel: document.getElementById('vehicle-availability').value === 'true',
        preco_diaria: parseFloat(document.getElementById('vehicle-price').value),
    };

    if (id) {
        await apiFetch(`/veiculos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vehicle)
        });
    } else {
        await apiFetch('/veiculos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vehicle)
        });
    }

    hideVehicleForm();
    renderVehicleList();
});
