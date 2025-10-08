// Arquivo de configuração da API
const API_URL = 'http://localhost:3000';

// Funções auxiliares para fazer requisições
async function apiFetch(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ocorreu um erro na API');
    }
    // Retorna o JSON apenas se houver conteúdo
    if (response.status !== 204) {
        return response.json();
    }
}
