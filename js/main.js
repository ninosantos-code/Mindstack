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
let currentUser = null;

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
 * Funções de Autenticação
 */
function initAuth() {
    const googleBtn = document.getElementById('login-google');
    const githubBtn = document.getElementById('login-github');
    const emailForm = document.getElementById('login-email-form');
    const headerCta = document.getElementById('header-cta');

    googleBtn?.addEventListener('click', () => handleLogin('Google'));
    githubBtn?.addEventListener('click', () => handleLogin('GitHub'));
    emailForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin('E-mail');
    });

    headerCta?.addEventListener('click', () => {
        if (!currentUser) {
            document.getElementById('auth-overlay').classList.add('active');
        }
    });
}

function handleLogin(method) {
    console.log(`Logando com ${method}...`);
    
    // Simulação de delay de rede
    const btn = event?.currentTarget;
    if (btn) btn.style.opacity = '0.5';

    setTimeout(() => {
        currentUser = {
            name: "Diogo Santos",
            email: "diogo@mindstack.ai",
            method: method,
            avatar: method === 'GitHub' ? "https://github.com/ninosantos-code.png" : "https://api.dicebear.com/7.x/avataaars/svg?seed=Diogo"
        };

        completeLogin();
    }, 1000);
}

function completeLogin() {
    // Esconde o modal
    document.getElementById('auth-overlay').classList.remove('active');
    
    // Atualiza o Header
    document.getElementById('user-profile').classList.remove('hidden');
    document.getElementById('header-cta').innerText = 'Dashboard';
    document.getElementById('nav-avatar').src = currentUser.avatar;

    // Atualiza campos de settings com dados do usuário
    const nameInput = document.getElementById('settings-name');
    const emailInput = document.getElementById('settings-email');
    if (nameInput) nameInput.value = currentUser.name;
    if (emailInput) emailInput.value = currentUser.email;

    alert(`Bem-vindo, ${currentUser.name}! Autenticado via ${currentUser.method}.`);
}

/**
 * Funções de Perfil & Configurações
 */
function saveProfile(e) {
    e.preventDefault();
    const name = document.getElementById('settings-name').value;
    const email = document.getElementById('settings-email').value;

    if (currentUser) {
        currentUser.name = name;
        currentUser.email = email;
        
        // Atualiza UI global
        document.getElementById('nav-avatar').src = currentUser.avatar;
        alert("Perfil atualizado com sucesso!");
    }
}

/**
 * Funções de Grupos (Criação)
 */
function openGroupModal() {
    document.getElementById('group-modal').classList.add('active');
}

function closeGroupModal() {
    document.getElementById('group-modal').classList.remove('active');
}

function createNewGroup(e) {
    e.preventDefault();
    const name = document.getElementById('new-group-name').value;
    const desc = document.getElementById('new-group-desc').value;

    const newGroup = {
        id: groupsData.length + 1,
        name: name,
        description: desc,
        members: 1,
        joined: true
    };

    groupsData.unshift(newGroup); // Adiciona no início
    closeGroupModal();
    render();
    alert(`Grupo "${name}" criado com sucesso!`);
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
            const text = input.value;
            // Efeito divertido: se começar com /gif, simula imagem
            if (text.startsWith('/gif')) {
                sendSpecialMessage(activeChat.id, 'gif');
            } else {
                sendMessage(activeChat.id, text);
            }
            input.value = '';
        }
    });

    renderChatList();
}

function sendSpecialMessage(chatId, type) {
    if (type === 'gif') {
        const gifUrl = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueW94bmR6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6Z3R6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKSjPPrTVf997JS/giphy.gif";
        messages.push({ 
            chatId, 
            text: `<img src="${gifUrl}" style="width: 100%; border-radius: 8px; margin-top: 5px;">`, 
            type: 'sent',
            isRich: true
        });
    }
    renderMessages();
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
        <div class="message ${m.type}">
            ${m.text}
            <div style="font-size: 10px; opacity: 0.5; margin-top: 4px; text-align: right;">
                ${m.type === 'sent' ? '✓✓ Visualizado' : ''}
            </div>
        </div>
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
/**
 * Router & Navigation
 */
function switchView(viewId) {
    const views = document.querySelectorAll('.view');
    const navLinks = document.querySelectorAll('.nav-list a');

    views.forEach(v => v.classList.add('hidden'));
    document.getElementById(`view-${viewId}`)?.classList.remove('hidden');

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.view === viewId) link.classList.add('active');
    });

    // Ações específicas por View
    if (viewId === 'programs') renderPrograms();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initNavigation() {
    const navList = document.getElementById('main-nav-list');
    navList?.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.dataset.view) {
            e.preventDefault();
            switchView(link.dataset.view);
        }
    });

    // Checkout form
    const paymentForm = document.getElementById('payment-form');
    paymentForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Pagamento processado com sucesso! Bem-vindo ao programa.');
        switchView('groups');
    });
}

/**
 * Funções de Programas
 */
const programsData = [
    { title: "Protocolo Foco Total", tag: "Mindset", icon: "🧠" },
    { title: "Mestre da Persuasão", tag: "Business", icon: "🤝" },
    { title: "Código de Elite", tag: "Tech", icon: "💻" },
    { title: "Investidor Alfa", tag: "Finanças", icon: "📈" }
];

function renderPrograms() {
    const container = document.getElementById('programs-container');
    if (!container) return;

    container.innerHTML = programsData.map(p => `
        <div class="program-card">
            <div class="program-img">${p.icon}</div>
            <div class="program-info">
                <span class="program-tag">${p.tag}</span>
                <h3>${p.title}</h3>
                <button class="btn-outline full-width" style="margin-top: 16px;" onclick="switchView('checkout')">Assinar Agora</button>
            </div>
        </div>
    `).join('');
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        render();
        initChat();
        initAuth();
        initNavigation();

        // Novos Listeners
        document.getElementById('profile-form')?.addEventListener('submit', saveProfile);
        document.getElementById('new-group-form')?.addEventListener('submit', createNewGroup);
    });
}

// Export para testes
if (typeof module !== 'undefined') {
    module.exports = { 
        groupsData, 
        toggleJoin, 
        messages, 
        sendMessage, 
        chatData,
        handleLogin,
        currentUser,
        switchView,
        createNewGroup,
        saveProfile
    };
}
