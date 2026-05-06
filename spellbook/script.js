const TILE_SETS = {
    'en': { 'A': { v: 1, c: 9 }, 'B': { v: 3, c: 2 }, 'C': { v: 3, c: 2 }, 'D': { v: 2, c: 4 }, 'E': { v: 1, c: 12 }, 'F': { v: 4, c: 2 }, 'G': { v: 2, c: 3 }, 'H': { v: 4, c: 2 }, 'I': { v: 1, c: 9 }, 'J': { v: 8, c: 1 }, 'K': { v: 5, c: 1 }, 'L': { v: 1, c: 4 }, 'M': { v: 3, c: 2 }, 'N': { v: 1, c: 6 }, 'O': { v: 1, c: 8 }, 'P': { v: 3, c: 2 }, 'Q': { v: 10, c: 1 }, 'R': { v: 1, c: 6 }, 'S': { v: 1, c: 4 }, 'T': { v: 1, c: 6 }, 'U': { v: 1, c: 4 }, 'V': { v: 4, c: 2 }, 'W': { v: 4, c: 2 }, 'X': { v: 8, c: 1 }, 'Y': { v: 4, c: 2 }, 'Z': { v: 10, c: 1 }, '_': { v: 0, c: 2 } },
    'fr': { 'A': { v: 1, c: 9 }, 'B': { v: 3, c: 2 }, 'C': { v: 3, c: 2 }, 'D': { v: 2, c: 3 }, 'E': { v: 1, c: 15 }, 'F': { v: 4, c: 2 }, 'G': { v: 2, c: 2 }, 'H': { v: 4, c: 2 }, 'I': { v: 1, c: 8 }, 'J': { v: 8, c: 1 }, 'K': { v: 10, c: 1 }, 'L': { v: 1, c: 5 }, 'M': { v: 2, c: 3 }, 'N': { v: 1, c: 6 }, 'O': { v: 1, c: 6 }, 'P': { v: 3, c: 2 }, 'Q': { v: 8, c: 1 }, 'R': { v: 1, c: 6 }, 'S': { v: 1, c: 6 }, 'T': { v: 1, c: 6 }, 'U': { v: 1, c: 6 }, 'V': { v: 4, c: 2 }, 'W': { v: 10, c: 1 }, 'X': { v: 10, c: 1 }, 'Y': { v: 10, c: 1 }, 'Z': { v: 10, c: 1 }, '_': { v: 0, c: 2 } },
    'de': { 'A': { v: 1, c: 5 }, 'Ä': { v: 6, c: 1 }, 'B': { v: 3, c: 2 }, 'C': { v: 4, c: 2 }, 'D': { v: 1, c: 4 }, 'E': { v: 1, c: 15 }, 'F': { v: 4, c: 2 }, 'G': { v: 2, c: 3 }, 'H': { v: 2, c: 4 }, 'I': { v: 1, c: 6 }, 'J': { v: 6, c: 1 }, 'K': { v: 4, c: 2 }, 'L': { v: 2, c: 3 }, 'M': { v: 3, c: 4 }, 'N': { v: 1, c: 9 }, 'O': { v: 2, c: 3 }, 'Ö': { v: 8, c: 1 }, 'P': { v: 4, c: 1 }, 'Q': { v: 10, c: 1 }, 'R': { v: 1, c: 6 }, 'S': { v: 1, c: 7 }, 'T': { v: 1, c: 6 }, 'U': { v: 1, c: 6 }, 'Ü': { v: 6, c: 1 }, 'V': { v: 6, c: 1 }, 'W': { v: 3, c: 1 }, 'X': { v: 8, c: 1 }, 'Y': { v: 10, c: 1 }, 'Z': { v: 3, c: 1 }, '_': { v: 0, c: 2 } },
    'es': { 'A': { v: 1, c: 12 }, 'B': { v: 3, c: 2 }, 'C': { v: 3, c: 4 }, 'D': { v: 2, c: 5 }, 'E': { v: 1, c: 12 }, 'F': { v: 4, c: 1 }, 'G': { v: 2, c: 2 }, 'H': { v: 4, c: 2 }, 'I': { v: 1, c: 6 }, 'J': { v: 8, c: 1 }, 'L': { v: 1, c: 4 }, 'M': { v: 3, c: 2 }, 'N': { v: 1, c: 5 }, 'Ñ': { v: 8, c: 1 }, 'O': { v: 1, c: 9 }, 'P': { v: 3, c: 2 }, 'Q': { v: 5, c: 1 }, 'R': { v: 1, c: 5 }, 'S': { v: 1, c: 6 }, 'T': { v: 1, c: 4 }, 'U': { v: 1, c: 5 }, 'V': { v: 4, c: 1 }, 'X': { v: 8, c: 1 }, 'Y': { v: 4, c: 1 }, 'Z': { v: 10, c: 1 }, '_': { v: 0, c: 2 } }
};

const TRANSLATIONS = {
    'en': { title: "SpellBook", dict: "Dictionary", opp: "Opponent", ai_easy: "AI (Easy)", ai_med: "AI (Medium)", ai_hard: "AI (Hard)", local: "Local Multiplayer", names: "P1 / P2 Names", timer: "Timer (Minutes)", none: "None", dark: "Dark Mode", new_btn: "NEW GAME", res_btn: "RESUME PREVIOUS GAME", sub_btn: "SUBMIT", t_swap: "Swap Tiles", t_shuf: "Shuffle Rack", t_dict: "Dictionary Definitions", t_rec: "Recall Tiles", t_theme: "Toggle Theme", t_pass: "Pass Turn", t_res: "Resign / Quit Game", t_bag: "View Tile Bag", tiles_left: "Tiles Left", blank_title: "Select Letter for Blank", cancel: "Cancel", swap_title: "Swap Tiles", swap_desc: "Select tiles to trade back into the bag", swap_btn: "Swap Selected", dict_title: "Recent Definitions", close: "Close", bag_title: "Tiles Remaining", mana: "Mana", coupon: "Coupon", spell_market: "Spell Market", market_closed: "Market Closed", refresh_pass: "Refresh / Pass", cost_mana: "Cost: {0} Mana", p_market: "{0}'s Market", spell_cast: "Cast Spell:" },
    'fr': { title: "Sortographe", dict: "Dictionnaire", opp: "Adversaire", ai_easy: "IA (Facile)", ai_med: "IA (Moyen)", ai_hard: "IA (Difficile)", local: "Multijoueur Local", names: "Noms J1 / J2", timer: "Chronomètre (Min)", none: "Aucun", dark: "Mode Sombre", new_btn: "NOUVELLE PARTIE", res_btn: "REPRENDRE LA PARTIE", sub_btn: "VALIDER", t_swap: "Échanger", t_shuf: "Mélanger", t_dict: "Définitions", t_rec: "Rappeler", t_theme: "Changer le Thème", t_pass: "Passer le tour", t_res: "Quitter", t_bag: "Voir le sac", tiles_left: "Tuiles Restantes", blank_title: "Choisir une Lettre", cancel: "Annuler", swap_title: "Échanger des tuiles", swap_desc: "Sélectionnez les tuiles à remettre", swap_btn: "Échanger", dict_title: "Définitions Récentes", close: "Fermer", bag_title: "Tuiles Restantes", mana: "Mana", coupon: "Coupon", spell_market: "Marché Magique", market_closed: "Marché Fermé", refresh_pass: "Rafraîchir / Passer", cost_mana: "Coût: {0} Mana", p_market: "Marché de {0}", spell_cast: "Sort jeté:" },
    'de': { title: "Buchstabauberei", dict: "Wörterbuch", opp: "Gegner", ai_easy: "KI (Leicht)", ai_med: "KI (Mittel)", ai_hard: "KI (Schwer)", local: "Lokaler Mehrspieler", names: "S1 / S2 Name", timer: "Timer (Minuten)", none: "Keiner", dark: "Dunkelmodus", new_btn: "NEUES SPIEL", res_btn: "SPIEL FORTSETZEN", sub_btn: "ZUG BEENDEN", t_swap: "Tauschen", t_shuf: "Mischen", t_dict: "Definitionen", t_rec: "Zurückrufen", t_theme: "Design umschalten", t_pass: "Aussetzen", t_res: "Beenden", t_bag: "Säckchen ansehen", tiles_left: "Steine übrig", blank_title: "Buchstaben wählen", cancel: "Abbrechen", swap_title: "Steine tauschen", swap_desc: "Wähle Steine zum Tauschen", swap_btn: "Tauschen", dict_title: "Kürzliche Definitionen", close: "Schließen", bag_title: "Verbleibende Steine", mana: "Mana", coupon: "Gutschein", spell_market: "Zaubermarkt", market_closed: "Markt Geschlossen", refresh_pass: "Aktualisieren / Passen", cost_mana: "Kosten: {0} Mana", p_market: "Markt von {0}", spell_cast: "Zauber gewirkt:" },
    'es': { title: "Hechizolabras", dict: "Diccionario", opp: "Oponente", ai_easy: "IA (Fácil)", ai_med: "IA (Medio)", ai_hard: "IA (Difícil)", local: "Multijugador Local", names: "Nombres J1 / J2", timer: "Temporizador (Mins)", none: "Ninguno", dark: "Modo Oscuro", new_btn: "NUEVO JUEGO", res_btn: "REANUDAR JUEGO", sub_btn: "ENVIAR", t_swap: "Cambiar Fichas", t_shuf: "Mezclar", t_dict: "Definiciones", t_rec: "Recuperar", t_theme: "Cambiar Tema", t_pass: "Pasar Turno", t_res: "Salir", t_bag: "Ver Bolsa", tiles_left: "Fichas Restantes", blank_title: "Seleccionar comodín", cancel: "Cancelar", swap_title: "Cambiar Fichas", swap_desc: "Selecciona fichas para devolver", swap_btn: "Cambiar", dict_title: "Definiciones Recientes", close: "Cerrar", bag_title: "Fichas Restantes", mana: "Maná", coupon: "Cupón", spell_market: "Mercado Mágico", market_closed: "Mercado Cerrado", refresh_pass: "Actualizar / Pasar", cost_mana: "Costo: {0} Maná", p_market: "Mercado de {0}", spell_cast: "Hechizo lanzado:" }
};

let TILE_DATA = TILE_SETS['en'];
let currentLang = 'en';

const BONUSES = {
    '0,0': 'TW', '0,7': 'TW', '0,14': 'TW', '7,0': 'TW', '7,14': 'TW', '14,0': 'TW', '14,7': 'TW', '14,14': 'TW',
    '1,1': 'DW', '2,2': 'DW', '3,3': 'DW', '4,4': 'DW', '1,13': 'DW', '2,12': 'DW', '3,11': 'DW', '4,10': 'DW',
    '13,1': 'DW', '12,2': 'DW', '11,3': 'DW', '10,4': 'DW', '13,13': 'DW', '12,12': 'DW', '11,11': 'DW', '10,10': 'DW', '7,7': 'ST',
    '1,5': 'TL', '1,9': 'TL', '5,1': 'TL', '5,5': 'TL', '5,9': 'TL', '5,13': 'TL', '9,1': 'TL', '9,5': 'TL', '9,9': 'TL', '9,13': 'TL', '13,5': 'TL', '13,9': 'TL',
    '0,3': 'DL', '0,11': 'DL', '2,6': 'DL', '2,8': 'DL', '3,0': 'DL', '3,7': 'DL', '3,14': 'DL', '6,2': 'DL', '6,6': 'DL', '6,8': 'DL', '6,12': 'DL', '7,3': 'DL', '7,11': 'DL', '8,2': 'DL', '8,6': 'DL', '8,8': 'DL', '8,12': 'DL', '11,0': 'DL', '11,7': 'DL', '11,14': 'DL', '12,6': 'DL', '12,8': 'DL', '14,3': 'DL', '14,11': 'DL'
};

const SPELLS = {
    L1: [
        { id: 'shield', title: 'Shield', desc: 'Opponent cannot claim your tiles.', cost: 3, level: 1, duration: 2 },
        { id: 'bless', title: 'Bless', desc: 'Next move score is doubled.', cost: 3, level: 1 },
        { id: 'healing_word', title: 'Healing Word', desc: 'Claim and score an existing word on your next turn.', cost: 3, level: 1 },
        { id: 'burning_hands', title: 'Burning Hands', desc: 'Destroy a word and negate its points.', cost: 4, level: 1 },
        { id: 'find_familiar', title: 'Find Familiar', desc: 'Preview 3 possible words from your rack.', cost: 4, level: 1 },
        { id: 'sleep', title: 'Sleep', desc: '1d20: If 10+, opponent skips next turn.', cost: 4, level: 1 }
    ],
    L2: [
        { id: 'hold_person', title: 'Hold Person', desc: "Opponent cannot purchase spells next round.", cost: 5, level: 2 },
        { id: 'pass_without_trace', title: 'Pass Without Trace', desc: 'Play any 1d4+1 string as a valid word.', cost: 5, level: 2 },
        { id: 'suggestion', title: 'Suggestion', desc: '1d20: If 10+, opponent plays their worst move.', cost: 6, level: 2 },
        { id: 'invisibility', title: 'Invisibility', desc: 'A random tile becomes blank.', cost: 5, level: 2 },
        { id: 'web', title: 'Web', desc: '1d6 tiles stuck to rack for 2 rounds.', cost: 6, level: 2, duration: 4 },
        { id: 'mirror_image', title: 'Mirror Image', desc: 'Create a decoy move to trick opponent.', cost: 6, level: 2 },
        { id: 'aid', title: 'Aid', desc: 'See a move preview (Roll 1d20).', cost: 6, level: 2 }
    ],
    L3: [
        { id: 'counterspell', title: 'Counterspell', desc: "Negate opponent's last points or spell.", cost: 7, level: 3 },
        { id: 'haste', title: 'Haste', desc: 'Play two moves for 1d4 rounds.', cost: 7, level: 3 },
        { id: 'slow', title: 'Slow', desc: 'Opponent word length limit (1d4+2).', cost: 7, level: 3 },
        { id: 'fireball', title: 'Fireball', desc: 'Burn a 3x3 area on your next turn.', cost: 8, level: 3 },
        { id: 'revivify', title: 'Revivify', desc: 'Restore 1d4 dead tiles to the board.', cost: 8, level: 3 },
        { id: 'fly', title: 'Fly', desc: 'Next move can be placed anywhere.', cost: 8, level: 3 }
    ],
    L4: [
        { id: 'greater_invis', title: 'Greater Invisibility', desc: '1d4+1 tiles become blank.', cost: 10, level: 4 },
        { id: 'confusion', title: 'Confusion', desc: 'Opponent next move is random.', cost: 10, level: 4 },
        { id: 'fire_shield', title: 'Fire Shield', desc: 'Claiming your tiles skips their turn.', cost: 10, level: 4, duration: 2 }
    ],
    L5: [
        { id: 'greater_restoration', title: 'Greater Restoration', desc: 'Immunity to spells (1d4 rounds).', cost: 11, level: 5 },
        { id: 'telekinesis', title: 'Telekinesis', desc: "Make your opponent's next move for them.", cost: 12, level: 5 }
    ],
    L6: [
        { id: 'heal', title: 'Heal', desc: 'Regain all previously lost points.', cost: 14, level: 6 },
        { id: 'contingency', title: 'Contingency', desc: 'Cast a random spell when a condition is met.', cost: 14, level: 6 }
    ],
    L7: [
        { id: 'reverse_gravity', title: 'Reverse Gravity', desc: 'Board flips 180° for 1d4 rounds.', cost: 16, level: 7 },
        { id: 'simulacrum', title: 'Simulacrum', desc: 'An icy copy of opponent steals points (1d6 rds).', cost: 16, level: 7 },
        { id: 'project_image', title: 'Project Image', desc: 'An AI copy of you claims tiles (1d6 rds).', cost: 16, level: 7 }
    ],
    L8: [
        { id: 'demiplane', title: 'Demiplane', desc: 'Spawn a second rack with 1d6+1 tiles.', cost: 17, level: 8 },
        { id: 'true_polymorph', title: 'True Polymorph', desc: 'Turn one word into another random word.', cost: 17, level: 8 },
        { id: 'earthquake', title: 'Earthquake', desc: 'Shake board; tiles move 1d4 times.', cost: 18, level: 8 }
    ],
    L9: [
        { id: 'time_stop', title: 'Time Stop', desc: 'Skip opponent’s turn for 1d4 + 1 rounds.', cost: 19, level: 9 },
        { id: 'mass_polymorph', title: 'Mass Polymorph', desc: '2d4+2 words change to random ones.', cost: 21, level: 9 },
        { id: 'invulnerability', title: 'Invulnerability', desc: 'Immune to losing points/tiles (4d6 rds).', cost: 21, level: 9 },
        { id: 'true_resurrection', title: 'True Resurrection', desc: 'Rewind game 1d20 rounds.', cost: 22, level: 9 },
        { id: 'time_ravage', title: 'Time Ravage', desc: 'Fast-forward 1d6 + 1 rounds.', cost: 22, level: 9 },
        { id: 'gate', title: 'Gate', desc: 'Warp to a mid-game alternate dimension.', cost: 22, level: 9 },
        { id: 'weird', title: 'Weird', desc: 'Randomize all letters and point values.', cost: 22, level: 9 },
        { id: 'wish', title: 'Wish', desc: 'Cast any spell from the book.', cost: 25, level: 9 },
        { id: 'power_word_kill', title: 'Power Word Kill', desc: 'If opponent has < 100 points, win automatically.', cost: 20, level: 9 },
        { id: 'power_word_heal', title: 'Power Word Heal', desc: 'Revert all spells and restore lost points.', cost: 20, level: 9 }
    ]
};

let bag = [], racks = [[], []], secondaryRacks = [[], []], turn = 0, moveHistory = [], scores = [0, 0];
let boardState = Array(15).fill().map(() => Array(15).fill(null));
let playerNames = ["Player 1", "AI"], dictionary = new Set(), aiVocab = [], currentMove = [], focusedCell = { row: 7, col: 7, dir: 'right' };
let timers = [0, 0], timerInterval, gameConfig = {};
let selectedSwapIndices = new Set();
let pendingBlankCell = null;
let draggingData = null; 

let globalTurnCounter = 0;
let roundScores = [0, 0]; 
let bingoCoupons = [0, 0]; 
let isTimeRavaging = false;
let targetTimeRavageTurn = 0;
let timeRavageCallback = null;
let playerSpells = [[], []]; 
let marketActive = false;
let marketQueue = []; 
let queuedSpells = [];
let marketCurrentPlayer = null;
let marketCountdown = null;
let marketTimeLeft = 10;
let activeEffects = [{}, {}]; 
let couponActiveThisTurn = false;
let lostPoints = [0, 0];
let deadTiles = [];
let healingWordSelection = false;
let highlightedHealingCoords = [];
let fireballSelection = false;
let highlightedFireballCoords = [];
let reverseGravityRounds = 0;
let copyPlayer = null; // { type: 'simulacrum'|'project_image', owner: 0|1, rounds: N }
let gameHistory = []; // Buffer for True Resurrection
let polySelection = false;
let highlightedPolyCoords = [];
// Dice System Globals
let diceScene, diceCamera, diceRenderer, diceWorld, diceFloor;
let diceList = [], bodyList = [], diceData = [];
let activeDiceCallback = null;
const diceRadius = 1.5;

const DICE_CONFIG = {
    d4: { type: 'd4', vertices: [[1,1,1], [-1,-1,1], [-1,1,-1], [1,-1,-1]], faces: [[2,1,0], [0,3,2], [1,3,0], [2,3,1]] },
    d6: { type: 'd6', vertices: [[-1,-1,-1], [1,-1,-1], [1,1,-1], [-1,1,-1], [-1,-1,1], [1,-1,1], [1,1,1], [-1,1,1]], faces: [[0,3,2,1], [4,5,6,7], [0,1,5,4], [1,2,6,5], [2,3,7,6], [3,0,4,7]] },
    d10: { type: 'd10', vertices: [[0,0,1.5], [0,0,-1.5], [1,0,0.4], [0.3,0.9,0.4], [-0.8,0.6,0.4], [-0.8,-0.6,0.4], [0.3,-0.9,0.4], [0.8,0.3,-0.4], [-0.3,0.9,-0.4], [-1,0,-0.4], [-0.3,-0.9,-0.4], [0.8,-0.3,-0.4]], faces: [[0,2,3], [0,3,4], [0,4,5], [0,5,6], [0,6,2], [1,7,8], [1,8,9], [1,9,10], [1,10,11], [1,11,7], [2,7,3], [3,7,8], [3,8,4], [4,8,9], [4,9,5], [5,9,10], [5,10,6], [6,10,11], [6,11,2], [2,11,7]] },
    d20: { type: 'd20', vertices: [[-1, (1+Math.sqrt(5))/2, 0], [1, (1+Math.sqrt(5))/2, 0], [-1, -(1+Math.sqrt(5))/2, 0], [1, -(1+Math.sqrt(5))/2, 0], [0, -1, (1+Math.sqrt(5))/2], [0, 1, (1+Math.sqrt(5))/2], [0, -1, -(1+Math.sqrt(5))/2], [0, 1, -(1+Math.sqrt(5))/2], [(1+Math.sqrt(5))/2, 0, -1], [(1+Math.sqrt(5))/2, 0, 1], [-(1+Math.sqrt(5))/2, 0, -1], [-(1+Math.sqrt(5))/2, 0, 1]], faces: [[0,11,5], [0,5,1], [0,1,7], [0,7,10], [0,10,11], [1,5,9], [5,11,4], [11,10,2], [10,7,6], [7,1,8], [3,9,4], [3,4,2], [3,2,6], [3,6,8], [3,8,9], [4,9,5], [2,4,11], [6,2,10], [8,6,7], [9,8,1]] }
};

let preEarthquakeBoard = null;
let earthquakeInterval = null;

// Debug Panel Toggle State
let debugKeys = {};
window.addEventListener('keydown', (e) => {
    debugKeys[e.key.toUpperCase()] = true;
    if (debugKeys['SHIFT'] && debugKeys['D'] && debugKeys['F']) {
        const panel = document.querySelector('.debug-panel');
        if (panel) panel.classList.toggle('hidden');
    }
});
window.addEventListener('keyup', (e) => { debugKeys[e.key.toUpperCase()] = false; });

function init() {
    createBoard();
    updateLanguageUI();

    if (localStorage.getItem('spellbook_save')) {
        const resBtn = document.getElementById('resume-btn');
        if (resBtn) resBtn.style.display = 'block';
    }

    const aiSelect = document.getElementById('setting-ai');
    const localNames = document.getElementById('local-names');
    const darkSetting = document.getElementById('setting-dark');
    if (darkSetting) toggleDarkModeUI(darkSetting.checked);

    const familiarDiv = document.createElement('div');
    familiarDiv.id = 'familiar-previews';
    const rackWrapper = document.querySelector('.rack-wrapper');
    if (rackWrapper) rackWrapper.prepend(familiarDiv);

    if (aiSelect && localNames) {
        aiSelect.addEventListener('change', () => { localNames.style.display = aiSelect.value === 'local' ? 'flex' : 'none'; });
        localNames.style.display = aiSelect.value === 'local' ? 'flex' : 'none';
    }
    window.addEventListener('keydown', handleKeyboard);
    initDiceSystem();
    createDebugPanel();
}

function createDebugPanel() {
    const panel = document.createElement('div');
    panel.className = 'debug-panel hidden';
    panel.innerHTML = `
        <h4>Admin: Tile States</h4>
        <div class="debug-row">
            <button class="debug-btn" onclick="setTileType('regular')">Regular</button>
            <button class="debug-btn" onclick="setTileType('protected')">Protected</button>
            <button class="debug-btn" onclick="setTileType('poison')">Poison</button>
            <button class="debug-btn" onclick="setTileType('decoy')">Decoy</button>
        </div>
        <h4>Admin: Game Actions</h4>
        <div class="debug-row">
            <button class="debug-btn" onclick="reviveDeadTiles()">Revive Dead</button>
            <button class="debug-btn" onclick="testSpell('hold_person')">Skip Opponent</button>
            <button class="debug-btn" onclick="payMana(turn, -10)">+10 Mana</button>
        </div>
        <h4>Admin: Grimoire</h4>
        <div class="debug-row">
            <button class="debug-btn" onclick="showSpellTester()">Test Spells</button>
        </div>
    `;
    document.body.appendChild(panel);
}

function setTileType(type) {
    const {row, col} = focusedCell;
    if (boardState[row][col]) {
        boardState[row][col].type = type;
        renderBoard();
    }
}

function reviveDeadTiles() {
    deadTiles.forEach(tile => {
        boardState[tile.r][tile.c] = { ...tile.data, type: 'revived', owner: turn };
    });
    deadTiles = [];
    renderBoard();
}

function initDiceSystem() {
    diceScene = new THREE.Scene();
    diceCamera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
    diceCamera.position.set(0, 50, 0);
    diceCamera.lookAt(0, 0, 0);

    diceRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    diceRenderer.setSize(window.innerWidth, window.innerHeight);
    diceRenderer.shadowMap.enabled = true;
    document.getElementById('dice-overlay').appendChild(diceRenderer.domElement);

    diceWorld = new CANNON.World();
    diceWorld.gravity.set(0, -20, 0);

    const floorBody = new CANNON.Body({ mass: 0 });
    floorBody.addShape(new CANNON.Plane());
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    diceWorld.addBody(floorBody);

    // Invisible Walls to keep dice on the board
    const wallShape = new CANNON.Plane();
    const walls = [
        { pos: [0, 0, 15], rot: [-Math.PI, 0, 0] },   // Front
        { pos: [0, 0, -15], rot: [0, 0, 0] },        // Back
        { pos: [15, 0, 0], rot: [0, -Math.PI/2, 0] }, // Right
        { pos: [-15, 0, 0], rot: [0, Math.PI/2, 0] }  // Left
    ];
    walls.forEach(w => {
        const b = new CANNON.Body({ mass: 0 }); b.addShape(wallShape); b.position.set(w.pos[0], w.pos[1], w.pos[2]); b.quaternion.setFromEuler(w.rot[0], w.rot[1], w.rot[2]); diceWorld.addBody(b);
    });

    diceFloor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({ opacity: 0.3 }));
    diceFloor.rotation.x = -Math.PI / 2;
    diceFloor.receiveShadow = true;
    diceScene.add(diceFloor);

    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(10, 25, 10);
    light.castShadow = true;
    diceScene.add(light);
    diceScene.add(new THREE.AmbientLight(0x404040, 1.0));

    window.addEventListener('resize', () => {
        if (diceCamera && diceRenderer) {
            diceCamera.aspect = window.innerWidth / window.innerHeight;
            diceCamera.updateProjectionMatrix();
            diceRenderer.setSize(window.innerWidth, window.innerHeight);
        }
    });

    animateDice();
}

let lastDiceFrameTime = performance.now();
function animateDice() {
    requestAnimationFrame(animateDice);
    const now = performance.now();
    const dt = Math.min((now - lastDiceFrameTime) / 1000, 0.1);
    lastDiceFrameTime = now;

    if (diceList.length > 0) {
        diceWorld.step(1/60, dt, 3);
        diceList.forEach((mesh, i) => {
            if (!bodyList[i]) return;
            mesh.position.copy(bodyList[i].position);
            mesh.quaternion.copy(bodyList[i].quaternion);
            
            let data = diceData[i];
            if (data && data.isRolling && Date.now() - data.startTime > 1000) {
                if (bodyList[i].velocity.length() < 0.1 && bodyList[i].angularVelocity.length() < 0.1) {
                    data.isRolling = false;
                    let worldUp = new THREE.Vector3(0, 1, 0);
                    let maxDot = -Infinity, result = 1;
                    data.faceNormals.forEach((normal, fIdx) => {
                        let worldNormal = normal.clone().applyQuaternion(mesh.quaternion);
                        let dot = worldNormal.dot(worldUp);
                        if (dot > maxDot) { maxDot = dot; result = fIdx + 1; }
                    });
                    onDiceSettle(i, result);
                }
            }
        });
    }

    diceRenderer.render(diceScene, diceCamera);
}

function onDiceSettle(idx, val) {
    const mat = diceList[idx].material[val - 1];
    if (mat) { mat.emissive.setHex(0x7dcfff); mat.emissiveIntensity = 2.0; }
    
    diceData[idx].result = val;
    if (!diceData.every(d => !d.isRolling)) return;

    const total = diceData.reduce((acc, d) => acc + (d.result || 0), 0);
    const popup = document.getElementById('dice-result-popup');
    popup.innerText = total;
    popup.style.opacity = '1';
    popup.style.transform = 'translateX(-50%) scale(1.2)';

    setTimeout(() => {
        if (activeDiceCallback) {
            let cb = activeDiceCallback;
            activeDiceCallback = null;
            cb(total);
        }
        setTimeout(() => {
            document.getElementById('dice-overlay').style.display = 'none';
            popup.style.opacity = '0';
            // Cleanup dice
            diceList.forEach(m => diceScene.remove(m));
            bodyList.forEach(b => diceWorld.remove(b));
            diceList = []; bodyList = []; diceData = [];
        }, 1000);
    }, 1000);
}

function requestDiceRoll(type, callback, count = 1) {
    if (isTimeRavaging) {
        const sides = parseInt(type.slice(1)) || 6;
        let total = 0;
        for (let i = 0; i < count; i++) {
            total += Math.floor(Math.random() * sides) + 1;
        }
        callback(total);
        return;
    }
    activeDiceCallback = callback;
    document.getElementById('dice-overlay').style.display = 'block';

    diceList.forEach(m => diceScene.remove(m));
    bodyList.forEach(b => diceWorld.remove(b));
    diceList = []; bodyList = []; diceData = [];
    document.getElementById('dice-result-popup').style.opacity = '0';
    
    for(let i=0; i<count; i++) {
        const idx = spawnDiceForOverlay(type);
        const dBody = bodyList[idx];
        const data = diceData[idx];
        
        data.isRolling = true;
        data.startTime = Date.now();
        dBody.position.set(10 + (i*2), 10, 8);
        dBody.velocity.set(-18 - (Math.random() * 10), -12, -15 - (Math.random() * 10));
        dBody.angularVelocity.set(Math.random() * 30, Math.random() * 30, Math.random() * 30);
    }
}

function spawnDiceForOverlay(type) {
    const config = DICE_CONFIG[type];
    const vertices = config.vertices.map(v => new THREE.Vector3(...v).normalize().multiplyScalar(diceRadius));
    const geometry = new THREE.BufferGeometry();
    const verticesArray = [], uvsArray = [], faceNormals = [], materials = [];
    
    config.faces.forEach((f, i) => {
        const isQuad = f.length === 4;
        const startVertex = verticesArray.length / 3;
        const triIndices = isQuad ? [f[0], f[1], f[2], f[0], f[2], f[3]] : [f[0], f[1], f[2]];
        triIndices.forEach(vIdx => { const v = vertices[vIdx]; verticesArray.push(v.x, v.y, v.z); });
        for(let j=0; j < (isQuad ? 2 : 1); j++) uvsArray.push(0, 0, 1, 0, 0.5, 1);

        materials.push(new THREE.MeshPhongMaterial({
            map: createTextTextureForOverlay(i + 1, config.type),
            flatShading: true, color: 0xffffff, emissive: 0x000000, emissiveIntensity: 1
        }));
        geometry.addGroup(startVertex, isQuad ? 6 : 3, i);
        const v0 = vertices[f[0]], v1 = vertices[f[1]], v2 = vertices[f[2]];
        faceNormals.push(new THREE.Vector3().crossVectors(new THREE.Vector3().subVectors(v1, v0), new THREE.Vector3().subVectors(v2, v0)).normalize());
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesArray, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvsArray, 2));
    geometry.computeVertexNormals();
    const dMesh = new THREE.Mesh(geometry, materials);
    dMesh.castShadow = true;
    diceScene.add(dMesh);

    const cannonVertices = config.vertices.map(v => {
        const vec = new THREE.Vector3(...v).normalize().multiplyScalar(diceRadius);
        return new CANNON.Vec3(vec.x, vec.y, vec.z);
    });
    const dBody = new CANNON.Body({
        mass: 1, shape: new CANNON.ConvexPolyhedron(cannonVertices, config.faces),
        material: new CANNON.Material({ friction: 0.1, restitution: 0.5 })
    });
    dBody.angularDamping = 0.7;
    diceWorld.addBody(dBody);

    diceList.push(dMesh); bodyList.push(dBody);
    diceData.push({ type: config.type, faceNormals, isRolling: false, startTime: 0 });
    return diceList.length - 1;
}

function createTextTextureForOverlay(text, type) {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#24283b'; ctx.fillRect(0, 0, 128, 128);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#7dcfff';
    if (type === 'd6') {
        const dots = { 1: [[64,64]], 2: [[32,32], [96,96]], 3: [[32,32], [64,64], [96,96]], 4: [[32,32], [32,96], [96,32], [96,96]], 5: [[32,32], [32,96], [96,32], [96,96], [64,64]], 6: [[32,32], [32,64], [32,96], [96,32], [96,64], [96,96]] };
        (dots[text] || []).forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], 12, 0, Math.PI * 2); ctx.fill(); });
    } else {
        ctx.font = 'bold 45px Courier New'; ctx.fillText(text, 64, 72);
    }
    return new THREE.CanvasTexture(canvas);
}

function updateLanguageUI() {
    const select = document.getElementById('setting-dict');
    currentLang = (select && select.selectedIndex !== -1) ? select.options[select.selectedIndex].dataset.lang : 'en';
    TILE_DATA = TILE_SETS[currentLang];
    
    const t = TRANSLATIONS[currentLang];
    document.getElementById('ui-title').innerText = t.title;
    document.getElementById('window-title').innerText = t.title;
    document.getElementById('ui-label-dict').innerText = t.dict;
    document.getElementById('ui-label-opp').innerText = t.opp;
    document.getElementById('ui-opt-easy').innerText = t.ai_easy;
    document.getElementById('ui-opt-med').innerText = t.ai_med;
    document.getElementById('ui-opt-hard').innerText = t.ai_hard;
    document.getElementById('ui-opt-local').innerText = t.local;
    document.getElementById('ui-label-names').innerText = t.names;
    document.getElementById('ui-label-timer').innerText = t.timer;
    document.getElementById('ui-opt-none').innerText = t.none;
    document.getElementById('ui-label-dark').innerText = t.dark;
    document.getElementById('new-game-btn').innerText = t.new_btn;
    document.getElementById('resume-btn').innerText = t.res_btn;
    document.getElementById('btn-submit').innerText = t.sub_btn;
    
    document.getElementById('btn-swap-icon').title = t.t_swap;
    document.getElementById('btn-shuffle').title = t.t_shuf;
    document.getElementById('btn-dict').title = t.t_dict;
    document.getElementById('btn-recall').title = t.t_rec;
    document.getElementById('btn-theme').title = t.t_theme;
    document.getElementById('btn-pass').title = t.t_pass;
    document.getElementById('btn-resign').title = t.t_res;
    document.getElementById('btn-bag-icon').title = t.t_bag;

    document.getElementById('ui-blank-title').innerText = t.blank_title;
    document.getElementById('ui-blank-cancel').innerText = t.cancel;
    document.getElementById('ui-swap-title').innerText = t.swap_title;
    document.getElementById('ui-swap-desc').innerText = t.swap_desc;
    document.getElementById('ui-swap-btn').innerText = t.swap_btn;
    document.getElementById('ui-swap-cancel').innerText = t.cancel;
    document.getElementById('ui-dict-title').innerText = t.dict_title;
    document.getElementById('ui-dict-close').innerText = t.close;
    document.getElementById('ui-bag-title').innerText = t.bag_title;
    document.getElementById('ui-bag-close').innerText = t.close;

    document.getElementById('ui-market-title').innerText = t.spell_market;
    document.getElementById('btn-refresh-market').innerText = t.refresh_pass;

    if (marketActive) {
        if (marketCurrentPlayer !== null) {
            document.getElementById('market-status').innerText = t.p_market.replace('{0}', playerNames[marketCurrentPlayer]);
            renderSpellMarket(marketCurrentPlayer);
        }
    } else {
        document.getElementById('market-status').innerText = t.market_closed;
        renderSpellMarket(turn);
    }

    updateManaUI();
    setupLetterGrid();
}

function setupLetterGrid() {
    const grid = document.getElementById('letterGrid');
    grid.innerHTML = '';
    Object.keys(TILE_DATA).sort().forEach(char => {
        if (char === '_') return;
        const btn = document.createElement('button');
        btn.className = 'letter-btn';
        btn.innerText = char;
        btn.onclick = () => setBlankLetter(char);
        grid.appendChild(btn);
    });
}

function toggleDarkModeUI(isDark) { 
    document.body.className = isDark ? 'dark-mode' : ''; 
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.src = isDark ? 'https://www.svgrepo.com/show/532067/sun-dust.svg' : 'https://www.svgrepo.com/show/532061/moon-stars.svg';
    }
}

function toggleInGameTheme() { 
    document.body.classList.toggle('dark-mode'); 
    const isDark = document.body.classList.contains('dark-mode');
    document.getElementById('setting-dark').checked = isDark;
    document.getElementById('theme-icon').src = isDark ? 'https://www.svgrepo.com/show/532067/sun-dust.svg' : 'https://www.svgrepo.com/show/532061/moon-stars.svg';
}

async function loadDictionaryFromURL(url) {
    dictionary.clear();
    aiVocab = [];
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Network response was not ok");
        const text = await res.text();
        text.split('\n').forEach(word => {
            word = word.trim().toUpperCase();
            if (word) { dictionary.add(word); aiVocab.push(word); }
        });
        shuffle(aiVocab);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

function getRandomSpell(tier) {
    let pool = [];
    if (tier === 'low') pool = [...SPELLS.L1, ...SPELLS.L2, ...SPELLS.L3];
    else if (tier === 'med') pool = [...SPELLS.L4, ...SPELLS.L5, ...SPELLS.L6];
    else pool = [...SPELLS.L7, ...SPELLS.L8, ...SPELLS.L9];
    
    return pool[Math.floor(Math.random() * pool.length)];
}

async function startNewGame() {
    const btn = document.getElementById('new-game-btn');
    const originalText = btn.innerText;
    btn.innerText = TRANSLATIONS[currentLang].res_btn === "REPRENDRE LA PARTIE" ? "CHARGEMENT..." : (TRANSLATIONS[currentLang].res_btn === "SPIEL FORTSETZEN" ? "LÄDT..." : (TRANSLATIONS[currentLang].res_btn === "REANUDAR JUEGO" ? "CARGANDO..." : "LOADING..."));
    btn.disabled = true;

    const dictUrl = document.getElementById('setting-dict').value;
    const dictLoaded = await loadDictionaryFromURL(dictUrl);
    
    btn.innerText = originalText;
    btn.disabled = false;

    if (!dictLoaded) {
        alert("Failed to load the selected dictionary.");
        return;
    }

    gameConfig = { 
        ai: document.getElementById('setting-ai').value, 
        timeLimit: parseInt(document.getElementById('setting-timer').value) * 60,
        dictUrl: dictUrl,
        lang: currentLang
    };
    playerNames[0] = document.getElementById('setting-p1name').value || "Player 1";
    playerNames[1] = gameConfig.ai === 'local' ? (document.getElementById('setting-p2name').value || "Player 2") : "AI";
    
    bag = [];
    for (const [letter, data] of Object.entries(TILE_DATA)) {
        for (let i = 0; i < data.c; i++) bag.push(letter);
    }
    shuffle(bag);
    
    racks = [[], []]; scores = [0, 0]; moveHistory = []; turn = 0;
    boardState = Array(15).fill().map(() => Array(15).fill(null));
    currentMove = []; focusedCell = { row: 7, col: 7, dir: 'right' };
    timers = [gameConfig.timeLimit, gameConfig.timeLimit];
    
    globalTurnCounter = 0;
    roundScores = [0, 0];
    bingoCoupons = [0, 0];
    playerSpells = [
        [getRandomSpell('low'), getRandomSpell('med'), getRandomSpell('high')],
        [getRandomSpell('low'), getRandomSpell('med'), getRandomSpell('high')]
    ];
    marketActive = false;
    
    fillRack(0); fillRack(1);
    startGameUI();
}

async function resumeSavedGame() {
    const saved = JSON.parse(localStorage.getItem('spellbook_save'));
    if (!saved) return;
    
    const btn = document.getElementById('resume-btn');
    const originalText = btn.innerText;
    btn.innerText = "LOADING...";
    btn.disabled = true;

    const url = saved.gameConfig.dictUrl || document.getElementById('setting-dict').value;
    currentLang = saved.gameConfig.lang || 'en';
    TILE_DATA = TILE_SETS[currentLang];
    updateLanguageUI();

    const dictLoaded = await loadDictionaryFromURL(url);
    
    btn.innerText = originalText;
    btn.disabled = false;

    if (!dictLoaded) { alert("Failed to load dictionary."); return; }

    ({ boardState, racks, bag, scores, turn, moveHistory, timers, playerNames, gameConfig, globalTurnCounter, roundScores, bingoCoupons, playerSpells, activeEffects, lostPoints } = saved);
    
    if(!roundScores) roundScores = [0,0];
    if(!bingoCoupons) bingoCoupons = [0,0];
    if(!activeEffects) activeEffects = [{}, {}];
    if(!lostPoints) lostPoints = [0, 0];
    if(!playerSpells) playerSpells = [[getRandomSpell('low'), getRandomSpell('med'), getRandomSpell('high')], [getRandomSpell('low'), getRandomSpell('med'), getRandomSpell('high')]];
    
    startGameUI();
}

function startGameUI() {
    document.getElementById('launcher').style.display = 'none';
    document.getElementById('game-wrapper').style.display = 'flex';
    document.getElementById('p1-name-display').innerText = playerNames[0];
    document.getElementById('p2-name-display').innerText = playerNames[1];
    
    document.getElementById('score-p1').innerText = scores[0] || 0;
    document.getElementById('score-p2').innerText = scores[1] || 0;
    
    if (timerInterval) clearInterval(timerInterval);
    if (gameConfig.timeLimit > 0) timerInterval = setInterval(tickTimer, 1000);
    
    document.getElementById('market-sidebar').classList.add('market-closed');

    updateManaUI();
    updateUI();
    focusCell(7, 7, 'right');
}

function createBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${r}-${c}`;
            cell.dataset.row = r; cell.dataset.col = c;
            
            const bonus = BONUSES[`${r},${c}`];
            if (bonus) {
                cell.dataset.bonus = bonus;
                cell.innerText = bonus === 'ST' ? '★' : bonus;
            }
            
            cell.onclick = () => focusCell(r, c, (focusedCell.row === r && focusedCell.col === c) ? (focusedCell.dir === 'right' ? 'down' : 'right') : focusedCell.dir);
            cell.onmouseenter = () => handleHealingWordHover(r, c, true);
            cell.onmouseleave = () => handleHealingWordHover(r, c, false);
            
            cell.addEventListener('mouseenter', () => handlePolyHover(r, c, true));
            cell.addEventListener('mouseleave', () => handlePolyHover(r, c, false));
            cell.addEventListener('click', () => {
                if (polySelection) handlePolyClick(r, c);
            });

            cell.addEventListener('mouseenter', () => handleFireballHover(r, c, true));
            cell.addEventListener('mouseleave', () => handleFireballHover(r, c, false));
            cell.addEventListener('click', () => {
                if (fireballSelection) handleFireballClick(r, c);
            });

            cell.addEventListener('click', () => {
                if (healingWordSelection) handleHealingWordClick(r, c);
            });
            boardEl.appendChild(cell);
        }
    }
}

function focusCell(r, c, dir) {
    if (marketActive) return;
    if (r < 0 || r > 14 || c < 0 || c > 14) return;
    document.querySelectorAll('.cell').forEach(el => el.classList.remove('active', 'down'));
    focusedCell = { row: r, col: c, dir };
    const cell = document.getElementById(`cell-${r}-${c}`);
    if (cell) {
        cell.classList.add('active');
        if (dir === 'down') cell.classList.add('down');
    }
}

function handleKeyboard(e) {
    if (document.getElementById('launcher').style.display !== 'none' || draggingData || marketActive || healingWordSelection || fireballSelection || polySelection) return;
    if (document.getElementById('blankModal').style.display === 'flex') {
        const key = e.key.toUpperCase();
        if (TILE_DATA[key] && key !== '_') setBlankLetter(key);
        else if (key === 'ESCAPE') cancelBlank();
        return;
    }
    if (gameConfig.ai !== 'local' && turn === 1 && !activeEffects[turn].telekinesis) return;
    
    const key = e.key.toUpperCase();
    const isGrav = reverseGravityRounds > 0;

    if (key === 'BACKSPACE') {
        if (currentMove.length > 0) {
            const last = currentMove.pop();
            racks[turn].push(last.original || last.letter);
            renderRack(); renderBoard(); validateMove();
            focusCell(last.row, last.col, focusedCell.dir);
        }
    } else if (key === 'ENTER') submitMove();
    else if (key === 'ARROWUP') focusCell(focusedCell.row + (isGrav ? 1 : -1), focusedCell.col, 'down');
    else if (key === 'ARROWDOWN') focusCell(focusedCell.row + (isGrav ? -1 : 1), focusedCell.col, 'down');
    else if (key === 'ARROWLEFT') focusCell(focusedCell.row, focusedCell.col + (isGrav ? 1 : -1), 'right');
    else if (key === 'ARROWRIGHT') focusCell(focusedCell.row, focusedCell.col + (isGrav ? -1 : 1), 'right');
    else if (TILE_DATA[key] && key !== '_') playLetter(key);
    else if (key === ' ' || key === '_') playLetter('_');
}

function handleHealingWordHover(r, c, isEnter) {
    if (!healingWordSelection) return;
    highlightedHealingCoords.forEach(coord => document.getElementById(`cell-${coord.r}-${coord.c}`).classList.remove('healing-highlight'));
    highlightedHealingCoords = [];
    const scorePreview = document.getElementById('score-preview');
    scorePreview.style.display = 'none';
    if (!isEnter || !boardState[r][c]) return;

    const words = getWordCoordsAt(r, c);
    if (!words) return;
    highlightedHealingCoords = words.hWord || words.vWord || [];

    if (highlightedHealingCoords.length > 0) {
        highlightedHealingCoords.forEach(coord => document.getElementById(`cell-${coord.r}-${coord.c}`).classList.add('healing-highlight'));
        const pts = calculateSingleWordScore(highlightedHealingCoords);
        const cell = document.getElementById(`cell-${r}-${c}`);
        const rect = cell.getBoundingClientRect();
        scorePreview.style.left = rect.left + window.scrollX + (rect.width/2) + 'px';
        scorePreview.style.top = rect.top + window.scrollY - 5 + 'px';
        scorePreview.innerText = '+' + pts;
        scorePreview.style.display = 'block';
    }
}

function handleHealingWordClick(r, c) {
    if (!healingWordSelection || highlightedHealingCoords.length === 0) return;
    const pts = calculateSingleWordScore(highlightedHealingCoords);
    let oldScore = scores[turn];
    scores[turn] += pts;
    roundScores[turn] += pts;
    highlightedHealingCoords.forEach(coord => {
        boardState[coord.r][coord.c].owner = turn;
        boardState[coord.r][coord.c].turnPlaced = globalTurnCounter;
    });
    animateScoreValue(turn, oldScore, scores[turn]);
    healingWordSelection = false;
    delete activeEffects[turn].healingWordActive;
    highlightedHealingCoords = [];
    document.querySelectorAll('.cell').forEach(el => el.classList.remove('healing-highlight'));
    document.getElementById('score-preview').style.display = 'none';
    renderBoard();
    updateManaUI();
    saveGame();
}

function handlePolyHover(r, c, isEnter) {
    if (!polySelection) return;
    highlightedPolyCoords.forEach(coord => document.getElementById(`cell-${coord.r}-${coord.c}`).classList.remove('poly-highlight'));
    highlightedPolyCoords = [];
    if (!isEnter || !boardState[r][c]) return;

    const words = getWordCoordsAt(r, c);
    if (!words) return;
    highlightedPolyCoords = words.hWord || words.vWord || [];
    highlightedPolyCoords.forEach(coord => document.getElementById(`cell-${coord.r}-${coord.c}`).classList.add('poly-highlight'));
}

function handlePolyClick(r, c) {
    if (!polySelection || highlightedPolyCoords.length === 0) return;
    
    // Store current state for Power Word Heal (WEIRD logic placeholder)
    // If we wanted to track every individual tile change, we would 
    // but for now, we'll follow the specific revert instructions provided.

    const len = highlightedPolyCoords.length;
    const sameLengthWords = aiVocab.filter(w => w.length === len);
    if (sameLengthWords.length === 0) return alert("No replacement word found!");

    const newWord = sameLengthWords[Math.floor(Math.random() * sameLengthWords.length)];
    
    highlightedPolyCoords.forEach((coord, i) => {
        const cell = document.getElementById(`cell-${coord.r}-${coord.c}`);
        const tile = cell.querySelector('.tile');
        if (tile) tile.classList.add('poly-morphing');
        
        setTimeout(() => {
            boardState[coord.r][coord.c].letter = newWord[i];
            renderBoard();
        }, 500);
    });

    polySelection = false;
    delete activeEffects[turn].polyActive;
    setTimeout(() => {
        document.querySelectorAll('.cell').forEach(el => el.classList.remove('poly-highlight'));
        renderBoard();
    }, 1000);
}

function findAllWordsOnBoard() {
    const words = [];
    const seen = new Set();

    const scan = (dr, dc) => {
        for (let r = 0; r < 15; r++) {
            for (let c = 0; c < 15; c++) {
                if (boardState[r][c]) {
                    // Only start scan if it's the beginning of a word
                    const pr = r - dr, pc = c - dc;
                    if (pr >= 0 && pr < 15 && pc >= 0 && pc < 15 && boardState[pr][pc]) continue;

                    let currentW = "", currentCoords = [];
                    let cr = r, cc = c;
                    while (cr < 15 && cc < 15 && boardState[cr][cc]) {
                        currentW += boardState[cr][cc].letter;
                        currentCoords.push({ r: cr, c: cc });
                        cr += dr; cc += dc;
                    }
                    if (currentW.length > 1) {
                        const id = currentCoords.map(co => `${co.r},${co.c}`).join('|');
                        if (!seen.has(id)) {
                            seen.add(id);
                            words.push({ word: currentW, coords: currentCoords });
                        }
                    }
                }
            }
        }
    };
    scan(0, 1); // Horizontal
    scan(1, 0); // Vertical
    return words;
}

function runEarthquake(count) {
    const board = document.getElementById('board');
    board.classList.add('shaking');
    preEarthquakeBoard = JSON.parse(JSON.stringify(boardState));
    
    let steps = 0;
    earthquakeInterval = setInterval(() => {
        const moves = [[0,1],[0,-1],[1,0],[-1,0]];
        for(let r=0; r<15; r++) {
            for(let c=0; c<15; c++) {
                if (boardState[r][c] && Math.random() > 0.5) {
                    if (boardState[r][c].owner !== -1 && activeEffects[boardState[r][c].owner].invulnerable > 0) continue;
                    const dir = moves[Math.floor(Math.random()*4)];
                    const nr = r + dir[0], nc = c + dir[1];
                    if (nr>=0 && nr<15 && nc>=0 && nc<15 && !boardState[nr][nc]) {
                        boardState[nr][nc] = boardState[r][c];
                        boardState[r][c] = null;
                    }
                }
            }
        }
        renderBoard();
        steps++;
        if (steps >= count) {
            clearInterval(earthquakeInterval);
            earthquakeInterval = null;
            setTimeout(() => board.classList.remove('shaking'), 2000);
        }
    }, 400);
}

function handleFireballHover(r, c, isEnter) {
    if (!fireballSelection) return;
    highlightedFireballCoords.forEach(coord => {
        const el = document.getElementById(`cell-${coord.r}-${coord.c}`);
        if (el) el.classList.remove('fireball-highlight');
    });
    highlightedFireballCoords = [];
    if (!isEnter) return;

    for (let i = r - 1; i <= r + 1; i++) {
        for (let j = c - 1; j <= c + 1; j++) {
            if (i >= 0 && i < 15 && j >= 0 && j < 15) {
                highlightedFireballCoords.push({ r: i, c: j });
                document.getElementById(`cell-${i}-${j}`).classList.add('fireball-highlight');
            }
        }
    }
}

function handleFireballClick(r, c) {
    if (!fireballSelection) return;
    highlightedFireballCoords.forEach(coord => {
        const tile = boardState[coord.r][coord.c];
        if (tile) {
            const owner = tile.owner;
            if (owner !== -1) {
                const val = calculateTileScore(coord.r, coord.c);
                scores[owner] -= val;
                lostPoints[owner] += val;
                animateScoreValue(owner, scores[owner] + val, scores[owner]);
            }
            tile.isBurning = true;
        }
    });

    fireballSelection = false;
    delete activeEffects[turn].fireballActive;
    renderBoard();

    setTimeout(() => {
        for (let r = 0; r < 15; r++) {
            for (let c = 0; c < 15; c++) {
                if (boardState[r][c]?.isBurning) {
                    deadTiles.push({ r, c, data: { ...boardState[r][c], isBurning: false } });
                    boardState[r][c] = null;
                }
            }
        }
        renderBoard();
    }, 2500);
}

function calculateTileScore(r, c) {
    const data = boardState[r][c];
    if (!data) return 0;
    let val = data.isBlank ? 0 : TILE_DATA[data.letter].v;
    const bonus = BONUSES[`${r},${c}`];
    if (bonus === 'DL') val *= 2;
    if (bonus === 'TL') val *= 3;
    return val;
}

function getWordCoordsAt(r, c) {
    if (!boardState[r][c]) return null;
    let hCoords = [{r, c}], vCoords = [{r, c}];
    let tc = c - 1; while(tc >= 0 && boardState[r][tc]) { hCoords.unshift({r, c: tc}); tc--; }
    tc = c + 1; while(tc < 15 && boardState[r][tc]) { hCoords.push({r, c: tc}); tc++; }
    let tr = r - 1; while(tr >= 0 && boardState[tr][c]) { vCoords.unshift({r: tr, c}); tr--; }
    tr = r + 1; while(tr < 15 && boardState[tr][c]) { vCoords.push({r: tr, c}); tr++; }
    return { hWord: hCoords.length > 1 ? hCoords : null, vWord: vCoords.length > 1 ? vCoords : null };
}

function calculateSingleWordScore(coords) {
    let wordMultiplier = 1, wordScore = 0;
    coords.forEach(coord => {
        const data = boardState[coord.r][coord.c];
        if (!data) return;
        let letterScore = data.isBlank ? 0 : TILE_DATA[data.letter].v;
        if (data.type === 'poison') letterScore *= -1;
        const bonus = BONUSES[`${coord.r},${coord.c}`];
        if (bonus === 'DL') letterScore *= 2;
        if (bonus === 'TL') letterScore *= 3;
        if (bonus === 'DW' || bonus === 'ST') wordMultiplier *= 2;
        if (bonus === 'TW') wordMultiplier *= 3;
        wordScore += letterScore;
    });
    return wordScore * wordMultiplier;
}

// DRAG AND DROP
function onPointerDown(e, type, letter, original, r, c, rackIdx) {
    if (e.button && e.button !== 0) return;
    if (marketActive || (gameConfig.ai !== 'local' && turn === 1 && !activeEffects[turn].telekinesis)) return;
    
    let target = e.currentTarget;
    let rect = target.getBoundingClientRect();
    
    let ghost = document.createElement('div');
    ghost.className = 'tile ghost-tile';
    ghost.innerText = letter === '_' ? '' : letter;
    let val = document.createElement('div');
    val.className = 'value';
    val.innerText = letter === '_' ? 0 : TILE_DATA[letter].v;
    ghost.appendChild(val);
    
    ghost.style.left = e.clientX + 'px';
    ghost.style.top = e.clientY + 'px';
    ghost.style.width = rect.width + 'px';
    ghost.style.height = rect.height + 'px';
    document.body.appendChild(ghost);
    
    target.style.opacity = '0';
    
    draggingData = { target, ghost, type, letter, original, r, c, rackIdx, startX: e.clientX, startY: e.clientY };
    
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
}

function onPointerMove(e) {
    if (!draggingData) return;
    draggingData.ghost.style.left = e.clientX + 'px';
    draggingData.ghost.style.top = e.clientY + 'px';
}

function onPointerUp(e) {
    if (!draggingData) return;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    
    let { target, ghost, type, letter, original, r, c, rackIdx, startX, startY } = draggingData;
    draggingData = null;
    
    ghost.remove();
    target.style.opacity = '1';

    let isClick = Math.abs(e.clientX - startX) < 5 && Math.abs(e.clientY - startY) < 5;
    if (isClick) {
        if (type === 'rack') playLetter(original, rackIdx);
        else if (type === 'board') clickToReturn(r, c);
        return;
    }
    
    ghost.style.display = 'none';
    let dropTarget = document.elementFromPoint(e.clientX, e.clientY);
    let cell = dropTarget ? dropTarget.closest('.cell') : null;
    let rackArea = dropTarget ? (dropTarget.closest('#rack') || dropTarget.closest('#secondary-rack')) : null;
    
    if (cell) {
        let tr = parseInt(cell.dataset.row), tc = parseInt(cell.dataset.col);
        if (boardState[tr][tc] || currentMove.some(m => m.row === tr && m.col === tc && !(m.row===r && m.col===c))) {
            renderRack(); renderBoard(); validateMove();
            return;
        }
        
        if (type === 'rack' || type === 'secondary') {
            if (type === 'rack') racks[turn].splice(rackIdx, 1);
            else secondaryRacks[turn].splice(rackIdx, 1);

            if (original === '_') {
                pendingBlankCell = { row: tr, col: tc, original: '_' };
                document.getElementById('blankModal').style.display = 'flex';
            } else {
                currentMove.push({ row: tr, col: tc, letter, original });
                focusCell(tr, tc, focusedCell.dir);
            }
        } else if (type === 'board') {
            let mIdx = currentMove.findIndex(m => m.row === r && m.col === c);
            if (mIdx !== -1) {
                currentMove[mIdx].row = tr; currentMove[mIdx].col = tc;
                focusCell(tr, tc, focusedCell.dir);
            }
        }
    } else if (rackArea || type === 'board') {
        if (type === 'board') {
            let mIdx = currentMove.findIndex(m => m.row === r && m.col === c);
            if (mIdx !== -1) {
                currentMove.splice(mIdx, 1);
                racks[turn].push(original);
            }
        }
    }
    
    renderRack(); renderBoard(); validateMove();
}

function clickToReturn(r, c) {
    let idx = currentMove.findIndex(m => m.row === r && m.col === c);
    if (idx > -1) {
        let m = currentMove.splice(idx, 1)[0];
        racks[turn].push(m.original);
        renderRack(); renderBoard(); validateMove();
    }
}

function playLetter(letterStr, specificIdx = -1, isSecondary = false) {
    let currentRack = isSecondary ? secondaryRacks[turn] : racks[turn];
    if (!currentRack) return;

    let rackIdx = specificIdx;
    if (rackIdx === -1) {
        rackIdx = currentRack.indexOf(letterStr);
        // If letter not found, and we're typing, check for a blank tile immediately
        if (rackIdx === -1 && letterStr !== '_' && letterStr !== ' ' && letterStr.length === 1) {
            rackIdx = currentRack.indexOf('_');
        }
    }

    if (rackIdx === -1) {
        if (!isSecondary && secondaryRacks[turn] && secondaryRacks[turn].length > 0) {
            return playLetter(letterStr, -1, true);
        }
        return;
    }
    
    if (!isSecondary && activeEffects[turn].webbedIndices?.includes(rackIdx)) return;

    let original = currentRack[rackIdx];
    if (original === undefined || (!original && original !== '_')) return;

    let { row, col, dir } = focusedCell;
    while (boardState[row][col] || currentMove.some(m => m.row === row && m.col === col)) {
        if (dir === 'right') col++; else row++;
        if (col > 14 || row > 14) return;
    }

    currentRack.splice(rackIdx, 1);
    
    if (original === '_' && letterStr !== '_' && letterStr !== ' ' && letterStr.length === 1) {
        currentMove.push({ row, col, letter: letterStr, original: '_' });
        advanceFocus();
        renderRack(); renderBoard(); validateMove();
    } else if (original === '_' && (letterStr === '_' || letterStr === ' ')) {
        pendingBlankCell = { row, col, original: '_' };
        document.getElementById('blankModal').style.display = 'flex';
    } else {
        currentMove.push({ row, col, letter: original, original: original });
        advanceFocus();
        renderRack(); renderBoard(); validateMove();
    }
}

function setBlankLetter(letter) {
    document.getElementById('blankModal').style.display = 'none';
    if (pendingBlankCell) {
        currentMove.push({ row: pendingBlankCell.row, col: pendingBlankCell.col, letter, original: '_' });
        pendingBlankCell = null;
        advanceFocus();
        renderRack(); renderBoard(); validateMove();
    }
}

function cancelBlank() {
    document.getElementById('blankModal').style.display = 'none';
    if (pendingBlankCell) {
        racks[turn].push('_');
        pendingBlankCell = null;
        renderRack(); renderBoard(); validateMove();
    }
}

function advanceFocus() {
    let { row, col, dir } = focusedCell;
    const isGrav = reverseGravityRounds > 0;
    do {
        if (dir === 'right') isGrav ? col-- : col++; 
        else isGrav ? row-- : row++;
    } while (col >= 0 && col < 15 && row >= 0 && row < 15 && (boardState[row][col] || currentMove.some(m => m.row === row && m.col === col)));
    if (col >= 0 && col < 15 && row >= 0 && row < 15) focusCell(row, col, dir);
}

function renderRack() {
    const rackEl = document.getElementById('rack');
    let secondaryEl = document.getElementById('secondary-rack');
    rackEl.innerHTML = '';
    if (secondaryEl) secondaryEl.innerHTML = '';

    if (turn === 2) return; // Copies don't show racks
    if (gameConfig.ai !== 'local' && turn === 1 && !activeEffects[turn].telekinesis) return;

    if (activeEffects[turn].demiplaneSize > 0 && !secondaryEl) {
        secondaryEl = document.createElement('div');
        secondaryEl.id = 'secondary-rack';
        secondaryEl.className = 'rack-container secondary-rack';
        document.querySelector('.rack-wrapper').after(secondaryEl);
    } else if (!activeEffects[turn].demiplaneSize && secondaryEl) {
        secondaryEl.remove();
    }

    racks[turn].forEach((letter, idx) => {
        rackEl.appendChild(createRackTileElement(letter, idx, false));
    });

    if (activeEffects[turn].demiplaneSize > 0) {
        secondaryRacks[turn].forEach((letter, idx) => {
            secondaryEl.appendChild(createRackTileElement(letter, idx, true));
        });
    }
}

function createRackTileElement(letter, idx, isSecondary) {
    const div = document.createElement('div');
    div.className = 'rack-tile';
    if (!isSecondary && activeEffects[turn].webbedIndices?.includes(idx)) div.classList.add('webbed');
    if (activeEffects[turn].bless) div.classList.add('blessed');
    div.innerText = letter === '_' ? '' : letter;
    const val = document.createElement('div');
    val.className = 'value';
    val.innerText = letter === '_' ? 0 : TILE_DATA[letter].v;
    div.appendChild(val);
    div.onpointerdown = (e) => onPointerDown(e, isSecondary ? 'secondary' : 'rack', letter, letter, -1, -1, idx);
    return div;
}

function renderBoard() {
    document.querySelectorAll('.cell .tile').forEach(e => e.remove());
    const boardEl = document.getElementById('board');
    if (reverseGravityRounds > 0) boardEl.classList.add('reversed');
    else boardEl.classList.remove('reversed');

    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            if (boardState[r][c]) {
                renderTileOnBoard(r, c, boardState[r][c].letter, false, boardState[r][c].isBlank, boardState[r][c].owner, boardState[r][c].justPlaced);
            }
        }
    }
    currentMove.forEach(m => {
        renderTileOnBoard(m.row, m.col, m.letter, true, m.original === '_', turn, null);
    });
    
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            if (boardState[r][c] && boardState[r][c].justPlaced !== undefined) {
                delete boardState[r][c].justPlaced;
            }
        }
    }
}

function renderTileOnBoard(r, c, letter, isTemp, isBlank, owner, placedIdx) {
    const cell = document.getElementById(`cell-${r}-${c}`);
    const tile = document.createElement('div');
    let ownerClass = owner === 0 ? 'p1-owner' : (owner === 1 ? 'p2-owner' : 'neutral-owner');
    tile.className = `tile ${isTemp ? 'temp' : ''} ${ownerClass}`;
    
    const state = boardState[r][c];
    if (placedIdx !== undefined && placedIdx !== null) {
        tile.classList.add('just-placed');
        tile.style.animationDelay = `${placedIdx * 0.1}s`;
    }
    
    if (state?.type) {
        tile.classList.add(state.type);
        if (state.type === 'decoy') {
            if (state.owner === turn) tile.classList.add('decoy-caster');
            else tile.classList.remove('decoy'); // Hide decoy status from opponent
        }
    }

    if (state?.isGravityTile) tile.classList.add('upside-down');
    if (state?.isSimulacrum) tile.classList.add('simulacrum-tile');

    if (isBlank) tile.classList.add('blank-played');
    if (state?.shieldedBy !== undefined) tile.classList.add('shielded');
    if (state?.fireShieldedBy !== undefined) tile.classList.add('fire-shielded');
    if (state?.isBurning) tile.classList.add('burning');
    
    const letterSpan = document.createElement('span');
    letterSpan.className = 'letter-span';
    letterSpan.innerText = letter;
    tile.appendChild(letterSpan);
    
    if (isTemp) tile.onpointerdown = (e) => onPointerDown(e, 'board', letter, isBlank ? '_' : letter, r, c, -1);
    
    const val = document.createElement('div');
    val.className = 'value';
    val.innerText = isBlank ? 0 : TILE_DATA[letter].v;
    tile.appendChild(val);
    cell.appendChild(tile);
}

function validateMoveBasic() {
    let isValid = currentMove.length > 0;
    if (!isValid) return false;

    const isFirstTurn = boardState[7][7] === null;
    if (isFirstTurn && !activeEffects[turn].fly && !currentMove.some(m => m.row === 7 && m.col === 7)) return false;
    
    const rows = currentMove.map(m => m.row), cols = currentMove.map(m => m.col);
    const isHorizontal = rows.every(r => r === rows[0]);
    const isVertical = cols.every(c => c === cols[0]);
    if (!isHorizontal && !isVertical && currentMove.length > 1) return false;
    
    if (currentMove.length > 1) {
        if (isHorizontal) {
            let minC = Math.min(...cols), maxC = Math.max(...cols), r = rows[0];
            for (let c = minC; c <= maxC; c++) if (!boardState[r][c] && !currentMove.some(m => m.col === c)) return false;
        } else {
            let minR = Math.min(...rows), maxR = Math.max(...rows), c = cols[0];
            for (let r = minR; r <= maxR; r++) if (!boardState[r][c] && !currentMove.some(m => m.row === r)) return false;
        }
    }
    
    if (!isFirstTurn && !activeEffects[turn].fly) {
        let attaches = false;
        for (let m of currentMove) {
            const {row, col} = m;
            if ((row>0 && boardState[row-1][col]) || (row<14 && boardState[row+1][col]) ||
                (col>0 && boardState[row][col-1]) || (col<14 && boardState[row][col+1])) {
                attaches = true; break;
            }
        }
        if (!attaches) return false;
    }

    return true;
}

function validateMove() {
    let isValid = validateMoveBasic();
    let words = [];

    if (isValid) {
        words = findWordsOnBoard();
        if (words.length === 0) isValid = false;
        if (dictionary.size > 0 && isValid) {
            words.forEach(w => { 
                const isTraceWord = (activeEffects[turn].passWithoutTrace === w.word.length);
                if (!dictionary.has(w.word) && !isTraceWord) isValid = false; 
            });
        }
    }

    if (isValid && activeEffects[turn].slowLimit) {
        words.forEach(w => {
            if (w.word.length > activeEffects[turn].slowLimit) isValid = false;
        });
    }

    const tiles = document.querySelectorAll('.tile.temp');
    tiles.forEach(t => {
        t.classList.remove('valid', 'invalid');
        if (currentMove.length > 0) t.classList.add(isValid ? 'valid' : 'invalid');
    });

    const scorePreview = document.getElementById('score-preview');
    if (isValid && currentMove.length > 0) {
        const first = currentMove[0];
        const cell = document.getElementById(`cell-${first.row}-${first.col}`);
        if(cell) {
            const rect = cell.getBoundingClientRect();
            scorePreview.style.left = rect.left + window.scrollX + (rect.width/2) + 'px';
            scorePreview.style.top = rect.top + window.scrollY - 5 + 'px';
            scorePreview.innerText = '+' + calculateScore();
            scorePreview.style.display = 'block';
        }
    } else {
        scorePreview.style.display = 'none';
    }
    return isValid;
}

function calculateScore() {
    if (currentMove.length === 0) return 0;
    const words = findWordsOnBoard();
    let moveTotal = 0;
    words.forEach(w => {
        let wordMultiplier = 1, wordScore = 0;
        w.coords.forEach(coord => {
            const {r, c} = coord;
            const letter = w.word[w.coords.indexOf(coord)];
            const tileData = boardState[r][c];
            
            let isBlank = false;
            if (boardState[r][c]) isBlank = boardState[r][c].isBlank;
            else {
                let moveItem = currentMove.find(m => m.row === r && m.col === c);
                if (moveItem) isBlank = (moveItem.original === '_');
            }
            
            let letterScore = isBlank ? 0 : TILE_DATA[letter].v;
            if (tileData?.type === 'poison') letterScore *= -1;
            if (tileData?.type === 'potential') letterScore = 0;

            const movePart = currentMove.find(m => m.row === r && m.col === c);
            if (movePart) {
                const bonus = BONUSES[`${r},${c}`];
                if (bonus === 'DL') letterScore *= 2;
                if (bonus === 'TL') letterScore *= 3;
                if (bonus === 'DW' || bonus === 'ST') wordMultiplier *= 2;
                if (bonus === 'TW') wordMultiplier *= 3;
            }
            wordScore += letterScore;
        });
        moveTotal += wordScore * wordMultiplier;
    });
    
    if (currentMove.length === 7) moveTotal += 50;

    // Healing Word Effect
    if (activeEffects[turn].doubleScore || activeEffects[turn].bless) moveTotal *= 2;

    return moveTotal;
}

function findWordsOnBoard() {
    const words = [];
    if (currentMove.length === 0) return words;
    const tempBoard = JSON.parse(JSON.stringify(boardState));
    currentMove.forEach(m => tempBoard[m.row][m.col] = { letter: m.letter });

    const getWordAt = (r, c, dr, dc) => {
        let word = tempBoard[r][c].letter, cR = r - dr, cC = c - dc, coords = [{r,c}];
        while (cR >= 0 && cC >= 0 && tempBoard[cR][cC]) { word = tempBoard[cR][cC].letter + word; coords.unshift({r: cR, c: cC}); cR -= dr; cC -= dc; }
        cR = r + dr; cC = c + dc;
        while (cR < 15 && cC < 15 && tempBoard[cR][cC]) { word += tempBoard[cR][cC].letter; coords.push({r: cR, c: cC}); cR += dr; cC += dc; }
        return word.length > 1 ? {word, coords} : null;
    };

    const m0 = currentMove[0];
    const isHoriz = currentMove.length > 1 ? currentMove[0].row === currentMove[1].row : true;
    
    const mainWord = getWordAt(m0.row, m0.col, isHoriz?0:1, isHoriz?1:0);
    if (mainWord) words.push(mainWord);
    else if (currentMove.length === 1) {
        const vWord = getWordAt(m0.row, m0.col, 1, 0);
        if (vWord) words.push(vWord);
    }

    currentMove.forEach(mov => {
        const cross = getWordAt(mov.row, mov.col, isHoriz?1:0, isHoriz?0:1);
        if (cross) words.push(cross);
    });

    const unique = []; const seen = new Set();
    words.forEach(w => {
        const id = w.coords.map(c => `${c.r},${c.c}`).join('|');
        if(!seen.has(id)) { seen.add(id); unique.push(w); }
    });
    return unique;
}

function animateScoreValue(playerIdx, oldScore, newScore) {
    const obj = document.getElementById(`score-p${playerIdx+1}`);
    const duration = 800; 
    let startTimestamp = null;
    
    obj.style.color = 'var(--bonus-dw)';
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerText = Math.floor(progress * (newScore - oldScore) + oldScore);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerText = newScore;
            obj.style.color = ''; 
        }
    };
    window.requestAnimationFrame(step);
}

function getMana(player) {
    let m = 0;
    for(let r=0; r<15; r++) for(let c=0; c<15; c++) if (boardState[r][c] && boardState[r][c].owner === player) m++;
    return m;
}

function updateManaUI() {
    const t = TRANSLATIONS[currentLang];
    document.getElementById('mana-p1').innerText = `${t.mana}: ${getMana(0)}`;
    document.getElementById('mana-p2').innerText = `${t.mana}: ${getMana(1)}`;
    document.getElementById('coupon-p1').innerHTML = `🏷️ ${t.coupon}`;
    document.getElementById('coupon-p2').innerHTML = `🏷️ ${t.coupon}`;
    document.getElementById('coupon-p1').style.display = bingoCoupons[0] > 0 ? 'block' : 'none';
    document.getElementById('coupon-p2').style.display = bingoCoupons[1] > 0 ? 'block' : 'none';
}

function payMana(player, amount) {
    if (amount < 0) {
        // Debug Mode: Gain Mana
        let count = 0;
        const target = Math.abs(amount);
        for(let r=0; r<15 && count < target; r++) {
            for(let c=0; c<15 && count < target; c++) {
                if (!boardState[r][c]) {
                    boardState[r][c] = { letter: '?', owner: player, type: 'regular', turnPlaced: globalTurnCounter };
                    count++;
                } else if (boardState[r][c].owner === -1) {
                    boardState[r][c].owner = player;
                    count++;
                }
            }
        }
    } else {
        // Standard Mode: Spend Mana
        let ownedTiles = [];
        for(let r=0; r<15; r++) {
            for(let c=0; c<15; c++) {
                if (boardState[r][c] && boardState[r][c].owner === player) {
                    ownedTiles.push({r, c, turnPlaced: boardState[r][c].turnPlaced});
                }
            }
        }
        ownedTiles.sort((a,b) => a.turnPlaced - b.turnPlaced);
        for(let i=0; i<amount; i++) {
            if (ownedTiles[i]) boardState[ownedTiles[i].r][ownedTiles[i].c].owner = -1;
        }
    }
    
    renderBoard();
    updateManaUI();
}

function submitMove() {
    if (!validateMove()) return alert("Invalid placement or word!");
    const words = findWordsOnBoard();
    let allValid = true, invalidWord = "";
    
    if (dictionary.size > 0) {
        words.forEach(w => { if (!dictionary.has(w.word)) { allValid = false; invalidWord = w.word; } });
        if (!allValid) return alert(`"${invalidWord}" is not a valid word!`);
    }

    const pts = calculateScore();
    let oldScore = scores[turn];
    
    if (turn === 2 && copyPlayer?.type === 'simulacrum') {
        const target = copyPlayer.owner === 0 ? 1 : 0;
        scores[target] -= pts;
        animateScoreValue(target, scores[target] + pts, scores[target]);
    } else {
        let scoreTarget = (turn === 2) ? copyPlayer.owner : turn;
        scores[scoreTarget] += pts;
        roundScores[scoreTarget] += pts;
    }
    
    let isBingo = currentMove.length === 7;
    if (isBingo) bingoCoupons[turn] = 1; 
    
    let primaryWord = words[0];
    let wordTileData = primaryWord.coords.map((coord, i) => {
        let isNew = currentMove.some(m => m.row === coord.r && m.col === coord.c);
        let bonus = isNew ? BONUSES[`${coord.r},${coord.c}`] : null;
        let isBlank = false;
        if (boardState[coord.r][coord.c]) isBlank = boardState[coord.r][coord.c].isBlank;
        else isBlank = currentMove.find(m => m.row===coord.r && m.col===coord.c).original === '_';
        return { letter: isBlank ? '' : primaryWord.word[i], bonus };
    });
    
    let fireShieldTriggered = false;
    currentMove.forEach(m => {
        if (boardState[m.row][m.col]?.fireShieldedBy !== undefined && boardState[m.row][m.col].fireShieldedBy !== turn) {
            fireShieldTriggered = true;
        }
    });

    if (fireShieldTriggered) {
        alert("FIRE SHIELD! Move invalidated and turn skipped.");
        resetMove();
        passTurn();
        return;
    }

    let decoyTrapTriggered = false;
    words.forEach(w => {
        w.coords.forEach(coord => {
            const cell = boardState[coord.r][coord.c];
            if (cell && cell.owner !== turn && cell.type === 'decoy') decoyTrapTriggered = true;
        });
    });

    if (decoyTrapTriggered) {
        alert("DECOY TRAP! Move revoked and turn skipped.");
        words.forEach(w => {
            w.coords.forEach(coord => {
                if (boardState[coord.r][coord.c]?.type === 'decoy') boardState[coord.r][coord.c] = null;
            });
        });
        resetMove();
        activeEffects[turn].skipTurn = true;
        passTurn();
        return;
    }

    let placedIdx = 0;
    currentMove.forEach(m => {
        let actualRow = m.row, actualCol = m.col;
        if (reverseGravityRounds > 0) {
            actualRow = 14 - m.row;
            actualCol = 14 - m.col;
        }
        const isSim = (turn === 2 && copyPlayer?.type === 'simulacrum');
        const owner = (turn === 2) ? copyPlayer.owner : turn;
        boardState[actualRow][actualCol] = { letter: m.letter, isBlank: m.original === '_', owner: owner, turnPlaced: globalTurnCounter, justPlaced: placedIdx++, isGravityTile: reverseGravityRounds > 0, isSimulacrum: isSim };
    });

    words.forEach(w => {
        w.coords.forEach(coord => {
            let ar = coord.r, ac = coord.c;
            if (reverseGravityRounds > 0) { ar = 14 - coord.r; ac = 14 - coord.c; }
            const cell = boardState[coord.r][coord.c];
            if (cell && turn !== 2) { // Copies don't claim tiles
                // Shield & Protected Check
                if ((cell.shieldedBy !== undefined || cell.type === 'protected') && cell.owner !== turn) {
                    // Don't change owner
                } else {
                    cell.owner = turn;
                    cell.turnPlaced = globalTurnCounter;
                }
            }
        });
    });

    if (activeEffects[turn].contingency) {
        const { condition, spell } = activeEffects[turn].contingency;
        let triggered = false;
        if ((condition === 1 || condition === 2) && pts >= 70) triggered = true;
        if ((condition === 3 || condition === 4 || condition === 5) && isBingo) triggered = true;
        if (condition >= 6) triggered = true; 

        if (triggered) {
            castSpellEffect(spell, turn);
            delete activeEffects[turn].contingency;
        }
    }

    moveHistory.unshift({ player: turn, action: 'play', wordTiles: wordTileData, wordString: primaryWord.word, extraWords: words.length - 1, pts: pts, bingo: isBingo, turnIndex: globalTurnCounter });

    if (activeEffects[turn].doubleScore) delete activeEffects[turn].doubleScore;
    if (activeEffects[turn].bless) delete activeEffects[turn].bless;
    if (activeEffects[turn].passWithoutTrace) delete activeEffects[turn].passWithoutTrace;
    if (activeEffects[turn].fly) delete activeEffects[turn].fly;
    if (activeEffects[turn].telekinesis) delete activeEffects[turn].telekinesis;

    animateScoreValue(turn, oldScore, scores[turn]);
    fillRack(turn);
    currentMove = [];
    document.getElementById('score-preview').style.display = 'none';
    
    globalTurnCounter++;
    
    if (bag.length === 0 && racks[turn].length === 0) {
        triggerGameOver();
        return;
    }

    if (globalTurnCounter % 2 === 0) {
        startMarketPhase();
    } else {
        nextTurn();
    }
}

function triggerGameOver() {
    updateUI();
    let winner = scores[0] > scores[1] ? playerNames[0] : (scores[1] > scores[0] ? playerNames[1] : "Tie");
    setTimeout(() => {
        alert(`Game Over!\n${playerNames[0]}: ${scores[0]}\n${playerNames[1]}: ${scores[1]}\n\nWinner: ${winner}`);
    }, 1500);
}

function resetMove() {
    currentMove.forEach(m => racks[turn].push(m.original));
    currentMove = [];
    renderRack(); renderBoard(); validateMove();
}

function passTurn() { 
    resetMove(); 
    moveHistory.unshift({ player: turn, action: 'pass', pts: 0 });
    globalTurnCounter++;
    
    if (globalTurnCounter % 2 === 0) startMarketPhase();
    else nextTurn(); 
}

function swapTiles() {
    if (bag.length < 7) return alert("Not enough tiles in bag to swap.");
    resetMove();
    const modal = document.getElementById('swapModal');
    const grid = document.getElementById('swapGrid');
    grid.innerHTML = '';
    selectedSwapIndices.clear();
    racks[turn].forEach((letter, idx) => {
        const div = document.createElement('div');
        div.className = 'rack-tile swap-tile';
        div.innerText = letter === '_' ? '' : letter;
        div.onclick = () => { div.classList.toggle('selected'); selectedSwapIndices.has(idx) ? selectedSwapIndices.delete(idx) : selectedSwapIndices.add(idx); };
        grid.appendChild(div);
    });
    modal.style.display = 'flex';
}

function confirmSwap() {
    if (selectedSwapIndices.size === 0) { document.getElementById('swapModal').style.display='none'; return; }
    const indices = Array.from(selectedSwapIndices).sort((a,b)=>b-a);
    indices.forEach(idx => bag.push(racks[turn].splice(idx,1)[0]));
    shuffle(bag); fillRack(turn);
    
    moveHistory.unshift({ player: turn, action: 'swap', count: indices.length, pts: 0 });
    document.getElementById('swapModal').style.display = 'none';
    
    globalTurnCounter++;
    if (globalTurnCounter % 2 === 0) startMarketPhase();
    else nextTurn();
}

function shuffleRack() { shuffle(racks[turn]); renderRack(); }
function fillRack(playerIdx) { while (racks[playerIdx].length < 7 && bag.length > 0) racks[playerIdx].push(bag.pop()); }
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; }
}

function tickTimer() { if (timers[turn] > 0 && !marketActive) timers[turn]--; updateTimerDisplay(); }
function updateTimerDisplay() {
    const fmt = t => `${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`;
    document.getElementById('timer-p1').innerText = fmt(timers[0]);
    document.getElementById('timer-p2').innerText = fmt(timers[1]);
}

function nextTurn() {
    // Save state snapshot for True Resurrection
    const snapshot = JSON.stringify({ boardState, racks, bag, scores, turn, playerSpells, activeEffects, lostPoints });
    gameHistory.unshift(snapshot);
    if (gameHistory.length > 40) gameHistory.pop();

    // Cleanup round-based durations
    Object.keys(activeEffects[turn]).forEach(k => {
        if (typeof activeEffects[turn][k] === 'number') {
            activeEffects[turn][k]--;
            if (k === 'timeStop' && activeEffects[turn][k] >= 0) activeEffects[turn].skipTurn = true;
            if (activeEffects[turn][k] <= 0) {
                if (k === 'shield') removeBoardEffect('shieldedBy', turn);
                if (k === 'fireShield') removeBoardEffect('fireShieldedBy', turn);
                if (k === 'web') delete activeEffects[turn].webbedIndices;
                if (k === 'slow') delete activeEffects[turn].slowLimit;
                if (k === 'invulnerable') document.getElementById(`card-p${turn+1}`).classList.remove('invulnerable');
                delete activeEffects[turn][k];
            }
        }
    });

    if (activeEffects[turn].familiarWords) delete activeEffects[turn].familiarWords;
    document.getElementById('familiar-previews').innerText = '';

    if (isTimeRavaging && globalTurnCounter >= targetTimeRavageTurn) {
        isTimeRavaging = false;
        const board = document.getElementById('board');
        if (board) board.classList.remove('fast-forward-active');
        updateUI();
        if (timeRavageCallback) { let cb = timeRavageCallback; timeRavageCallback = null; cb(); }
        return;
    }

    const aiDelay = isTimeRavaging ? 200 : 1200;

    if (activeEffects[turn].extraMoves > 0) {
        activeEffects[turn].extraMoves--;
        updateUI();
        if (isTimeRavaging || (gameConfig.ai !== 'local' && (turn === 1 || turn === 2))) setTimeout(playAI, aiDelay);
        return;
    }

    if (reverseGravityRounds > 0) {
        reverseGravityRounds--;
        if (reverseGravityRounds === 0) {
            // Set all tiles that were upright during flip to upside-down for normal view
            for(let r=0; r<15; r++) for(let c=0; c<15; c++) {
                if (boardState[r][c] && boardState[r][c].isGravityTile) boardState[r][c].isGravityTile = true;
                else if (boardState[r][c]) boardState[r][c].isGravityTile = false;
            }
        }
    }

    if (copyPlayer) {
        copyPlayer.rounds--;
        if (copyPlayer.rounds <= 0) copyPlayer = null;
    }
    
    if (activeEffects[turn].polyActive) polySelection = true;

    if (copyPlayer && turn === 1) {
        turn = 2;
    } else {
        turn = (turn === 0 || turn === 2) ? 1 : 0;
    }

    // Inject Copy Turn
    if (copyPlayer && turn === copyPlayer.owner) {
        // Handle copy turn after the caster's turn logic
    }

    if (activeEffects[turn].fireballActive) fireballSelection = true;

    if (activeEffects[turn].healingWordActive) healingWordSelection = true;

    if (activeEffects[turn].skipTurn && !marketActive) {
        delete activeEffects[turn].skipTurn;
        moveHistory.unshift({ player: turn, action: 'pass', pts: 0, spellTitle: 'Stunned' });
        return nextTurn();
    }

    updateUI();
    if (isTimeRavaging) {
        setTimeout(() => playAI(false, false, true), aiDelay);
    } else if (activeEffects[turn].suggestion) {
        setTimeout(() => playAI(true), aiDelay);
    } else if (activeEffects[turn].confused) {
        setTimeout(() => playAI(false, true), aiDelay);
    } else if (gameConfig.ai !== 'local' && (turn === 1 || turn === 2) && !activeEffects[turn].telekinesis) {
        setTimeout(playAI, aiDelay);
    }
}

function removeBoardEffect(property, owner) {
    for(let r=0; r<15; r++) for(let c=0; c<15; c++) {
        if (boardState[r][c] && boardState[r][c][property] === owner) delete boardState[r][c][property];
    }
}

/**
 * Modified to handle async dice rolls for specific spells.
 * Some spells now return early and re-invoke the market turn completion via a callback.
 */
function castSpellEffect(spell, playerId, onComplete) {
    const opponentId = playerId === 0 ? 1 : 0;
    const t = TRANSLATIONS[currentLang];

    if (activeEffects[opponentId].immune > 0 && spell.id !== 'greater_restoration') {
        alert(`${playerNames[opponentId]} is immune to spells!`);
        return;
    }

    if (activeEffects[opponentId].mirrorImage > 0 && spell.level >= 1 && spell.id !== 'greater_restoration') {
        activeEffects[opponentId].mirrorImage--;
        alert(`${playerNames[opponentId]}'s Mirror Image absorbed the spell!`);
        return false;
    }

    switch(spell.id) {
        case 'shield':
            activeEffects[playerId].shield = 2;
            for(let r=0; r<15; r++) for(let c=0; c<15; c++) 
                if (boardState[r][c] && boardState[r][c].owner === playerId) boardState[r][c].shieldedBy = playerId;
            break;
        case 'bless':
            activeEffects[playerId].bless = true;
            break;
        case 'fire_shield':
            activeEffects[playerId].fireShield = 2;
            for(let r=0; r<15; r++) for(let c=0; c<15; c++) 
                if (boardState[r][c] && boardState[r][c].owner === playerId) boardState[r][c].fireShieldedBy = playerId;
            break;
        case 'healing_word':
            activeEffects[playerId].healingWordActive = true;
            break;
        case 'hold_person':
            activeEffects[opponentId].holdPerson = 1;
            break;
        case 'pass_without_trace':
            requestDiceRoll('d4', (roll) => {
                activeEffects[playerId].passWithoutTrace = roll + 1;
                if (onComplete) onComplete();
            });
            return true;
        case 'suggestion':
            requestDiceRoll('d20', (roll) => {
                if (roll >= 10) activeEffects[opponentId].suggestion = true;
                if (onComplete) onComplete();
            });
            return true;
        case 'sleep':
            requestDiceRoll('d20', (roll) => {
                if (roll >= 10) activeEffects[opponentId].skipTurn = true;
                if (onComplete) onComplete();
            });
            return true;
        case 'invisibility':
            if (racks[playerId].length > 0) {
                let idx = Math.floor(Math.random() * racks[playerId].length);
                racks[playerId][idx] = '_';
            }
            break;
        case 'mirror_image':
            activeEffects[playerId].mirrorImage = 2;
            break;
        case 'contingency':
            const randomSpell = getRandomSpell('low');
            const randomCond = Math.floor(Math.random() * 10) + 1;
            activeEffects[playerId].contingency = { spell: randomSpell, condition: randomCond };
            break;
        case 'greater_invis':
            requestDiceRoll('d4', (roll) => {
                const count = roll + 1;
                for(let i=0; i<count; i++) {
                    const available = racks[playerId].map((l, idx) => l !== '_' ? idx : -1).filter(idx => idx !== -1);
                    if (available.length > 0) {
                        const randIdx = available[Math.floor(Math.random() * available.length)];
                        racks[playerId][randIdx] = '_';
                    }
                }
                if (onComplete) onComplete();
            });
            return true; // Mark as async
        case 'find_familiar':
            requestDiceRoll('d6', (roll) => {
                const maxLen = roll + 1;
                const suggestions = [];
                // Reusing AI helper logic to find words
                for (let word of aiVocab) {
                    if (word.length <= maxLen && canFormWord(word, racks[playerId])) {
                        suggestions.push(word);
                        if (suggestions.length >= 3) break;
                    }
                }
                if (suggestions.length > 0) {
                    activeEffects[playerId].familiarWords = suggestions;
                    const div = document.getElementById('familiar-previews');
                    div.innerHTML = suggestions.map(w => `<span>✨ ${w}</span>`).join('');
                } else {
                    alert("The familiar couldn't find any words!");
                }
                if (onComplete) onComplete();
            });
            return true;
        case 'web':
            requestDiceRoll('d6', (roll) => {
                activeEffects[opponentId].webbedIndices = [];
                for(let i=0; i<roll; i++) activeEffects[opponentId].webbedIndices.push(i);
                activeEffects[opponentId].web = 4;
                if (onComplete) onComplete();
            });
            return true; // Mark as async
        case 'fireball':
            activeEffects[playerId].fireballActive = true;
            break;
        case 'revivify':
            requestDiceRoll('d4', (roll) => {
                let restored = 0;
                // Re-add last 1d4 removed tiles if space is open
                for (let i = deadTiles.length - 1; i >= 0 && restored < roll; i--) {
                    const entry = deadTiles[i];
                    if (!boardState[entry.r][entry.c]) {
                        boardState[entry.r][entry.c] = { ...entry.data, type: 'revived', owner: playerId };
                        const val = calculateTileScore(entry.r, entry.c);
                        scores[playerId] += val;
                        animateScoreValue(playerId, scores[playerId] - val, scores[playerId]);
                        deadTiles.splice(i, 1);
                        restored++;
                    }
                }
                if (onComplete) onComplete();
            });
            return true;
        case 'counterspell':
            const lastAction = moveHistory[0];
            if (lastAction && lastAction.player === opponentId) {
                if (activeEffects[opponentId].invulnerable > 0) return alert("Counterspell failed: Opponent is Invulnerable!");
                if (lastAction.action === 'play') {
                    scores[opponentId] -= lastAction.pts;
                    lostPoints[opponentId] += lastAction.pts;
                    lastAction.pts = -lastAction.pts;
                }
                alert(`Countered ${playerNames[opponentId]}'s last ${lastAction.action}!`);
            }
            break;
        case 'haste':
            requestDiceRoll('d4', (roll) => {
                activeEffects[playerId].extraMoves = roll;
                if (onComplete) onComplete();
            });
            return true;
        case 'slow':
            requestDiceRoll('d4', (roll) => {
                activeEffects[opponentId].slow = 1;
                activeEffects[opponentId].slowLimit = roll + 2;
                if (onComplete) onComplete();
            });
            return true;
        case 'fly':
            activeEffects[playerId].fly = true;
            break;
        case 'confusion':
            activeEffects[opponentId].confused = true;
            activeEffects[opponentId].confusion = 1;
            break;
        case 'telekinesis':
            activeEffects[opponentId].telekinesis = true;
            break;
        case 'gate':
            const currentTurns = globalTurnCounter;
            const savedRacks = JSON.parse(JSON.stringify(racks));
            alert("Stepping through the Gate... generating alternate reality.");
            
            // Reset World
            boardState = Array(15).fill().map(() => Array(15).fill(null));
            scores = [0, 0];
            bag = [];
            for (const [letter, data] of Object.entries(TILE_DATA)) {
                for (let i = 0; i < data.c; i++) bag.push(letter);
            }
            shuffle(bag);
            
            // Simulate AI Match
            for (let i = 0; i < currentTurns; i++) {
                const simTurn = i % 2;
                // Temporary rack for simulation
                let simRack = [];
                for(let j=0; j<7; j++) if(bag.length > 0) simRack.push(bag.pop());
                // Placeholder for simulation logic
                const move = null; 
                if (move) {
                    move.move.forEach(m => {
                        boardState[m.row][m.col] = { 
                            letter: m.letter, 
                            isBlank: m.original === '_', 
                            owner: simTurn, 
                            turnPlaced: i 
                        };
                    });
                    scores[simTurn] += move.score;
                }
            }
            racks = savedRacks;
            renderBoard();
            updateUI();
            break;
        case 'weird':
            const letters = Object.keys(TILE_DATA).filter(l => l !== '_');
            // Randomize Values
            letters.forEach(l => { TILE_DATA[l].v = Math.floor(Math.random() * 10) + 1; });
            
            // Shuffling Animation
            let shuffleCount = 0;
            const weirdInt = setInterval(() => {
                for(let r=0; r<15; r++) for(let c=0; c<15; c++) {
                    if (boardState[r][c]) boardState[r][c].letter = letters[Math.floor(Math.random()*letters.length)];
                }
                racks.forEach(rack => {
                    for(let i=0; i<rack.length; i++) if(rack[i] !== '_') rack[i] = letters[Math.floor(Math.random()*letters.length)];
                });
                renderBoard();
                renderRack();
                shuffleCount++;
                if (shuffleCount > 20) {
                    clearInterval(weirdInt);
                    renderBoard();
                    renderRack();
                }
            }, 100);
            break;
        case 'wish':
            showWishModal(playerId, onComplete);
            return true;
        case 'true_resurrection':
            requestDiceRoll('d20', (roll) => {
                const overlay = document.getElementById('vhs-overlay');
                if (overlay) overlay.classList.add('active');
                const targetIndex = Math.min(roll, gameHistory.length - 1);
                setTimeout(() => {
                    const restored = JSON.parse(gameHistory[targetIndex]);
                    ({ boardState, racks, bag, scores, turn, playerSpells, activeEffects, lostPoints } = restored);
                    if (overlay) overlay.classList.remove('active');
                    updateUI();
                    saveGame();
                }, 3000);
                if (onComplete) onComplete();
            });
            return true;
        case 'time_ravage':
            isTimeRavaging = true; 
            requestDiceRoll('d6', (roll) => {
                timeRavageCallback = onComplete;
                targetTimeRavageTurn = globalTurnCounter + ((roll + 1) * 2);
                const board = document.getElementById('board');
                if (board) board.classList.add('fast-forward-active');
                playAI(false, false, true);
            });
            return true;
        case 'invulnerability':
            requestDiceRoll('d6', (roll) => {
                activeEffects[playerId].invulnerable = roll;
                document.getElementById(`card-p${playerId+1}`).classList.add('invulnerable');
                if (onComplete) onComplete();
            }, 4);
            return true;
        case 'mass_polymorph':
            requestDiceRoll('d4', (roll) => {
                const count = roll + 2;
                const allWords = findAllWordsOnBoard();
                shuffle(allWords);
                const targetWords = allWords.slice(0, count);
                targetWords.forEach(w => {
                    const sameLen = aiVocab.filter(v => v.length === w.coords.length);
                    if (sameLen.length > 0) {
                        const newW = sameLen[Math.floor(Math.random() * sameLen.length)];
                        w.coords.forEach((c, i) => {
                            if (boardState[c.r][c.c].owner !== -1 && activeEffects[boardState[c.r][c.c].owner].invulnerable > 0) return;
                            boardState[c.r][c.c].letter = newW[i];
                        });
                    }
                });
                renderBoard();
                if (onComplete) onComplete();
            }, 2);
            return true;
        case 'time_stop':
            requestDiceRoll('d4', (roll) => {
                activeEffects[opponentId].timeStop = roll + 1;
                activeEffects[opponentId].skipTurn = true;
                if (onComplete) onComplete();
            });
            return true;
        case 'power_word_kill':
            if (scores[opponentId] < 100) {
                scores[playerId] = 9999; 
                triggerGameOver();
            } else {
                alert("Power Word Kill failed! Opponent's spirit is too strong (100+ points).");
            }
            break;
        case 'power_word_heal':
            // Award lost points
            for (let i = 0; i < 2; i++) {
                let recovery = lostPoints[i];
                scores[i] += recovery;
                lostPoints[i] = 0;
                animateScoreValue(i, scores[i] - recovery, scores[i]);
            }

            // Revert Earthquake
            if (preEarthquakeBoard) {
                boardState = JSON.parse(JSON.stringify(preEarthquakeBoard));
                preEarthquakeBoard = null;
            }
            if (earthquakeInterval) {
                clearInterval(earthquakeInterval);
                earthquakeInterval = null;
                document.getElementById('board').classList.remove('shaking');
            }

            // Deactivate and clear all spell states
            activeEffects = [{}, {}];
            reverseGravityRounds = 0;
            copyPlayer = null;
            healingWordSelection = false;
            fireballSelection = false;
            polySelection = false;
            secondaryRacks = [[], []];

            // Default all tiles to Regular
            for (let r = 0; r < 15; r++) {
                for (let c = 0; c < 15; c++) {
                    if (boardState[r][c]) {
                        const propsToRemove = ['shieldedBy', 'fireShieldedBy', 'isBurning', 'isGravityTile', 'isSimulacrum', 'type'];
                        propsToRemove.forEach(p => delete boardState[r][c][p]);
                    }
                }
            }
            renderBoard();
            updateUI();
            break;
        case 'demiplane':
            requestDiceRoll('d6', (roll) => {
                const count = roll + 1;
                activeEffects[playerId].demiplaneSize = count;
                if (!secondaryRacks[playerId]) secondaryRacks[playerId] = [];
                while(secondaryRacks[playerId].length < count && bag.length > 0) secondaryRacks[playerId].push(bag.pop());
                if (onComplete) onComplete();
            });
            return true;
        case 'true_polymorph':
            activeEffects[playerId].polyActive = true;
            break;
        case 'earthquake':
            requestDiceRoll('d4', (roll) => {
                runEarthquake(roll);
                if (onComplete) onComplete();
            });
            return true;
        case 'reverse_gravity':
            requestDiceRoll('d4', (roll) => {
                reverseGravityRounds = roll;
                if (onComplete) onComplete();
            });
            return true;
        case 'simulacrum':
        case 'project_image':
            requestDiceRoll('d6', (roll) => {
                copyPlayer = { type: spell.id, owner: playerId, rounds: roll };
                if (onComplete) onComplete();
            });
            return true;
        case 'greater_restoration':
            requestDiceRoll('d4', (roll) => {
                activeEffects[playerId].immune = roll;
                if (onComplete) onComplete();
            });
            return true;
        case 'heal':
            scores[playerId] += lostPoints[playerId];
            lostPoints[playerId] = 0;
            break;
        case 'burning_hands':
            const wordToBurn = moveHistory.find(m => m.player === opponentId && m.action === 'play');
            if (wordToBurn) {
                if (activeEffects[opponentId].invulnerable > 0) return alert("Burning Hands failed: Opponent is Invulnerable!");
                scores[opponentId] -= wordToBurn.pts;
                lostPoints[opponentId] += wordToBurn.pts;
                const originalPts = wordToBurn.pts;
                wordToBurn.pts = -originalPts;
                
                const targetTurn = wordToBurn.turnIndex;
                for(let r=0; r<15; r++) {
                    for(let c=0; c<15; c++) {
                        if (boardState[r][c] && boardState[r][c].turnPlaced === targetTurn) {
                            boardState[r][c].isBurning = true;
                        }
                    }
                }
                renderBoard();
                setTimeout(() => {
                    for(let r=0; r<15; r++) {
                        for (let c = 0; c < 15; c++) {
                            if (boardState[r][c]?.isBurning) {
                                deadTiles.push({ r, c, data: { ...boardState[r][c], isBurning: false } });
                                boardState[r][c] = null;
                            }
                        }
                    }
                    renderBoard();
                }, 1000);
            }
            break;
        case 'aid':
            requestDiceRoll('d20', (roll) => {
                const searchLimit = roll * 800;
                const possibleMoves = getPossibleMoves(playerId, searchLimit);
                
                if (possibleMoves.length > 0) {
                    possibleMoves.sort((a, b) => a.score - b.score);
                    const chosenIndex = Math.floor((possibleMoves.length - 1) * (roll / 20));
                    const best = possibleMoves[chosenIndex];
                    
                    resetMove(); 
                    currentMove = best.move;
                    currentMove.forEach(m => {
                        let targetRack = m.isSecondary ? secondaryRacks[playerId] : racks[playerId];
                        let rIdx = targetRack.indexOf(m.original);
                        if (rIdx !== -1) targetRack.splice(rIdx, 1);
                    });
                } else {
                    alert("The spirits found no possible moves.");
                }
                moveHistory.unshift({ 
                    player: playerId, 
                    action: 'spell', 
                    spellTitle: `Aid (Search: ${roll})`, 
                    pts: 0 
                });
                updateUI();
                if (onComplete) onComplete();
            });
            return true;
    }
    return false; // Sync
}

function updateUI() {
    document.getElementById('card-p1').classList.toggle('active', turn === 0);
    document.getElementById('card-p2').classList.toggle('active', turn === 1);

    // Handle Copy Player Sidebar
    let p3Card = document.getElementById('card-p3');
    if (copyPlayer) {
        if (!p3Card) {
            p3Card = document.createElement('div');
            p3Card.id = 'card-p3';
            p3Card.className = 'player-card simulacrum-card';
            document.querySelector('.sidebar').insertBefore(p3Card, document.getElementById('move-history'));
        }
        const isSim = copyPlayer.type === 'simulacrum';
        p3Card.style.display = 'flex';
        p3Card.classList.toggle('active', turn === 2);
        p3Card.innerHTML = `
            <div>
                <div class="p-name">${isSim ? 'Simulacrum' : 'Projected Image'}</div>
                <div class="p-timer">${copyPlayer.rounds} Rounds Left</div>
            </div>
            <div class="p-score" style="color: ${isSim ? '#7dcfff' : (copyPlayer.owner === 0 ? 'var(--p1-color)' : 'var(--p2-color)')}">
                ${isSim ? 'COPY' : 'IMAGE'}
            </div>
        `;
    } else if (p3Card) {
        p3Card.style.display = 'none';
    }
    
    document.getElementById('card-p1').classList.toggle('skipped', !!activeEffects[0].skipTurn);
    document.getElementById('card-p2').classList.toggle('skipped', !!activeEffects[1].skipTurn);
    document.getElementById('card-p1').classList.toggle('slowed', !!activeEffects[0].slowLimit);
    document.getElementById('card-p2').classList.toggle('slowed', !!activeEffects[1].slowLimit);
    document.getElementById(`card-p${turn+1}`).classList.toggle('immune', !!activeEffects[turn].immune);

    const t = TRANSLATIONS[currentLang];
    document.getElementById('bag-count').innerText = `${bag.length} ${t.tiles_left}`;
    
    document.body.classList.toggle('turn-p1', turn === 0);
    document.body.classList.toggle('turn-p2', turn === 1);
    
    if (document.getElementById('score-p1').innerText === "0" && scores[0] > 0) document.getElementById('score-p1').innerText = scores[0];
    if (document.getElementById('score-p2').innerText === "0" && scores[1] > 0) document.getElementById('score-p2').innerText = scores[1];

    updateManaUI();
    renderRack(); renderBoard();
    
    const list = document.getElementById('move-history');
    list.innerHTML = '';
    
    moveHistory.forEach(m => {
        const div = document.createElement('div');
        div.className = 'history-item';
        
        let pColor = m.player === 0 ? 'var(--p1-color)' : 'var(--p2-color)';
        let pInitial = playerNames[m.player][0];
        let descHtml = '';

        if (m.action === 'play') {
            let tilesHtml = `<div class="log-word">`;
            m.wordTiles.forEach(t => { tilesHtml += `<div class="log-tile ${t.bonus ? 'bonus-'+t.bonus : ''}">${t.letter}</div>`; });
            tilesHtml += `</div>`;
            descHtml = tilesHtml;
            if (m.extraWords > 0) descHtml += `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top:2px;">+${m.extraWords} word${m.extraWords > 1 ? 's' : ''}</div>`;
            if (m.bingo) descHtml += `<div style="font-size: 0.8rem; color: var(--bonus-dw); font-weight: 900; margin-top:2px;">BINGO!</div>`;
        } else if (m.action === 'swap') {
            descHtml = `<span style="color: var(--text-muted); font-style: italic; font-size: 0.9rem;">Swapped ${m.count} tiles</span>`;
        } else if (m.action === 'pass') {
            descHtml = `<span style="color: var(--text-muted); font-style: italic; font-size: 0.9rem;">Passed turn</span>`;
        } else if (m.action === 'spell') {
            descHtml = `<span style="color: var(--accent); font-weight: 900; font-size: 0.9rem;">${t.spell_cast} ${m.spellTitle}</span>`;
        }

        div.innerHTML = `
            <div class="avatar-box" style="background: ${pColor}; border-color: ${pColor}; color: #fff;">${pInitial}</div>
            <div style="flex:1;">${descHtml}</div>
            <div style="font-weight: 900; font-family: monospace; font-size: 1.1rem; color: var(--text-main);">
                ${m.pts > 0 ? '+' + m.pts : (m.pts < 0 ? m.pts : '-')}
            </div>
        `;
        list.appendChild(div);
    });
    
    document.getElementById('btn-submit').disabled = marketActive;
    document.getElementById('btn-swap-icon').disabled = marketActive;
    document.getElementById('btn-shuffle').disabled = marketActive;
    document.getElementById('btn-recall').disabled = marketActive;
    document.getElementById('btn-pass').disabled = marketActive;

    if (!marketActive) {
        document.getElementById('market-status').innerText = t.market_closed;
        document.getElementById('market-status').style.color = 'var(--text-muted)';
        document.getElementById('market-timer').innerText = "--";
        document.getElementById('btn-use-coupon').style.display = 'none';
        document.getElementById('btn-refresh-market').disabled = true;
        
        renderSpellMarket(turn);
    }

    saveGame();
}

// ----------------------------------------------------
// SPELL MARKET SYSTEM
// ----------------------------------------------------

function startMarketPhase() {
    marketActive = true;
    document.getElementById('game-wrapper').classList.add('market-active');
    document.getElementById('market-sidebar').classList.remove('market-closed');
    
    if (roundScores[0] >= roundScores[1]) marketQueue = [0, 1];
    else marketQueue = [1, 0];
    
    roundScores = [0, 0]; 
    updateUI();
    nextMarketTurn();
}

function nextMarketTurn() {
    const t = TRANSLATIONS[currentLang];
    
    if (marketQueue.length === 0) {
        executeQueuedSpells();
        return;
    }

    marketCurrentPlayer = marketQueue.shift();
    couponActiveThisTurn = false;
    
    document.getElementById('market-status').innerText = t.p_market.replace('{0}', playerNames[marketCurrentPlayer]);
    document.getElementById('market-status').style.color = marketCurrentPlayer === 0 ? 'var(--p1-color)' : 'var(--p2-color)';
    document.getElementById('btn-refresh-market').disabled = false;

    if (isTimeRavaging) {
        setTimeout(() => playAIMarket(marketCurrentPlayer), 200);
        return;
    }
    
    if (bingoCoupons[marketCurrentPlayer] > 0) {
        document.getElementById('btn-use-coupon').style.display = 'block';
        document.getElementById('btn-use-coupon').style.opacity = '1';
    } else {
        document.getElementById('btn-use-coupon').style.display = 'none';
    }

    renderSpellMarket(marketCurrentPlayer);
    startMarketTimer();

    if (gameConfig.ai !== 'local' && marketCurrentPlayer === 1) {
        setTimeout(playAIMarket, 1500);
    }
}

function startMarketTimer() {
    if (marketCountdown || isTimeRavaging) clearInterval(marketCountdown);
    marketTimeLeft = 10;
    document.getElementById('market-timer').innerText = marketTimeLeft;
    
    marketCountdown = setInterval(() => {
        marketTimeLeft--;
        document.getElementById('market-timer').innerText = marketTimeLeft;
        if (marketTimeLeft <= 0) {
            clearInterval(marketCountdown);
            refreshMarket(); 
        }
    }, 1000);
}

function useCoupon() {
    if (bingoCoupons[marketCurrentPlayer] <= 0 || couponActiveThisTurn || !marketActive) return;
    if (gameConfig.ai !== 'local' && marketCurrentPlayer === 1) return;

    couponActiveThisTurn = true;
    bingoCoupons[marketCurrentPlayer]--;
    document.getElementById('btn-use-coupon').style.opacity = '0.4';
    renderSpellMarket(marketCurrentPlayer);
    updateManaUI();
}

function renderSpellMarket(playerId) {
    const container = document.getElementById('spell-slots');
    container.innerHTML = '';
    
    if (!playerSpells || !playerSpells[playerId]) return;

    const spells = playerSpells[playerId];
    const currentMana = getMana(playerId);
    const t = TRANSLATIONS[currentLang];
    const isHeld = activeEffects[playerId].holdPerson > 0;

    spells.forEach((spell, idx) => {
        if (spell.id === 'revivify' && deadTiles.length === 0) return;
        const cost = (marketActive && couponActiveThisTurn) ? Math.round(spell.cost / 2) : spell.cost;
        const canAfford = currentMana >= cost && !isHeld;
        
        const card = document.createElement('div');
        card.className = `spell-card ${canAfford && marketActive ? '' : 'disabled'} ${(marketActive && couponActiveThisTurn) ? 'discounted' : ''} ${isHeld ? 'held-person' : ''}`;
        
        if (!marketActive) {
            card.classList.add('view-only');
        }
        
        card.innerHTML = `
            <h3>${spell.title}</h3>
            <p>${spell.desc}</p>
            <div class="spell-cost">${t.cost_mana.replace('{0}', cost)}</div>
        `;
        
        if (marketActive && canAfford) {
            card.onclick = () => {
                if (gameConfig.ai !== 'local' && marketCurrentPlayer === 1) return; 
                buySpell(idx);
            };
        }
        
        container.appendChild(card);
    });
}

function executeQueuedSpells() {
    if (queuedSpells.length === 0) {
        marketActive = false;
        document.getElementById('game-wrapper').classList.remove('market-active');
        document.getElementById('market-sidebar').classList.add('market-closed');
        turn = 0;
        updateUI();
        return;
    }
    const { spell, playerId } = queuedSpells.shift();
    const isAsync = castSpellEffect(spell, playerId, executeQueuedSpells);
    if (!isAsync) executeQueuedSpells();
}

function buySpell(spellIdx) {
    if (marketCountdown) clearInterval(marketCountdown);
    
    let spell = playerSpells[marketCurrentPlayer][spellIdx];
    let cost = couponActiveThisTurn ? Math.round(spell.cost / 2) : spell.cost;
    
    payMana(marketCurrentPlayer, cost);

    queuedSpells.push({ spell, playerId: marketCurrentPlayer });
    moveHistory.unshift({ player: marketCurrentPlayer, action: 'spell', spellTitle: spell.title, pts: 0 });
    
    let tier = spellIdx === 0 ? 'low' : (spellIdx === 1 ? 'med' : 'high');
    playerSpells[marketCurrentPlayer][spellIdx] = getRandomSpell(tier);
    nextMarketTurn();
}

function refreshMarket() {
    if (!marketActive) return;
    if (marketCountdown) clearInterval(marketCountdown);
    
    playerSpells[marketCurrentPlayer] = [getRandomSpell('low'), getRandomSpell('med'), getRandomSpell('high')];
    
    nextMarketTurn();
}

function playAIMarket() {
    if (bingoCoupons[1] > 0) {
        couponActiveThisTurn = true;
        bingoCoupons[1]--;
    }

    let currentMana = getMana(1);
    let spells = playerSpells[1];
    
    for(let i = 2; i >= 0; i--) {
        let cost = couponActiveThisTurn ? Math.round(spells[i].cost / 2) : spells[i].cost;
        if (currentMana >= cost) {
            buySpell(i);
            return;
        }
    }
    
    refreshMarket();
}

// ----------------------------------------------------
// UI POPUPS
// ----------------------------------------------------

function showBagTiles() {
    const modal = document.getElementById('bagModal');
    const breakdown = document.getElementById('bag-breakdown');
    breakdown.innerHTML = '';
    
    const counts = {};
    bag.forEach(letter => counts[letter] = (counts[letter] || 0) + 1);
    
    const sortedKeys = Object.keys(TILE_DATA).sort();
    sortedKeys.forEach(letter => {
        const div = document.createElement('div');
        div.style.background = 'var(--cell-bg)'; div.style.border = '2px solid var(--board-border)'; div.style.padding = '8px 5px'; div.style.display = 'flex'; div.style.flexDirection = 'column'; div.style.alignItems = 'center';
        const l = document.createElement('strong'); l.innerText = letter === '_' ? 'BL' : letter; l.style.color = 'var(--text-main)';
        const c = document.createElement('span'); c.innerText = counts[letter] || 0; c.style.color = 'var(--text-muted)'; c.style.fontFamily = 'monospace'; c.style.fontSize = '1.2rem';
        div.appendChild(l); div.appendChild(c); breakdown.appendChild(div);
    });
    modal.style.display = 'flex';
}

async function showDictionary() {
    const modal = document.getElementById('dictModal');
    const results = document.getElementById('dict-results');
    modal.style.display = 'flex';
    
    const playedWords = moveHistory.filter(m => m.action === 'play').map(m => m.wordString);
    if (playedWords.length === 0) { results.innerHTML = '<p style="color:var(--text-muted);">No words have been played yet.</p>'; return; }
    
    results.innerHTML = '<p style="color:var(--text-muted);">Loading definitions...</p>';
    const words = Array.from(new Set(playedWords)).slice(0, 3);
    let html = '';
    
    for (const w of words) {
        try {
            const reqLang = (currentLang === 'en' ? 'en' : (currentLang === 'fr' ? 'fr' : (currentLang === 'es' ? 'es' : (currentLang === 'de' ? 'de' : 'en'))));
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/${reqLang}/${w.toLowerCase()}`);
            
            if (!res.ok) { html += `<h4 style="color:var(--text-main); margin-bottom:5px;">${w}</h4><p style="color:var(--text-muted); font-size:0.9rem; margin-top:0;">Definition not found.</p><hr style="border-color:var(--cell-border);">`; continue; }
            const data = await res.json();
            let defsHtml = data[0].meanings.slice(0,2).map(m => `<li><em>${m.partOfSpeech}</em>: ${m.definitions[0].definition}</li>`).join('');
            html += `<h4 style="color:var(--text-main); margin-bottom:5px;">${w}</h4><ul style="color:var(--text-main); font-size:0.95rem; padding-left:20px; margin-top:0;">${defsHtml}</ul><hr style="border-color:var(--cell-border);">`;
        } catch (e) { html += `<h4 style="color:var(--text-main);">${w}</h4><p style="color:#ff5c5c; font-size:0.9rem;">Error fetching definition.</p><hr style="border-color:var(--cell-border);">`; }
    }
    results.innerHTML = html;
}

// ----------------------------------------------------
// A.I LOGIC
// ----------------------------------------------------

function playAI(forceWorst = false, forceRandom = false, isSimulated = false) {
    if (!isSimulated && !isTimeRavaging && !forceWorst && !forceRandom && (gameConfig.ai === 'local' || (turn !== 1 && turn !== 2) || aiVocab.length === 0)) return;
    if (marketActive) return;
    
    let aiRack = [...racks[turn]];
    let anchors = [];
    let isFirstTurn = true;
    for(let r=0; r<15; r++) for(let c=0; c<15; c++) if(boardState[r][c]) { anchors.push({r, c, letter: boardState[r][c].letter}); isFirstTurn = false; }

    let validMoves = [];
    let maxSearchLimit = (gameConfig.ai === 'hard' || isTimeRavaging) ? 15000 : (gameConfig.ai === 'medium' ? 5000 : 1500);
    let wordsToCheck = aiVocab.slice(0, maxSearchLimit);

    function tryPlacement(word, startR, startC, isHoriz) {
        let r = startR, c = startC, rackCopy = [...aiRack], wordMove = [];
        for (let i = 0; i < word.length; i++) {
            let char = word[i];
            if (r > 14 || c > 14 || r < 0 || c < 0) return;
            
            if (boardState[r][c]) { if (boardState[r][c].letter !== char) return; } 
            else {
                let rIdx = rackCopy.indexOf(char);
                if (rIdx === -1) rIdx = rackCopy.indexOf('_');
                if (rIdx === -1) return;
                let usedChar = rackCopy[rIdx]; rackCopy.splice(rIdx, 1);
                wordMove.push({row: r, col: c, letter: char, original: usedChar});
            }
            if (isHoriz) c++; else r++;
        }
        if (wordMove.length === 0) return;
        currentMove = wordMove;
        if (validateMoveBasic()) {
            const wordsFormed = findWordsOnBoard();
            if (wordsFormed.length > 0 && wordsFormed.every(w => dictionary.has(w.word))) {
                validMoves.push({ move: JSON.parse(JSON.stringify(wordMove)), score: calculateScore() });
            }
        }
        currentMove = [];
    }

    if (isFirstTurn) {
        for (let word of wordsToCheck) {
            if (word.length > 7 || !canFormWord(word, aiRack)) continue;
            tryPlacement(word, 7, 7, true);
            if (validMoves.length > 5 && gameConfig.ai === 'easy') break;
        }
    } else {
        for (let anchor of anchors) {
            let available = [...aiRack, anchor.letter];
            let possibleWords = wordsToCheck.filter(w => w.includes(anchor.letter) && w.length <= available.length && canFormWord(w, available));
            for (let word of possibleWords) {
                let idx = word.indexOf(anchor.letter);
                while(idx !== -1) {
                    tryPlacement(word, anchor.r, anchor.c - idx, true);
                    tryPlacement(word, anchor.r - idx, anchor.c, false);
                    idx = word.indexOf(anchor.letter, idx + 1);
                }
            }
        }
    }

    if (validMoves.length > 0) {
        validMoves.sort((a, b) => a.score - b.score);
        let selectedMove;

        if (forceRandom) {
            selectedMove = validMoves[Math.floor(Math.random() * validMoves.length)].move;
            delete activeEffects[turn].confused;
        } else if (forceWorst) {
            selectedMove = validMoves[0].move;
            delete activeEffects[turn].suggestion;
        } else if (gameConfig.ai === 'hard') {
            selectedMove = validMoves[validMoves.length - 1].move;
        } else if (gameConfig.ai === 'medium') {
            selectedMove = validMoves[Math.floor(validMoves.length / 2)].move;
        } else {
            selectedMove = validMoves[Math.floor(validMoves.length * 0.15)].move; 
        }

        currentMove = selectedMove;
        currentMove.forEach(m => { let rIdx = racks[turn].indexOf(m.original); if (rIdx !== -1) racks[turn].splice(rIdx, 1); });
        renderBoard();
        setTimeout(() => submitMove(), isTimeRavaging ? 200 : 1200);
    } else {
        if (bag.length >= 7) {
            let toSwap = [...racks[turn]]; racks[turn] = []; toSwap.forEach(t => bag.push(t)); shuffle(bag); fillRack(turn);
            moveHistory.unshift({ player: turn, action: 'swap', count: toSwap.length, pts: 0 });
            
            globalTurnCounter++;
            if (globalTurnCounter % 2 === 0) startMarketPhase();
            else nextTurn();
        } else passTurn();
    }
}

function showWishModal(playerId, onComplete) {
    const modal = document.getElementById('dictModal');
    const results = document.getElementById('dict-results');
    document.getElementById('ui-dict-title').innerText = "Make a Wish";
    modal.style.display = 'flex';
    
    let html = '<p>Select any spell to cast immediately:</p><div class="wish-grid">';
    Object.values(SPELLS).flat().forEach(spell => {
        html += `<div class="wish-item" onclick="document.getElementById('dictModal').style.display='none'; castSpellEffect(${JSON.stringify(spell)}, ${playerId}, ${onComplete})">
            <h4>${spell.title}</h4><p>${spell.desc}</p></div>`;
    });
    html += '</div>';
    results.innerHTML = html;
}

function canFormWord(word, availableLetters) {
    let temp = [...availableLetters]; let blanks = temp.filter(c => c === '_').length;
    for (let char of word) {
        let idx = temp.indexOf(char);
        if (idx !== -1) temp.splice(idx, 1);
        else if (blanks > 0) blanks--;
        else return false;
    }
    return true;
}

function showSpellTester() {
    const modal = document.getElementById('dictModal');
    const results = document.getElementById('dict-results');
    document.getElementById('ui-dict-title').innerText = "Spell Grimoire (Tester)";
    modal.style.display = 'flex';
    
    let html = '<div class="wish-grid">';
    Object.values(SPELLS).flat().forEach(spell => {
        html += `
            <div class="wish-item" onclick="testSpell('${spell.id}')">
                <h4>${spell.title} (Lvl ${spell.level})</h4>
                <p>${spell.desc}</p>
            </div>
        `;
    });
    html += '</div>';
    results.innerHTML = html;
}

function testSpell(spellId) {
    const spell = Object.values(SPELLS).flat().find(s => s.id === spellId);
    if (!spell) return;

    document.getElementById('dictModal').style.display = 'none';
    
    const onResolve = () => {
        updateUI();
        saveGame();
        console.log(`Debug: ${spell.title} executed.`);
    };

    const isAsync = castSpellEffect(spell, turn, onResolve);
    if (!isAsync) onResolve();
}

function saveGame() { localStorage.setItem('spellbook_save', JSON.stringify({ boardState, racks, bag, scores, turn, moveHistory, timers, playerNames, gameConfig, globalTurnCounter, roundScores, bingoCoupons, playerSpells, activeEffects, lostPoints })); }
function quitToLauncher() { document.getElementById('game-wrapper').style.display = 'none'; document.getElementById('launcher').style.display = 'flex'; document.body.className = document.getElementById('setting-dark').checked ? 'dark-mode' : ''; }

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}