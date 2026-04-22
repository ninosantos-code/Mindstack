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

// Mock de Chat
const chatData = {
    group: [
        { id: 201, name: "Mindset Evolution", lastMsg: "Sejam bem-vindos!", time: "10:30", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ME" },
        { id: 202, name: "Desenvolvedores Stack", lastMsg: "Viram o novo framework?", time: "09:45", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DS" }
    ],
    direct: [
        { id: 301, name: "Ana Silva", lastMsg: "Oi, tudo bem?", time: "Ontem", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" },
        { id: 302, name: "Carlos Mendes", lastMsg: "Valeu pela ajuda!", time: "2 dias", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos" }
    ]
};

let messages = [
    { chatId: 201, text: "Olá grupo!", type: "received" },
    { chatId: 201, text: "Sejam bem-vindos!", type: "received" },
];

let activeChat = null;
let activeTab = 'group';

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
 * Funções de Chat
 */
function initChat() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatPanel = document.getElementById('chat-panel');
    const chatClose = document.getElementById('chat-close');
    const tabs = document.querySelectorAll('.chat-tab');
    const backBtn = document.getElementById('back-to-list');
    const chatForm = document.getElementById('chat-form');

    chatToggle?.addEventListener('click', () => chatPanel?.classList.toggle('active'));
    chatClose?.addEventListener('click', () => chatPanel?.classList.remove('active'));

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeTab = tab.dataset.tab;
            renderChatList();
        });
    });

    backBtn?.addEventListener('click', () => {
        document.getElementById('chat-messages-container')?.classList.add('hidden');
    });

    chatForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        if (input.value.trim() && activeChat) {
            sendMessage(activeChat.id, input.value);
            input.value = '';
        }
    });

    renderChatList();
}

function renderChatList() {
    const list = document.getElementById('chat-list');
    if (!list) return;

    list.innerHTML = chatData[activeTab].map(item => `
        <div class="chat-item" onclick="openChat(${item.id}, '${activeTab}')">
            <img src="${item.avatar}" alt="${item.name}">
            <div class="chat-item-info">
                <div class="chat-item-name">
                    ${item.name}
                    <span class="chat-item-time">${item.time}</span>
                </div>
                <div class="chat-item-last">${item.lastMsg}</div>
            </div>
        </div>
    `).join('');
}

function openChat(id, type) {
    const chat = chatData[type].find(c => c.id === id);
    if (!chat) return;

    activeChat = chat;
    document.getElementById('active-chat-name').innerText = chat.name;
    document.getElementById('chat-messages-container').classList.remove('hidden');
    renderMessages();
}

function renderMessages() {
    const container = document.getElementById('chat-messages');
    if (!container || !activeChat) return;

    const chatMessages = messages.filter(m => m.chatId === activeChat.id);
    container.innerHTML = chatMessages.map(m => `
        <div class="message ${m.type}">${m.text}</div>
    `).join('');
    container.scrollTop = container.scrollHeight;
}

function sendMessage(chatId, text) {
    messages.push({ chatId, text, type: 'sent' });
    renderMessages();
    
    // Simulação de Resposta
    setTimeout(() => {
        messages.push({ chatId, text: "Obrigado pela mensagem! Em breve te respondo.", type: 'received' });
        renderMessages();
    }, 1000);
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

    // Inicializa Chat se presente
    if (typeof document !== 'undefined') {
        const chatList = document.getElementById('chat-list');
        if (chatList) renderChatList();
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
        initChat();
    });
}

// Export para testes
if (typeof module !== 'undefined') {
    module.exports = { groupsData, toggleJoin, messages, sendMessage, chatData };
}
