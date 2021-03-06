import firebase from 'firebase/app';
import {
    getBlockOwner,
    isMiscTile,
    canBuyHouses,
    canMortgage,
    canUnmortgage,
    canSellHouses,
    canTrade,
    getPlayerInTurn,
    getPlayerTile,
    getTileAt,
    getRailroadsOwned,
    getCompaniesOwned,
    getOwner,
    getTileById,
    getTileOwner,
    getTradeByPlayer,
    getTradeById,
    getPlayerById,
    canBuyProperty,
    isBuyable,
    getTilesOwnedBy,
} from './util';

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.Action} action
 */

export function dispatcher(state, action) {
    const batch = firebase.firestore().batch();
    switch (action.type) {
        case 'next': {
            if (!state.game.data().started) {
                return state.game.ref.update({ started: true });
            }
            // if (!canProcede(newState)) return state;
            const player = getPlayerInTurn(state);
            if (player.data().frozenTurns <= 0)
                unjailedMachine(state, action, batch);
            else jailedMachine(state, action, batch);
            break;
        }
        case 'buy-house': {
            buyHouse(state, action, batch);
            break;
        }
        case 'sell-house': {
            sellHouse(state, action, batch);
            break;
        }
        case 'mortgage': {
            mortgage(state, action, batch);
            break;
        }
        case 'trade-new':
            tradeNew(state, action, batch);
            break;
        case 'trade-set':
            tradeSet(state, action, batch);
            break;
        case 'trade-add':
            tradeAdd(state, action, batch);
            break;
        case 'trade-remove':
            tradeRemove(state, action, batch);
            break;
        case 'trade-money':
            tradeMoney(state, action, batch);
            break;
        case 'trade-cancel':
            tradeCancel(state, action, batch);
            break;
        case 'trade-done': {
            tradeDone(state, action, batch);
            break;
        }
        case 'bankrupt': {
            treatBankrupcy(state, action, batch);
            break;
        }
        case 'add-player':
            addPlayer(state, action, batch);
            break;
        case 'remove-player':
            removePlayer(state, action, batch);
            break;
        case 'join-game':
            joinGame(state, action, batch);
            break;
        default:
            throw new Error(`invalid action type ${action.type}`);
    }
    return batch.commit();
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.Action} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function unjailedMachine(state, action, batch) {
    switch (state.game.data().phase) {
        case 'roll': {
            const newPhase = roll(state, action, batch);
            if (!newPhase) {
                batch.update(state.game.ref, { phase: 'advance' });
            }
            break;
        }
        case 'advance': {
            const newPhase = advance(state, action, batch);
            if (!newPhase) {
                batch.update(state.game.ref, { phase: 'tileEffect' });
            }
            break;
        }
        case 'tileEffect': {
            const newPhase = tileEffect(state, action, batch);
            if (!newPhase) {
                // skip end
                nextTurn(state, action, batch);
            }
            break;
        }
        case 'chest': {
            chestEffect(state, action, batch);

            break;
        }
        case 'end': {
            nextTurn(state, action, batch);
            break;
        }
        default:
            throw new Error(`invalid phase ${state.game.data().phase}`);
    }
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.Action} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function jailedMachine(state, action, batch) {
    switch (state.game.data().phase) {
        case 'roll': {
            const newPhase = jailedRoll(state, action, batch);
            if (!newPhase) {
                // asume stayed in jail
                batch.update(state.game.ref, { phase: 'end' });
            }
            break;
        }
        case 'payFine': {
            payJail(state, action, batch);
            batch.update(state.game.ref, { phase: 'advance' });
            break;
        }
        case 'advance': {
            const newPhase = advance(state, action, batch);
            if (!newPhase) {
                batch.update(state.game.ref, { phase: 'tileEffect' });
            }
            break;
        }
        case 'tileEffect': {
            const newPhase = tileEffect(state, action, batch);
            if (!newPhase) {
                // no effect, skip end
                jailedEnd(state, action, batch);
                batch.update(state.game.ref, { phase: 'roll' });
            }
            break;
        }
        case 'end': {
            jailedEnd(state, action, batch);
            batch.update(state.game.ref, { phase: 'roll' });

            break;
        }
        default:
            throw new Error(`invalid phase ${state.game.data().phase}`);
    }
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.NextAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function tileEffect(state, action, batch) {
    const player = getPlayerInTurn(state);
    const tile = getPlayerTile(state, player);
    const owner = tile.data().owner;
    if (isMiscTile(tile)) {
        return applyMisc(state, action, batch); // includes phase change
        // buyable
    } else if (isBuyable(state, tile)) {
        // decided to buy
        if (action.buy) {
            return tryBuy(state, action, batch);
        } // else: pass
        // owned by someone
    } else if (owner !== null) {
        if (owner !== player.id) {
            // pay rent
            return payRent(state, action, batch);
            // newState.phase = 'end'; phase changes if rent applied
        } // else : pass if owned by current player
    }
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.NextAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function roll(state, action, batch) {
    let update = {
        lastDices: [action.dice1, action.dice2],
        doublesCount: 0,
    };
    if (action.dice1 === action.dice2) {
        update.doublesCount = state.game.data().doublesCount + 1;
    }
    batch.update(state.game.ref, update);
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.NextAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function advance(state, _action, batch) {
    const player = getPlayerInTurn(state);
    if (state.game.data().doublesCount === 3) {
        batch.update(player.ref, { position: 'jail', sentToJail: true });
        batch.update(state.game.ref, { doublesCount: 0, phase: 'end' });
        return 'end';
    }
    const [dice1, dice2] = state.game.data().lastDices;
    const tile = getPlayerTile(state, player);
    const newPosition = (tile.data().position + dice1 + dice2) % 40;
    const newTile = getTileAt(state, newPosition);

    const playerUpdate = { position: newTile.id };
    if (newPosition < tile.data().position) {
        // passed GO
        playerUpdate.money = player.data().money + 200;
    }
    batch.update(player.ref, playerUpdate);
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.NextAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function payRent(state, _action, batch) {
    const player = getPlayerInTurn(state);
    const tile = getPlayerTile(state, player);
    const owner = getOwner(state, tile);
    if (tile.data().mortgaged) return;
    let rent = 0;
    switch (tile.data().type) {
        case 'property': {
            rent = tile.data().rent;
            if (getBlockOwner(state, tile.data().group)) {
                rent *= 2;
            }
            if (tile.data().buildings > 0) {
                rent = tile.data().rentIncreases[tile.data().buildings - 1];
            }
            break;
        }
        case 'railroad': {
            const railroads = getRailroadsOwned(state, owner.id);
            rent = tile.data().rentIncreases[railroads.length - 1];
            break;
        }
        case 'company': {
            const companies = getCompaniesOwned(state, owner.id);
            const count = companies.length;
            const multiplier = tile.data().rentIncreases[count - 1];
            rent =
                (state.game.data().lastDices[0] +
                    state.game.data().lastDices[1]) *
                multiplier;
            break;
        }
        default:
            throw new Error(`invalid tile type ${tile.type}`);
    }
    batch.update(player.ref, { money: player.data().money - rent });
    batch.update(owner.ref, { money: owner.data().money + rent });
    batch.update(state.game.ref, { phase: 'end' });
    return 'end';
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.NextAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function tryBuy(state, _action, batch) {
    const player = getPlayerInTurn(state);
    const tile = getPlayerTile(state, player);
    if (!canBuyProperty(state, tile, player)) return;
    batch.update(player.ref, {
        money: player.data().money - tile.data().price,
    });
    batch.update(tile.ref, { owner: player.id });
    batch.update(state.game.ref, { phase: 'end' });
    return 'end';
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.NextAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function applyMisc(state, action, batch) {
    const player = getPlayerInTurn(state);
    const tile = getPlayerTile(state, player);
    switch (tile.type) {
        case 'tax':
            const tax = tile.id === 'tax1' ? 200 : 100;
            batch.update(player.ref, { money: player.data().money - tax });
            break;
        case 'gotojail':
            batch.update(player.ref, { position: 'jail', sentToJail: true });
            break;
        case 'chest':
            batch.update(state.game.ref, { phase: 'chest' });
            return 'chest';
        default:
            batch.update(state.game.ref, { phase: 'end' });
            return;
    }
    return 'end';
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.NextAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function nextTurn(state, action, batch) {
    const player = getPlayerInTurn(state);
    batch.update(state.game.ref, { phase: 'roll' });
    const { doublesCount, order, turn } = state.game.data();
    if (player.data().sentToJail) {
        batch.update(player.ref, { sentToJail: false, frozenTurns: 3 });
        batch.update(state.game.ref, { doublesCount: 0 });
    } else if (doublesCount > 0 && doublesCount < 3) {
        return;
    }
    const index = order.indexOf(turn);
    const newIndex = (index + 1) % order.length;
    batch.update(state.game.ref, { turn: order[newIndex] });
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.BuyHouseAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function buyHouse(state, action, batch) {
    const tile = getTileById(state, action.tileId);
    if (!canBuyHouses(state, tile)) return;
    const owner = getTileOwner(state, tile);
    batch.update(tile.ref, { buildings: tile.data().buildings + 1 });
    batch.update(owner.ref, {
        money: owner.data().money - tile.data().buildingCost,
    });
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.SellHouseAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function sellHouse(state, action, batch) {
    const tile = getTileById(state, action.tileId);
    if (!canSellHouses(state, tile)) return;
    const owner = getTileOwner(state, tile);
    batch.update(tile.ref, { buildings: tile.data().buildings - 1 });
    batch.update(owner.ref, {
        money: owner.data().money + tile.data().buildingCost / 2,
    });
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.MortgageAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function mortgage(state, action, batch) {
    const tile = getTileById(state, action.tileId);
    const owner = getTileOwner(state, tile);
    if (tile.data().mortgaged) {
        if (!canUnmortgage(state, tile)) return;
        batch.update(tile.ref, { mortgaged: false });
        const cost = Math.ceil(tile.data().price * 0.55);
        batch.update(owner.ref, { money: owner.data().money - cost });
    } else {
        if (!canMortgage(state, tile)) return;
        batch.update(tile.ref, { mortgaged: true });
        const value = tile.data().price * 0.5;
        batch.update(owner.ref, { money: owner.data().money + value });
    }
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.NextAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function jailedRoll(state, action, batch) {
    const player = getPlayerInTurn(state);
    let gameUpdate = {
        lastDices: [action.dice1, action.dice2],
    };
    if (action.dice1 === action.dice2) {
        batch.update(player.ref, { frozenTurns: 1 });
        gameUpdate.phase = 'advance';
    } else if (player.frozenTurns === 1) {
        // last turn
        gameUpdate.phase = 'payFine';
    } else {
        gameUpdate.phase = 'end';
    }
    batch.update(state.game.ref, gameUpdate);
    return gameUpdate.phase;
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.NextAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function payJail(state, _action, batch) {
    const player = getPlayerInTurn(state);
    return batch.update(player.ref, { money: player.data().money - 50 });
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.NextAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function jailedEnd(state, action, batch) {
    const player = getPlayerInTurn(state);
    batch.update(player.ref, { frozenTurns: player.data().frozenTurns - 1 });
    const { order, turn } = state.game.data();
    const index = order.indexOf(turn);
    const newIndex = (index + 1) % order.length;
    batch.update(state.game.ref, { turn: order[newIndex] });
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.TradeNewAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function tradeNew(state, action, batch) {
    const existingTrade = getTradeByPlayer(state, action.playerId);
    if (existingTrade) return;
    const newTradeRef = state.game.ref.collection('Trades').doc();
    const bProperties = [];
    const wProperties = [];
    let wId = null;
    if (action.tileId) {
        const tile = getTileById(state, action.tileId);
        if (tile.data().owner === action.playerId) {
            bProperties.push(action.tileId);
        } else {
            wProperties.push(action.tileId);
            wId = tile.data().owner;
        }
    }
    batch.set(newTradeRef, {
        by: action.playerId,
        bProperties,
        bMoney: '0',
        with: wId,
        wProperties,
        wMoney: '0',
        turn: 'b',
        status: 'negotiation',
    });
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.TradeSetAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function tradeSet(state, action, batch) {
    const trade = getTradeById(state, action.tradeId);
    if (action.playerId === trade.data().by) return;
    batch.update(trade.ref, {
        with: action.playerId,
        wProperties: [],
        status: 'negotiation',
    });
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.TradeAddAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function tradeAdd(state, action, batch) {
    const trade = getTradeById(state, action.tradeId);
    if (!trade) return;
    const tile = getTileById(state, action.tileId);
    if (!canTrade(state, trade, tile)) return;
    const { by: bId, with: wId, bProperties, wProperties } = trade.data();
    if (bId === tile.data().owner) {
        const tileIndex = bProperties.indexOf(tile.id);
        if (tileIndex !== -1) bProperties.splice(tileIndex, 1);
        else bProperties.push(tile.id);
        batch.update(trade.ref, { bProperties, status: 'negotiation' });
    } else if (wId == null) {
        batch.update(trade.ref, {
            with: tile.data().owner,
            wProperties: [tile.id],
            status: 'negotiation',
        });
    } else if (wId === tile.data().owner) {
        const tileIndex = wProperties.indexOf(tile.id);
        if (tileIndex !== -1) wProperties.splice(tileIndex, 1);
        else wProperties.push(tile.id);
        batch.update(trade.ref, { wProperties, status: 'negotiation' });
    }
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.TradeRemoveAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function tradeRemove(state, action, batch) {
    const trade = getTradeById(state, action.tradeId);
    const { bProperties, wProperties } = trade.data();
    const bIndex = bProperties.indexOf(action.tileId);
    if (bIndex !== -1) {
        bProperties.splice(bIndex, 1);
        batch.update(trade.ref, { bProperties, status: 'negotiation' });
    }
    const wIndex = wProperties.indexOf(action.tileId);
    if (wIndex !== -1) {
        wProperties.splice(wIndex, 1);
        batch.update(trade.ref, { wProperties, status: 'negotiation' });
    }
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.TradeRemoveAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function tradeMoney(state, action, batch) {
    const trade = getTradeById(state, action.tradeId);
    const { bMoney, wMoney } = action;
    if (bMoney != null) {
        batch.update(trade.ref, { bMoney, status: 'negotiation' });
    } else if (wMoney != null) {
        batch.update(trade.ref, { wMoney, status: 'negotiation' });
    }
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.TradeCancelAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function tradeCancel(state, action, batch) {
    const tradeRef = state.game.ref.collection('Trades').doc(action.tradeId);
    batch.delete(tradeRef);
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.TradeDoneAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function tradeDone(state, action, batch) {
    const trade = getTradeById(state, action.tradeId);
    const {
        by: bId,
        with: wId,
        bMoney,
        wMoney,
        bProperties,
        wProperties,
        status,
        turn,
    } = trade.data();

    if (status === 'negotiation') {
        batch.update(trade.ref, {
            status: 'waiting',
            turn: turn === 'b' ? 'w' : 'b',
        });
        return;
    }

    const bPlayer = getPlayerById(state, bId);
    batch.update(bPlayer.ref, {
        money: bPlayer.data().money + Number(wMoney) - Number(bMoney),
    });

    const wPlayer = getPlayerById(state, wId);
    batch.update(wPlayer.ref, {
        money: wPlayer.data().money + Number(bMoney) - Number(wMoney),
    });

    bProperties.forEach(tileId => {
        const tile = getTileById(state, tileId);
        batch.update(tile.ref, { owner: wId });
    });

    wProperties.forEach(tileId => {
        const tile = getTileById(state, tileId);
        batch.update(tile.ref, { owner: bId });
    });
    batch.delete(trade.ref);
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.BankruptAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function treatBankrupcy(state, action, batch) {
    // bankrupt: true
    const player = getPlayerById(state, action.playerId);
    batch.update(player.ref, { bankrupt: true });

    // free properties
    const props = getTilesOwnedBy(state, player.id);
    props.forEach(tile => {
        batch.update(tile.ref, {
            owner: null,
            mortgaged: false,
            buildings: 0,
        });
    });

    // remove from turns
    let { order, turn } = state.game.data();
    const pIndex = order.indexOf(player.id);
    if (turn === player.id) {
        const nextIndex = (pIndex + 1) % order.length;
        turn = order[nextIndex];
    }
    order.splice(pIndex, 1);
    batch.update(state.game.ref, { order, turn });
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.AddPlayerAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function addPlayer(state, action, batch) {
    // if (game.players.length === PLAYER_COLORS.length) return state;
    const playerRef = state.game.ref.collection('Players').doc();
    batch.set(playerRef, {
        position: 'go',
        money: state.game.data().initialMoney,
        color: action.color,
        frozenTurns: -1,
        turn: state.players.size,
    });
    const { order } = state.game.data();
    order.push(playerRef.id);
    batch.update(state.game.ref, { order });
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.RemovePlayerAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function removePlayer(state, action, batch) {
    // if (newState.players.length === 2) return state;
    const playerRef = state.game.ref.collection('Players').doc(action.playerId);
    batch.delete(playerRef);
    const { order } = state.game.data();
    const index = order.indexOf(action.playerId);
    order.splice(index, 1);
    batch.update(state.game.ref, { order });
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.JoinGameAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function joinGame(state, action, batch) {
    // if (newState.players.length === 2) return state;
    const playerRef = state.game.ref.collection('Players').doc(action.userId);
    batch.set(playerRef, {
        position: 'go',
        money: state.game.data().initialMoney,
        color: action.color,
        frozenTurns: -1,
        turn: state.players.size,
    });
    const { order } = state.game.data();
    order.push(playerRef.id);
    batch.update(state.game.ref, { order });
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.JoinGameAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function chestEffect(state, action, batch) {
    const player = getPlayerInTurn(state);
    switch (action.chestType) {
        case 'move_to_id': {
            const tile = getPlayerTile(state, player);
            const newTile = getTileById(state, action.tileId);
            const newPosition = newTile.data().position;

            const playerUpdate = { position: newTile.id };
            if (newPosition < tile.data().position) {
                // passed GO
                playerUpdate.money = player.data().money + 200;
            }
            batch.update(player.ref, playerUpdate);
            break;
        }
        case 'move_to_nearest': {
            const tile = getPlayerTile(state, player);
            const newTile = getTileById(state, action.tileId);
            const newPosition = newTile.data().position;

            const playerUpdate = { position: newTile.id };
            if (newPosition < tile.data().position) {
                // passed GO
                playerUpdate.money = player.data().money + 200;
            }
            batch.update(player.ref, playerUpdate);
            break;
        }
        case 'get_bank_money': {
            batch.update(player.ref, {
                money: player.data().money + action.amount,
            });
            break;
        }
        case 'outofjail': {
            batch.update(player.ref, {
                outOfJailCards: (player.data().outOfJailCards || 0) + 1,
            });
            break;
        }
        case 'gotojail': {
            batch.update(player.ref, { position: 'jail', sentToJail: true });
            break;
        }
        case 'get_players_money': {
            let sum = 0;
            state.players.docs.forEach(p => {
                if (p.id === player.id) return;
                batch.update(p.ref, {
                    money: p.data().money - action.amount,
                });
                sum += action.amount;
            });
            batch.update(player.ref, {
                money: player.data().money + sum,
            });
            break;
        }
        case 'property_charges': {
            const properties = state.tiles.docs.filter(
                t => t.data().owner === player.id,
            );
            const buildings = properties.map(p => p.data().buildings);
            let totalHouses = 0,
                totalHotels = 0;
            buildings.forEach(b => {
                if (b === 5) {
                    totalHouses += 4;
                    totalHotels += 1;
                } else {
                    totalHouses += b;
                }
            });
            const charges =
                totalHouses * action.perHouse + totalHotels * action.perHotel;
            batch.update(player.ref, {
                money: player.data().money - charges,
            });
            break;
        }
        default:
            break;
    }
    batch.update(state.game.ref, { phase: 'end' });
}
