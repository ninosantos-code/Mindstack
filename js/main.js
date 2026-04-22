// Mock de dados para Grupos
const groupsData = [
    {
        id: 1,
        name: "Mindset Evolution",
        description: "Explore as fronteiras da mente e aprenda técnicas avançadas de alta performance e foco.",
        members: 1240,
        joined: false
    },
    {
        id: 2,
        name: "Desenvolvedores Stack",
        description: "Comunidade focada em tecnologias modernas, arquitetura de software e carreira tech.",
        members: 850,
        joined: true
    },
    {
        id: 3,
        name: "Marketing Digital 2026",
        description: "Estratégias de lançamento, tráfego pago e automação com inteligência artificial.",
        members: 3100,
        joined: false
    },
    {
        id: 4,
        name: "Saúde & Biohacking",
        description: "Discussões sobre otimização biológica, sono, dieta e longevidade para empreendedores.",
        members: 420,
        joined: false
    },
    {
        id: 5,
        name: "Liderança Criativa",
        description: "Desenvolva habilidades de gestão de pessoas e cultura organizacional em ambientes dinâmicos.",
        members: 920,
        joined: false
    },
    {
        id: 6,
        name: "Investimentos & Crypto",
        description: "Análise de mercado, teses de investimento e o futuro das finanças descentralizadas.",
        members: 5600,
        joined: true
    }
];

// Mock de dados para Feed
const feedData = [
    {
        id: 101,
        user: "Ana Silva",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
        content: "Acabei de finalizar o módulo de React Avançado! Que jornada incrível.",
        time: "Há 5 min"
    },
    {
        id: 102,
        user: "Carlos Mendes",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
        content: "Alguém para discutir a nova atualização do Next.js?",
        time: "Há 12 min"
    },
    {
        id: 103,
        user: "Juliana Costa",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juliana",
        content: "O meetup de ontem sobre IA foi transformador. Recomendo a todos!",
        time: "Há 45 min"
    }
];

/**
 * Função para criar o HTML de um card de grupo
 */
function createGroupCard(group) {
    return `
        <div class="group-card" data-id="${group.id}">
            <h3 class="group-name">${group.name}</h3>
            <p class="group-desc">${group.description}</p>
            <div class="group-footer">
                <div class="member-count">
                    <i data-lucide="users" style="width: 14px; height: 14px;"></i>
                    ${group.members.toLocaleString()} membros
                </div>
                <button class="btn-outline" onclick="toggleJoin(${group.id})">
                    ${group.joined ? 'Ver grupo' : 'Entrar no grupo'}
                </button>
            </div>
        </div>
    `;
}

/**
 * Função para criar o HTML de um item do feed
 */
function createFeedItem(post) {
    return `
        <div class="feed-item">
            <div class="feed-user">
                <img src="${post.avatar}" alt="${post.user}">
                <span class="feed-user-name">${post.user}</span>
            </div>
            <div class="feed-content">${post.content}</div>
            <div class="feed-time">${post.time}</div>
        </div>
    `;
}

/**
 * Renderiza os dados na tela
 */
function render() {
    const groupsContainer = document.getElementById('groups-container');
    const feedContainer = document.getElementById('recent-feed');

    if (groupsContainer) {
        groupsContainer.innerHTML = groupsData.map(createGroupCard).join('');
    }

    if (feedContainer) {
        feedContainer.innerHTML = feedData.map(createFeedItem).join('');
    }

    // Reinicializa ícones do Lucide
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

/**
 * Alterna o estado de participação em um grupo
 */
function toggleJoin(groupId) {
    const group = groupsData.find(g => g.id === groupId);
    if (group) {
        if (!group.joined) {
            group.joined = true;
            group.members++;
            alert(`Você entrou no grupo: ${group.name}!`);
        } else {
            console.log(`Navegando para o grupo: ${group.name}`);
            // Aqui seria redirecionamento ou abertura do grupo
        }
        render();
    }
}

// Inicialização segura para navegador
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        render();
    });
}

// Export para testes
if (typeof module !== 'undefined') {
    module.exports = { groupsData, toggleJoin };
}
