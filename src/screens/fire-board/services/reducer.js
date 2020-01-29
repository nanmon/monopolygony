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
    switch (tile.id) {
        case 'tax1':
            batch.update(player.ref, { money: player.data().money - 200 });
            break;
        case 'tax2':
            batch.update(player.ref, { money: player.data().money - 100 });
            break;
        case 'gotojail':
            batch.update(player.ref, { position: 'jail', sentToJail: true });
            break;
        default:
            return;
        // throw new Error('invalid tile id');
    }
    batch.update(state.game.ref, { phase: 'end' });
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
    const tile = getTileById(action.tileId);
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
    const tile = getTileById(state, action.tile);
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
    return batch.commit();
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
    batch.set(newTradeRef, {
        by: action.playerId,
        bProperties: [],
        bMoney: 0,
        with: null,
        wProperties: [],
        wMoney: 0,
    });
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.TradeSetAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function tradeSet(state, action, batch) {
    const trade = getTradeById(state, action.tradeId);
    batch.set(trade.ref, {
        with: action.playerId,
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
    const tile = getTileById(action.tileId);
    if (!canTrade(state, tile)) return;
    if (trade.data().by === tile.data().owner) {
        batch.update(trade.ref, {
            bProperties: [...trade.data().bProperties, tile.id],
        });
    } else if (trade.data().with === tile.data().owner) {
        batch.update(trade.ref, {
            with: tile.data().owner,
            wProperties: [...trade.data().wProperties, tile.id],
        });
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
        batch.update(trade.ref, { bProperties });
    }
    const wIndex = wProperties.indexOf(action.tileId);
    if (wIndex !== -1) {
        wProperties.splice(wIndex, 1);
        batch.update(trade.ref, { wProperties });
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
        batch.update(trade.ref, { bMoney });
    } else if (wMoney != null) {
        batch.update(trade.ref, { wMoney });
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
    } = trade.data();

    const bPlayer = getPlayerById(bId);
    batch.update(bPlayer.ref, {
        money: bPlayer.data().money + wMoney - bMoney,
    });

    const wPlayer = getPlayerById(wId);
    batch.update(wPlayer.ref, {
        money: wPlayer.data().money + bMoney - wMoney,
    });

    bProperties.forEach(tileId => {
        const tile = getTileById(tileId);
        batch.update(tile.ref, { owner: wId });
    });

    wProperties.forEach(tileId => {
        const tile = getTileById(tileId);
        batch.update(tile.ref, { owner: bId });
    });
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {Monopolygony.BankruptAction} action
 * @param {FirebaseFirestore.WriteBatch} batch
 */
function treatBankrupcy(state, action, batch) {
    const player = getPlayerById(action.playerId);
    batch.update(player.ref, { bankrupt: true });
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
        position: 0,
        money: state.game.data().initialMoney,
        color: action.color,
        frozenTurns: -1,
    });
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
}
