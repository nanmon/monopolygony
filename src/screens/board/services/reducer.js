import { tiles, properties } from './board.json';
import {
    isBuyable,
    getOwner,
    getBlockOwner,
    getRailroadsOwned,
    isMiscTile,
    getCompaniesOwned,
    canBuyHouses,
} from './util.js';

export function reducer(state, action) {
    let newState = { ...state };
    switch (action.type) {
        case 'next': {
            newState = nextReducer(newState, action);
            break;
        }
        case 'select': {
            if (action.player) {
                const index = state.players.indexOf(action.player);
                newState.selected = { type: 'player', index };
            } else {
                newState.selected = { type: 'property', tile: action.tile };
            }
            break;
        }
        case 'buy-house': {
            newState = buyHouse(newState);
            break;
        }
        default:
            throw new Error('invalid action type');
    }
    return newState;
}

function nextReducer(state, action) {
    let newState = { ...state };
    switch (state.phase) {
        case 'roll': {
            newState = advance(newState);
            newState.phase = 'end';
            break;
        }
        case 'end': {
            newState = endReducer(newState, action);
            newState = nextTurn(newState);
            break;
        }
        default:
            throw new Error('invalid action type');
    }
    return newState;
}

function endReducer(state, action) {
    let newState = { ...state };
    const player = state.players[state.turn];
    const landedOn = tiles[player.position];
    const owner = getOwner(state, landedOn.id);
    // buyable
    if (isMiscTile(state)) {
        console.log('misc');
        newState = applyMisc(state);
    } else if (isBuyable(state, landedOn.id)) {
        console.log(action);
        // decided to buy
        if (action.buy) {
            newState = tryBuy(state);
        } // else: pass
        // owned by someone
    } else if (owner !== -1) {
        if (owner !== state.turn) {
            // pay rent
            newState = payRent(state);
        } // else : pass if owned by current player
    }
    return newState;
}

function advance(state) {
    const newState = { ...state };
    const dice1 = Math.ceil(Math.random() * 6);
    const dice2 = Math.ceil(Math.random() * 6);
    newState.lastDices = [dice1, dice2];
    const player = { ...state.players[state.turn] };
    const oldPosition = player.position;
    player.position = (player.position + dice1 + dice2) % 40;
    if (player.position < oldPosition) {
        // passed GO
        player.money += 200;
    }
    newState.players = [...state.players];
    newState.players[state.turn] = player;
    return newState;
}

function payRent(state) {
    const newState = { ...state };
    const player = { ...state.players[state.turn] };
    const tile = tiles[player.position];
    const property = properties.find(p => p.id === tile.id);
    const ownership = state.properties.find(p => p.id === tile.id);
    let rent = 0;
    switch (tile.type) {
        case 'property': {
            rent = property.rent;
            if (getBlockOwner(state, property.group) !== -1) {
                rent *= 2;
            }
            if (ownership.houses > 0) {
                rent = property.multpliedrent[ownership.houses - 1];
            }
            break;
        }
        case 'railroad': {
            const count = getRailroadsOwned(state, ownership.ownedBy);
            rent = property.multpliedrent[count - 1];
            break;
        }
        case 'company': {
            const count = getCompaniesOwned(state, ownership.ownedBy);
            const multiplier = property.multpliedrent[count - 1];
            rent = (state.lastDices[0] + state.lastDices[1]) * multiplier;
            break;
        }
        default:
            throw new Error('invalid tile type');
    }
    newState.players = [...state.players];
    player.money -= rent;
    newState.players[state.turn] = player;
    const owner = { ...state.players[ownership.ownedBy] };
    owner.money += rent;
    newState.players[ownership.ownedBy] = owner;
    return newState;
}

function tryBuy(state) {
    const newState = { ...state };
    newState.players = [...state.players];
    newState.properties = [...state.properties];
    const player = { ...state.players[state.turn] };
    const tile = tiles[player.position];
    const property = properties.find(p => p.id === tile.id);
    if (!property || !property.price) return newState;
    if (property.price > player.money) return newState;
    player.money -= property.price;
    newState.properties.push({
        index: player.position,
        id: property.id,
        ownedBy: state.turn,
        houses: 0,
        mortgaged: false,
    });
    newState.players[state.turn] = player;
    return newState;
}

function applyMisc(state) {
    const newState = { ...state };
    newState.players = [...state.players];
    const player = { ...state.players[state.turn] };
    const tile = tiles[player.position];
    switch (tile.id) {
        case 'tax1':
            player.money -= 200;
            break;
        case 'tax2':
            player.money -= 100;
            break;
        case 'gotojail':
            player.position = 10;
            player.frozenTurns = 3;
            break;
        default:
            return newState;
        // throw new Error('invalid tile id');
    }
    newState.players[state.turn] = player;
    return newState;
}

function nextTurn(state) {
    const newState = { ...state };
    newState.turn = (state.turn + 1) % state.players.length;
    newState.phase = 'roll';
    const nextPlayer = { ...state.players[newState.turn] };
    if (!nextPlayer.frozenTurns || nextPlayer.frozenTurns <= 0) return newState;
    nextPlayer.frozenTurns--;
    if (nextPlayer.frozenTurns === 0) {
        nextPlayer.money -= 50;
    } else {
        newState.phase = 'end';
    }
    newState.players = [...state.players];
    newState.players[newState.turn] = nextPlayer;
    return newState;
}

function buyHouse(state) {
    const propertyId = state.selected.tile.id;
    if (!canBuyHouses(state, propertyId)) return state;
    const ownershipIndex = state.properties.findIndex(p => p.id === propertyId);
    const ownership = state.properties[ownershipIndex];
    const newState = { ...state };
    newState.properties = [...state.properties];
    newState.properties[ownershipIndex] = {
        ...ownership,
        houses: ownership.houses + 1,
    };
    const owner = { ...state.players[ownership.ownedBy] };
    const property = properties.find(p => p.id === propertyId);
    owner.money -= property.housecost;
    newState.players = [...state.players];
    newState.players[ownership.ownedBy] = owner;
    return newState;
}
