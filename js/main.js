// Dados reais (Iniciam vazios para serem populados por usuários)
let groupsData = JSON.parse(localStorage.getItem('mindstack_groups')) || [];
let feedData = []; // Feed dinâmico (postagens recentes)

// Mock de Canais do Chat (Apenas estruturas, sem mensagens)
let chatData = {
    group: [],
    direct: []
};

let messages = JSON.parse(localStorage.getItem('mindstack_messages')) || [];

let activeChat = null;
let activeTab = 'group';
let currentUser = JSON.parse(localStorage.getItem('mindstack_user')) || null;

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

    // Autenticação Real com Google
    initGoogleAuth();
    
    googleBtn?.addEventListener('click', () => {
        google.accounts.id.prompt(); // Abre o popup real do Google
    });

    githubBtn?.addEventListener('click', () => handleLogin('GitHub', githubBtn));
    emailForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = emailForm.querySelector('button');
        handleLogin('E-mail', submitBtn);
    });

    headerCta?.addEventListener('click', () => {
        if (!currentUser) {
            document.getElementById('auth-overlay').classList.add('active');
        } else {
            switchView('groups');
        }
    });
}

/**
 * Google Identity Services Integration
 */
function initGoogleAuth() {
    if (typeof google === 'undefined') return;

    google.accounts.id.initialize({
        client_id: "SEU_CLIENT_ID_AQUI.apps.googleusercontent.com", // Substituir pelo real
        callback: handleGoogleResponse,
        cancel_on_tap_outside: false
    });
}

function handleGoogleResponse(response) {
    // Decodifica o payload do JWT retornado pelo Google
    const payload = decodeJwt(response.credential);
    
    currentUser = {
        name: payload.name,
        email: payload.email,
        method: 'Google',
        avatar: payload.picture,
        googleId: payload.sub
    };

    localStorage.setItem('mindstack_user', JSON.stringify(currentUser));
    completeLogin();
}

function decodeJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function handleLogin(method, btnElement) {
    if (btnElement) {
        btnElement.style.opacity = '0.6';
        btnElement.style.pointerEvents = 'none';
        const originalContent = btnElement.innerHTML;
        btnElement.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Entrando...`;
        if (window.lucide) window.lucide.createIcons();

        setTimeout(() => {
            currentUser = {
                name: "Usuário MindStack",
                email: "user@mindstack.ai",
                method: method,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
            };

            localStorage.setItem('mindstack_user', JSON.stringify(currentUser));
            
            // Reverte botão para estado original antes de sumir
            btnElement.innerHTML = originalContent;
            btnElement.style.opacity = '1';
            btnElement.style.pointerEvents = 'auto';
            if (window.lucide) window.lucide.createIcons();

            completeLogin();
        }, 1500);
    }
}

function completeLogin() {
    if (!currentUser) return;

    // Esconde o modal e remove overlay
    document.getElementById('auth-overlay').classList.remove('active');
    
    // Atualiza o Header
    document.getElementById('user-profile').classList.remove('hidden');
    document.getElementById('header-cta').innerText = 'Dashboard';
    document.getElementById('nav-avatar').src = currentUser.avatar;

    // Atualiza campos de settings
    const nameInput = document.getElementById('settings-name');
    const emailInput = document.getElementById('settings-email');
    if (nameInput) nameInput.value = currentUser.name;
    if (emailInput) emailInput.value = currentUser.email;

    render();
}

function logout() {
    localStorage.removeItem('mindstack_user');
    location.reload();
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
        id: Date.now(),
        name: name,
        description: desc,
        members: 1,
        joined: true
    };

    groupsData.unshift(newGroup);
    
    // Salva grupos no localStorage
    localStorage.setItem('mindstack_groups', JSON.stringify(groupsData));
    
    // Adiciona ao chatData para ser funcional imediatamente
    chatData.group.push({
        id: newGroup.id,
        name: newGroup.name,
        lastMsg: "Grupo criado agora",
        time: "Agora",
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${newGroup.name}`
    });

    closeGroupModal();
    render();
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
    const newMsg = { chatId, text, type: 'sent' };
    messages.push(newMsg);
    
    // Persiste mensagens
    localStorage.setItem('mindstack_messages', JSON.stringify(messages));
    
    renderMessages();
}

/**
 * Renderiza os dados na tela
 */
function render() {
    const groupsContainer = document.getElementById('groups-container');
    const feedContainer = document.getElementById('recent-feed');

    if (groupsContainer) {
        if (groupsData.length === 0) {
            groupsContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; background: white; border-radius: 20px; border: 2px dashed var(--border);">
                    <i data-lucide="users" style="width: 48px; height: 48px; color: var(--border); margin-bottom: 16px;"></i>
                    <h3 style="color: var(--text-secondary);">Nenhum grupo ainda</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 24px;">Seja o primeiro a criar uma comunidade incrível!</p>
                    <button class="btn-primary" onclick="openGroupModal()">Criar meu primeiro Grupo</button>
                </div>
            `;
        } else {
            groupsContainer.innerHTML = groupsData.map(createGroupCard).join('');
        }
    }

    if (feedContainer) {
        if (feedData.length === 0) {
            feedContainer.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: 20px; font-size: 14px;">
                    Nenhuma atividade recente.
                </div>
            `;
        } else {
            feedContainer.innerHTML = feedData.map(createFeedItem).join('');
        }
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
                <button class="btn-outline full-width" style="margin-top: 16px;" onclick="switchView('not-implemented')">Acessar Programa</button>
            </div>
        </div>
    `).join('');
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Verifica se já está logado
        if (currentUser) {
            completeLogin();
        } else {
            // Se não logado e não está na home, força login modal
            document.getElementById('auth-overlay').classList.add('active');
        }

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
