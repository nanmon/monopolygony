import React from 'react';
import { tiles, properties } from './board.json';
import {
    isBuyable,
    getOwner,
    getBlockOwner,
    getRailroadsOwned,
    isMiscTile,
    getCompaniesOwned,
    canBuyHouses,
    canMortgage,
    canUnmortgage,
    canSellHouses,
} from './util.js';

export function useBoardState() {
    return React.useReducer(reducer, null, init);
}

function init() {
    return {
        players: [
            { position: 0, money: 1500, color: 'red', frozenTurns: -1 },
            { position: 0, money: 1500, color: 'blue', frozenTurns: -1 },
            { position: 0, money: 1500, color: 'green', frozenTurns: -1 },
            { position: 0, money: 1500, color: 'gold', frozenTurns: -1 },
        ],
        properties: [
            // {
            //     index: 2,
            //     id: 'asdasd'
            //     ownedBy: -1, // player index,
            //     houses: 0, // 0 - 5
            //     mortgaged: false
            // }
        ],
        trade: [
            // { player: number, money: number, properties: id[] },
        ],
        turn: 0,
        phase: 'roll',
        lastDices: [0, 0],
        doublesCount: 0,
        selected: {
            type: 'player',
            index: 0,
        },
    };
}

function reducer(state, action) {
    let newState = { ...state };
    switch (action.type) {
        case 'next': {
            const player = state.players[state.turn];
            if (player.frozenTurns <= 0)
                newState = unjailedMachine(newState, action);
            else newState = jailedMachine(newState, action);
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
        case 'sell-house': {
            newState = sellHouse(newState);
            break;
        }
        case 'mortgage': {
            newState = mortgage(newState);
            break;
        }
        case 'trade-add':
        case 'trade-remove':
        case 'trade-set':
        case 'trade-cancel':
        case 'trade-done': {
            newState = trade(newState, action);
            break;
        }
        default:
            throw new Error('invalid action type');
    }
    return newState;
}

function unjailedMachine(state, action) {
    let newState = { ...state };
    switch (state.phase) {
        case 'roll': {
            newState = roll(newState, action);
            if (newState.phase === 'roll') {
                newState.phase = 'advance';
            }
            break;
        }
        case 'advance': {
            newState = advance(newState);
            if (newState.phase === 'advance') {
                newState.phase = 'tileEffect';
            }
            break;
        }
        case 'tileEffect': {
            newState = tileEffect(newState, action);
            if (newState.phase === 'tileEffect') {
                // skip end
                newState = nextTurn(newState);
                newState.phase = 'roll';
            }
            break;
        }
        case 'end': {
            newState = nextTurn(newState);
            newState.phase = 'roll';
            break;
        }
        default:
            throw new Error('invalid action type');
    }
    return newState;
}

function jailedMachine(state, action) {
    let newState = { ...state };
    switch (state.phase) {
        case 'roll': {
            newState = jailedRoll(newState, action);
            if (newState.phase === 'roll') {
                // asume stayed in jail
                newState.phase = 'end';
            }
            break;
        }
        case 'payFine': {
            newState = payJail(newState, action);
            newState.phase = 'advance';
            break;
        }
        case 'advance': {
            newState = advance(newState);
            newState.phase = 'tileEffect';
            break;
        }
        case 'tileEffect': {
            newState = tileEffect(newState, action);
            if (newState.phase === 'tileEffect') {
                // no effect, skip end
                newState = jailedEnd(newState);
                newState.phase = 'roll';
            }
            break;
        }
        case 'end': {
            newState = jailedEnd(newState);
            newState.phase = 'roll';
            break;
        }
        default:
            throw new Error('invalid action type');
    }
    return newState;
}

function tileEffect(state, action) {
    let newState = { ...state };
    const player = state.players[state.turn];
    const landedOn = tiles[player.position];
    const owner = getOwner(state, landedOn.id);
    if (isMiscTile(state)) {
        newState = applyMisc(state); // includes phase change
        // buyable
    } else if (isBuyable(state, landedOn.id)) {
        // decided to buy
        if (action.buy) {
            newState = tryBuy(state);
            newState.phase = 'end';
        } // else: pass
        // owned by someone
    } else if (owner !== -1) {
        if (owner !== state.turn) {
            // pay rent
            newState = payRent(state);
            newState.phase = 'end';
        } // else : pass if owned by current player
    }
    return newState;
}

function roll(state, action) {
    const newState = { ...state };
    newState.lastDices = [action.dice1, action.dice2];
    if (action.dice1 === action.dice2) {
        newState.doublesCount++;
    } else {
        newState.doublesCount = 0;
    }
    return newState;
}

function advance(state) {
    const newState = { ...state };
    const player = { ...state.players[state.turn] };
    if (state.doublesCount === 3) {
        newState.doublesCount = 0;
        player.position = 10;
        player.sentToJail = true;
        newState.players = [...state.players];
        newState.players[state.turn] = player;
        newState.phase = 'end';
        return newState;
    }
    const [dice1, dice2] = newState.lastDices;
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
    if (ownership.mortgaged) return newState;
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
            player.sentToJail = true;
            break;
        default:
            return newState;
        // throw new Error('invalid tile id');
    }
    newState.players[state.turn] = player;
    newState.phase = 'end';
    return newState;
}

function nextTurn(state) {
    const newState = { ...state };
    const player = { ...state.players[state.turn] };
    if (player.sentToJail) {
        player.sentToJail = false;
        player.frozenTurns = 3;
    } else if (state.doublesCount > 0 && state.doublesCount < 3) {
        return newState;
    }
    newState.players = [...state.players];
    newState.players[state.turn] = player;
    newState.turn = (state.turn + 1) % state.players.length;
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

function sellHouse(state) {
    const propertyId = state.selected.tile.id;
    if (!canSellHouses(state, propertyId)) return state;
    const ownershipIndex = state.properties.findIndex(p => p.id === propertyId);
    const ownership = state.properties[ownershipIndex];
    const newState = { ...state };
    newState.properties = [...state.properties];
    newState.properties[ownershipIndex] = {
        ...ownership,
        houses: ownership.houses - 1,
    };
    const owner = { ...state.players[ownership.ownedBy] };
    const property = properties.find(p => p.id === propertyId);
    owner.money += property.housecost / 2;
    newState.players = [...state.players];
    newState.players[ownership.ownedBy] = owner;
    return newState;
}

function mortgage(state) {
    const ownershipIndex = state.properties.findIndex(
        p => state.selected.tile.id === p.id,
    );
    const ownership = { ...state.properties[ownershipIndex] };
    if (!ownership) return state;
    if (ownership.mortgaged) {
        if (!canUnmortgage(state, ownership.id)) return state;
        const newState = { ...state };
        ownership.mortgaged = false;
        newState.properties = [...state.properties];
        newState.properties[ownershipIndex] = ownership;
        const property = properties.find(p => p.id === ownership.id);
        const player = { ...state.players[ownership.ownedBy] };
        player.money -= Math.ceil(property.price * 0.55); // half price + 10%
        newState.players = [...state.players];
        newState.players[ownership.ownedBy] = player;
        return newState;
    } else {
        if (!canMortgage(state, ownership.id)) return state;
        const newState = { ...state };
        ownership.mortgaged = true;
        newState.properties = [...state.properties];
        newState.properties[ownershipIndex] = ownership;
        const property = properties.find(p => p.id === ownership.id);
        const player = { ...state.players[ownership.ownedBy] };
        player.money += property.price * 0.5;
        newState.players = [...state.players];
        newState.players[ownership.ownedBy] = player;
        return newState;
    }
}

function jailedRoll(state, action) {
    const newState = { ...state };
    newState.lastDices = [action.dice1, action.dice2];
    const player = { ...state.players[state.turn] };
    if (action.dice1 === action.dice2) {
        player.frozenTurns = 1;
        newState.players = [...state.players];
        newState.players[state.turn] = player;
        newState.phase = 'advance';
    } else if (player.frozenTurns === 1) {
        // last turn
        newState.phase = 'payFine';
    } else {
        newState.phase = 'end';
    }
    return newState;
}

function payJail(state) {
    const newState = { ...state };
    const player = { ...state.players[state.turn] };
    player.money -= 50;
    newState.players = [...state.players];
    newState.players[state.turn] = player;
    return newState;
}

function jailedEnd(state) {
    const newState = { ...state };
    const player = { ...state.players[state.turn] };
    player.frozenTurns--;
    newState.players = [...state.players];
    newState.players[newState.turn] = player;
    newState.turn = (state.turn + 1) % state.players.length;
    return newState;
}

function trade(state, action) {
    const newState = { ...state };
    switch (action.type) {
        case 'trade-add': {
            const tradeIndex = state.trade.findIndex(
                t => t.playerIndex === action.playerIndex,
            );
            let newTradeObj;
            newState.trade = [...state.trade];
            if (tradeIndex === -1) {
                if (state.trade.length === 2) return state;
                newTradeObj = {
                    playerIndex: action.playerIndex,
                    money: 0,
                    properties: [action.propertyId],
                };
                newState.trade.push(newTradeObj);
            } else {
                newTradeObj = { ...state.trade[tradeIndex] };
                if (newTradeObj.properties.includes(action.propertyId))
                    return state;
                newTradeObj.properties = [
                    ...state.trade[tradeIndex].properties,
                    action.propertyId,
                ];
                newState.trade[tradeIndex] = newTradeObj;
            }
            break;
        }
        case 'trade-remove': {
            const tradeIndex = state.trade.findIndex(
                t => t.playerIndex === action.playerIndex,
            );
            if (tradeIndex === -1) return state;
            const newTradeObj = { ...state.trade[tradeIndex] };
            newTradeObj.properties = [...state.trade[tradeIndex].properties];
            const propertyIndex = newTradeObj.properties.findIndex(
                p => p.id === action.propertyId,
            );
            if (propertyIndex === -1) return state;
            newTradeObj.properties.splice(propertyIndex, 1);
            newState.trade = [...state.trade];
            newState.trade[tradeIndex] = newTradeObj;
            break;
        }
        case 'trade-set': {
            const tradeIndex = state.trade.findIndex(
                t => t.playerIndex === action.playerIndex,
            );
            let newTradeObj;
            newState.trade = [...state.trade];
            if (tradeIndex === -1) {
                if (state.trade.length === 2) return state;
                newTradeObj = {
                    playerIndex: action.playerIndex,
                    money: action.money,
                    properties: [],
                };
                newState.trade.push(newTradeObj);
            } else {
                newTradeObj = { ...state.trade[tradeIndex] };
                newTradeObj.money = action.money;
                newState.trade[tradeIndex] = newTradeObj;
            }
            break;
        }
        case 'trade-cancel': {
            newState.trade = [];
            break;
        }
        case 'trade-done': {
            const [trade1, trade2] = state.trade;
            if (!trade1 || !trade2) return state;
            const player1 = { ...state.players[trade1.playerIndex] };
            const player2 = { ...state.players[trade2.playerIndex] };
            player1.money += trade2.money;
            player1.money -= trade1.money;
            player2.money += trade1.money;
            player2.money -= trade2.money;
            newState.players = [...state.players];
            newState.players[trade1.playerIndex] = player1;
            newState.players[trade2.playerIndex] = player2;
            newState.properties = [...state.properties];
            trade1.properties.forEach(propId => {
                const ownershipIndex = newState.properties.findIndex(
                    p => p.id === propId,
                );
                const newOwnership = { ...newState.properties[ownershipIndex] };
                newOwnership.ownedBy = trade2.playerIndex;
                newState.properties[ownershipIndex] = newOwnership;
            });
            trade2.properties.forEach(propId => {
                const ownershipIndex = newState.properties.findIndex(
                    p => p.id === propId,
                );
                const newOwnership = { ...newState.properties[ownershipIndex] };
                newOwnership.ownedBy = trade1.playerIndex;
                newState.properties[ownershipIndex] = newOwnership;
            });
            newState.trade = [];
            break;
        }
        default:
            throw new Error('invalid trade type');
    }
    return newState;
}
