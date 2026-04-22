import { 
    auth, 
    db,
    googleProvider, 
    githubProvider, 
    signInWithPopup, 
    onAuthStateChanged, 
    signOut,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from './firebase-config.js';

// Estados Globais (Reativos ao Firebase)
let groupsData = [];
let messages = [];
let feedData = []; 

let chatData = {
    group: [],
    direct: []
};

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

    googleBtn?.addEventListener('click', () => handleLogin('Google', googleBtn));
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
            // Se logado, o CTA pode levar para uma view específica
            switchView('groups');
        }
    });
}

async function handleLogin(method, btnElement) {
    if (btnElement) {
        btnElement.style.opacity = '0.6';
        btnElement.style.pointerEvents = 'none';
        const originalContent = btnElement.innerHTML;
        btnElement.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Entrando...`;
        if (window.lucide) window.lucide.createIcons();
    }

    const provider = method === 'GitHub' ? githubProvider : googleProvider;

    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Login realizado com sucesso:", result.user.email);
        })
        .catch((error) => {
            console.error("Erro detalhado no login:", error.code, error.message);
            
            let userMessage = "Falha no login.";
            if (error.code === 'auth/configuration-not-found') {
                userMessage = "Configuração do Firebase não encontrada. Verifique se o login do Google está ativado no Console.";
            } else if (error.code === 'auth/popup-closed-by-user') {
                userMessage = "O login foi cancelado (janela fechada).";
            } else if (error.code === 'auth/unauthorized-domain') {
                userMessage = "Este domínio não está autorizado no Firebase Console.";
            }

            alert(userMessage + " (" + error.code + ")");
            
            if (btnElement) {
                btnElement.innerHTML = originalContent;
                btnElement.style.opacity = '1';
                btnElement.style.pointerEvents = 'auto';
                if (window.lucide) window.lucide.createIcons();
            }
        });
}

function completeLogin() {
    if (!currentUser) return;

    // Esconde o modal e remove overlay
    document.getElementById('auth-overlay').classList.remove('active');
    
    // Atualiza o Header
    document.getElementById('user-profile').classList.remove('hidden');
    document.getElementById('header-cta').innerText = 'Dashboard';
    document.getElementById('nav-avatar').src = currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`;

    // Atualiza campos de settings
    const nameInput = document.getElementById('settings-name');
    const emailInput = document.getElementById('settings-email');
    if (nameInput) nameInput.value = currentUser.displayName || '';
    if (emailInput) emailInput.value = currentUser.email || '';

    render();
}

function logout() {
    signOut(auth).then(() => {
        location.reload();
    });
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
 * Funções de Grupos (Criação via Firestore)
 */
function openGroupModal() {
    document.getElementById('group-modal').classList.add('active');
}

function closeGroupModal() {
    document.getElementById('group-modal').classList.remove('active');
}

async function createNewGroup(e) {
    e.preventDefault();
    if (!currentUser) return alert("Você precisa estar logado!");

    const name = document.getElementById('new-group-name').value;
    const desc = document.getElementById('new-group-desc').value;

    try {
        await addDoc(collection(db, "groups"), {
            name: name,
            description: desc,
            members: 1,
            createdBy: currentUser.uid,
            createdAt: serverTimestamp()
        });

        closeGroupModal();
        document.getElementById('new-group-form').reset();
    } catch (error) {
        console.error("Erro ao criar grupo:", error);
        alert("Erro ao criar grupo no banco de dados.");
    }
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

async function sendMessage(chatId, text) {
    if (!currentUser) return;

    try {
        await addDoc(collection(db, "messages"), {
            chatId: chatId,
            text: text,
            senderId: currentUser.uid,
            senderName: currentUser.displayName || 'Anônimo',
            type: 'sent',
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
    }
}

/**
 * Inicializa os escutadores em tempo real do Firestore
 */
function initFirestoreListeners() {
    // Escuta Grupos
    const qGroups = query(collection(db, "groups"), orderBy("createdAt", "desc"));
    onSnapshot(qGroups, (snapshot) => {
        groupsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Atualiza chatData baseado nos grupos reais
        chatData.group = groupsData.map(g => ({
            id: g.id,
            name: g.name,
            lastMsg: "Conversa do grupo",
            time: "Ativo",
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${g.name}`
        }));

        render();
    });

    // Escuta Mensagens
    const qMessages = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    onSnapshot(qMessages, (snapshot) => {
        messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (activeChat) renderMessages();
    });
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
                <button class="btn-outline full-width" style="margin-top: 16px;" onclick="switchView('not-implemented')">Acessar Grátis</button>
            </div>
        </div>
    `).join('');
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Observador de estado de autenticação do Firebase
        onAuthStateChanged(auth, (user) => {
            if (user) {
                currentUser = user;
                completeLogin();
            } else {
                currentUser = null;
                document.getElementById('auth-overlay').classList.add('active');
            }
        });

        // Inicializa listeners do banco de dados
        initFirestoreListeners();
        
        initChat();
        initAuth();
        initNavigation();

        // Novos Listeners
        document.getElementById('profile-form')?.addEventListener('submit', saveProfile);
        document.getElementById('new-group-form')?.addEventListener('submit', createNewGroup);
    });
}

// Expor funções para o escopo global (necessário porque agora somos um módulo)
window.switchView = switchView;
window.toggleJoin = toggleJoin;
window.openGroupModal = openGroupModal;
window.closeGroupModal = closeGroupModal;
window.logout = logout;
window.openChat = openChat;

// Export para testes (se ambiente Node)
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
