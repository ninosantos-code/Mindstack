/**
 * MindStack Apple-Style Test Suite
 * "The only way to be sure is to test with elegance."
 */

const { groupsData, toggleJoin } = require('./main.js');

// Configuração básica do Runner
const styles = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    blue: "\x1b[34m",
    gray: "\x1b[90m"
};

const symbols = {
    pass: "●",
    fail: "○",
    skip: "◌",
    separator: "—"
};

function describe(name, fn) {
    console.log(`\n${styles.bright}${name}${styles.reset}`);
    console.log(`${styles.gray}${symbols.separator.repeat(name.length)}${styles.reset}`);
    fn();
}

function test(name, fn) {
    try {
        fn();
        console.log(`  ${styles.green}${symbols.pass}${styles.reset} ${name}`);
    } catch (error) {
        console.log(`  ${styles.red}${symbols.fail}${styles.reset} ${name}`);
        console.error(`     ${styles.red}Error: ${error.message}${styles.reset}`);
    }
}

function expect(actual) {
    return {
        toBe(expected) {
            if (actual !== expected) {
                throw new Error(`Expected ${expected} but got ${actual}`);
            }
        },
        toBeTruthy() {
            if (!actual) {
                throw new Error(`Expected truthy value but got ${actual}`);
            }
        }
    };
}

// Mock da função global de alert e DOM para os testes
global.alert = (msg) => console.log(`     ${styles.blue}Alert Mocked:${styles.reset} ${msg}`);
global.document = {
    getElementById: () => ({ innerHTML: "" }),
    addEventListener: () => {}
};
global.window = {
    lucide: { createIcons: () => {} }
};

// --- Testes Reais ---

describe("Comunidade MindStack: Lógica de Grupos", () => {
    
    test("Deve iniciar com dados de teste carregados", () => {
        expect(groupsData.length).toBe(6);
    });

    test("Deve permitir a entrada em um grupo (toggleJoin)", () => {
        const groupId = 1;
        const initialMembers = groupsData.find(g => g.id === groupId).members;
        
        toggleJoin(groupId);
        
        const groupAfter = groupsData.find(g => g.id === groupId);
        expect(groupAfter.joined).toBeTruthy();
        expect(groupAfter.members).toBe(initialMembers + 1);
    });

    test("Não deve incrementar membros se o usuário já estiver no grupo", () => {
        const groupId = 2; // Grupo já unido no mock
        const initialMembers = groupsData.find(g => g.id === groupId).members;
        
        toggleJoin(groupId);
        
        const groupAfter = groupsData.find(g => g.id === groupId);
        expect(groupAfter.members).toBe(initialMembers);
    });

});

console.log(`\n${styles.gray}Finalizado em ${new Date().toLocaleTimeString()}${styles.reset}\n`);
