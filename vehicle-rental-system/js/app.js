// Lógica principal da aplicação e navegação

function showPage(pageId) {
    // Esconde todas as páginas
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });

    // Mostra a página selecionada
    const pageToShow = document.getElementById(pageId);
    if (pageToShow) {
        pageToShow.style.display = 'block';
    }

    // Renderiza a lista correspondente à página
    switch (pageId) {
        case 'vehicles':
            renderVehicleList();
            break;
        case 'clients':
            renderClientList();
            break;
        case 'rentals':
            renderRentalList();
            break;
    }
}

// Garante que a página inicial (Veículos) seja exibida ao carregar
document.addEventListener('DOMContentLoaded', () => {
    showPage('vehicles');
});
