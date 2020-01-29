const {
    getBlockOwner,
    isMiscTile,
    canBuyHouses,
    canMortgage,
    canUnmortgage,
    canSellHouses,
    canTrade,
} = require('./util');
const admin = require('firebase-admin');

/**
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Game>} game
 */

exports.reducer = async function reducer(game, action) {
    switch (action.type) {
        case 'add-player':
            await addPlayer(game, action);
            break;
        case 'remove-player':
            await removePlayer(game, action);
            break;
        case 'next': {
            if (!game.data().started) {
                return game.ref.update({ started: true });
            }
            // if (!canProcede(newState)) return state;
            const player = game.ref.collection('Players').doc(game.data().turn);
            if (player.data().frozenTurns <= 0)
                await unjailedMachine(game, player, action);
            else await jailedMachine(game, player, action);
            break;
        }
        case 'buy-house': {
            await buyHouse(game, action);
            break;
        }
        case 'sell-house': {
            await sellHouse(game, action);
            break;
        }
        case 'mortgage': {
            await mortgage(game, action);
            break;
        }
        case 'trade-new':
            await tradeNew(game, action);
            break;
        case 'trade-add':
            await tradeAdd(game, action);
            break;
        case 'trade-remove':
            await tradeRemove(game, action);
            break;
        case 'trade-money':
            await tradeMoney(game, action);
            break;
        case 'trade-cancel':
            await tradeCancel(game, action);
            break;
        case 'trade-done': {
            await tradeDone(game, action);
            break;
        }
        case 'bankrupt': {
            await treatBankrupcy(game, action);
            break;
        }
        default:
            throw new Error(`invalid action type ${action.type}`);
    }
};

/**
 * @param {FirebaseFirestore.DocumentSnapshot} game
 * @param {FirebaseFirestore.DocumentSnapshot} player
 */

async function unjailedMachine(game, player, action) {
    switch (game.data().phase) {
        case 'roll': {
            const newPhase = await roll(game, player, action);
            if (!newPhase) {
                await game.ref.update({ phase: 'advance' });
            }
            break;
        }
        case 'advance': {
            const newPhase = await advance(game, player, action);
            if (!newPhase) {
                await game.ref.update({ phase: 'tileEffect' });
            }
            break;
        }
        case 'tileEffect': {
            const newPhase = await tileEffect(game, player, action);
            if (!newPhase) {
                // skip end
                await nextTurn(game, player);
            }
            break;
        }
        case 'end': {
            await nextTurn(game, player);
            break;
        }
        default:
            throw new Error(`invalid phase ${game.data().phase}`);
    }
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} game
 * @param {FirebaseFirestore.DocumentSnapshot} player
 */

async function jailedMachine(game, player, action) {
    switch (game.data().phase) {
        case 'roll': {
            const newPhase = await jailedRoll(game, player, action);
            if (!newPhase) {
                // asume stayed in jail
                await game.ref.update({ phase: 'end' });
            }
            break;
        }
        case 'payFine': {
            await payJail(game, player, action);
            await game.ref.update({ phase: 'advance' });
            break;
        }
        case 'advance': {
            await advance(game, player, action);
            await game.ref.update({ phase: 'tileEffect' });
            break;
        }
        case 'tileEffect': {
            const newPhase = await tileEffect(game, player, action);
            if (!newPhase) {
                // no effect, skip end
                await jailedEnd(game, player, action);
                await game.ref.update({ phase: 'roll' });
            }
            break;
        }
        case 'end': {
            await jailedEnd(game, player, action);
            break;
        }
        default:
            throw new Error(`invalid phase ${game.data().phase}`);
    }
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} game
 * @param {FirebaseFirestore.DocumentSnapshot} player
 */

async function tileEffect(game, player, action) {
    const tile = await game.ref
        .collection('Tiles')
        .doc(player.data().position)
        .get();
    const owner = tile.data().owner;
    if (isMiscTile(tile)) {
        return applyMisc(game, player, tile, action); // includes phase change
        // buyable
    } else if (tile.data().price != null) {
        // decided to buy
        if (action.buy) {
            await tryBuy(game, player, tile, action);
            await game.ref.update({ phase: 'end' });
            return 'end';
        } // else: pass
        // owned by someone
    } else if (owner !== null) {
        if (owner !== player.id) {
            // pay rent
            return await payRent(game, player, tile, action);
            // newState.phase = 'end'; phase changes if rent applied
        } // else : pass if owned by current player
    }
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} game
 * @param {FirebaseFirestore.DocumentSnapshot} player
 */
function roll(game, _player, action) {
    let update = {
        lastDices: [action.dice1, action.dice2],
        doublesCount: 0,
    };
    if (action.dice1 === action.dice2) {
        update.doublesCount = game.data().doublesCount + 1;
    }
    return game.ref.update(update);
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} game
 * @param {FirebaseFirestore.DocumentSnapshot} player
 */
async function advance(game, player, action) {
    if (game.data().doublesCount === 3) {
        await player.ref.update({ position: 'jail', sentToJail: true });
        return await game.ref.update({ doublesCount: 0, phase: 'end' });
    }
    const [dice1, dice2] = game.data().lastDices;
    const tile = await game.ref
        .collection('Tiles')
        .doc(player.data().position)
        .get();
    const newPosition = (tile.data().position + dice1 + dice2) % 40;
    const newTileQ = await game.ref
        .collection('Tiles')
        .where('position', '==', newPosition)
        .limit(1)
        .get();

    const playerUpdate = { position: newTileQ.docs[0].id };
    if (newPosition < tile.data().position) {
        // passed GO
        playerUpdate.money = player.data().money + 200;
    }
    await player.ref.update(playerUpdate);
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} game
 * @param {FirebaseFirestore.DocumentSnapshot} player
 * @param {FirebaseFirestore.DocumentSnapshot} tile
 * @returns {string} new phase
 */
async function payRent(game, player, tile, action) {
    if (tile.data().mortgaged) return;
    let rent = 0;
    switch (tile.data().type) {
        case 'property': {
            rent = tile.data().rent;
            const block = await game.ref
                .collection('Tiles')
                .where('group', '==', tile.data().group)
                .get();
            if (getBlockOwner(block)) {
                rent *= 2;
            }
            if (tile.data().buildings > 0) {
                rent = tile.data().rentIncreases[tile.data().buildings - 1];
            }
            break;
        }
        case 'railroad': {
            const railroads = await game.ref
                .collection('Tiles')
                .where('type', '==', 'railroad')
                .where('owner', '==', tile.data().owner)
                .get();
            rent = tile.data().rentIncreases[railroads.size - 1];
            break;
        }
        case 'company': {
            const companies = await game.ref
                .collection('Tiles')
                .where('type', '==', 'company')
                .where('owner', '==', tile.data().owner)
                .get();
            const count = companies.size;
            const multiplier = tile.data().rentIncreases[count - 1];
            rent =
                (game.data().lastDices[0] + game.data().lastDices[1]) *
                multiplier;
            break;
        }
        default:
            throw new Error(`invalid tile type ${tile.type}`);
    }
    const batch = admin.firestore().batch();
    const owner = await game.ref
        .collection('Players')
        .doc(tile.data().owner)
        .get();
    batch.update(player.ref, { money: player.data().money - rent });
    batch.update(owner.ref, { money: owner.data().money + rent });
    batch.update(game.ref, { phase: 'end' });
    await batch.commit();
    return 'end';
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} game
 * @param {FirebaseFirestore.DocumentSnapshot} player
 * @param {FirebaseFirestore.DocumentSnapshot} tile
 */
async function tryBuy(_game, player, tile, _action) {
    if (tile.data().price == null) return;
    if (tile.data().price > player.data().money) return;
    const batch = admin.firestore().batch();
    batch.update(player.ref, {
        money: player.data().money - tile.data().price,
    });
    batch.update(tile.ref, { owner: player.id });
    return batch.commit();
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} game
 * @param {FirebaseFirestore.DocumentSnapshot} player
 * @param {FirebaseFirestore.DocumentSnapshot} tile
 * @returns {string} new phase
 */
async function applyMisc(game, player, tile, action) {
    const batch = admin.firestore().batch();
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
    batch.update(game.ref, { phase: 'end' });
    await batch.commit();
    return 'end';
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} game
 * @param {FirebaseFirestore.DocumentSnapshot} player
 */
async function nextTurn(game, player) {
    const batch = admin.firestore().batch();
    batch.update(game.ref, { phase: 'roll' });
    if (player.data().sentToJail) {
        batch.update(player.ref, { sentToJail: false, frozenTurns: 3 });
        batch.update(game.ref, { doublesCount: 0 });
    } else if (game.data().doublesCount > 0 && game.data().doublesCount < 3) {
        return;
    }
    const { order } = game.data();
    const index = order.indexOf(game.data().turn);
    const newIndex = (index + 1) % order.length;
    batch.update(game.ref, { turn: order[newIndex] });
    await batch.commit();
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} game
 */
async function buyHouse(game, action) {
    const tile = await game.ref
        .collection('Tiles')
        .doc(action.tileId)
        .get();
    const block = await game.ref
        .collection('Tiles')
        .where('group', '==', tile.data().group)
        .get();
    const owner = await game.ref
        .collection('Players')
        .doc(tile.data().owner)
        .get();
    if (!canBuyHouses(tile, block, owner)) return;
    const batch = admin.firestore().batch();
    batch.update(tile.ref, { buildings: tile.data().buildings + 1 });
    batch.update(owner.ref, {
        money: owner.data().money - tile.data().buildingCost,
    });
    await batch.commit();
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} game
 */
async function sellHouse(game, action) {
    const tile = await game.ref
        .collection('Tiles')
        .doc(action.tileId)
        .get();
    const block = await game.ref
        .collection('Tiles')
        .where('group', '==', tile.data().group)
        .get();
    const owner = await game.ref
        .collection('Players')
        .doc(tile.data().owner)
        .get();
    if (!canSellHouses(tile, block)) return;
    const batch = admin.firestore().batch();
    batch.update(tile.ref, { buildings: tile.data().buildings - 1 });
    batch.update(owner.ref, {
        money: owner.data().money + tile.data().buildingCost / 2,
    });
    await batch.commit();
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} game
 */
async function mortgage(game, action) {
    const tile = await game.ref
        .collection('Tiles')
        .doc(action.tileId)
        .get();
    const block = await game.ref
        .collection('Tiles')
        .where('group', '==', tile.data().group)
        .get();
    const owner = await game.ref
        .collection('Players')
        .doc(tile.data().owner)
        .get();
    const batch = admin.firestore().batch();
    if (tile.data().mortgaged) {
        if (!canUnmortgage(tile, owner)) return;
        batch.update(tile.ref, { mortgaged: false });
        const cost = Math.ceil(tile.data().price * 0.55);
        batch.update(owner.ref, { money: owner.data().money - cost });
        return batch.commit();
    } else {
        if (!canMortgage(tile, block)) return;
        batch.update(tile.ref, { mortgaged: true });
        const value = tile.data().price * 0.5;
        batch.update(owner.ref, { money: owner.data().money + value });
        return batch.commit();
    }
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} game
 * @param {FirebaseFirestore.DocumentSnapshot} player
 */
function jailedRoll(game, player, action) {
    const batch = admin.firestore().batch();
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
    batch.update(game.ref, gameUpdate);
    return batch.commit();
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} game
 * @param {FirebaseFirestore.DocumentSnapshot} player
 */
function payJail(_game, player, _action) {
    return player.update({ money: player.data().money - 50 });
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} game
 * @param {FirebaseFirestore.DocumentSnapshot} player
 */
async function jailedEnd(game, player, action) {
    const batch = admin.firestore().batch();
    batch.update(player.ref, { frozenTurns: player.data().frozenTurns - 1 });
    const { order } = game.data();
    const index = order.indexOf(game.data().turn);
    const newIndex = (index + 1) % order.length;
    batch.update(game.ref, { turn: order[newIndex] });
    return await batch.commit();
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Game>} game
 */
async function tradeNew(game, action) {
    const existingTrade = await game.ref
        .collection('Trades')
        .where('by', '==', action.playerId)
        .get();
    if (existingTrade.size > 0) return;
    return game.ref.collection('Trades').add({
        by: action.playerId,
        bProperties: [],
        bMoney: 0,
        with: null,
        wProperties: [],
        wMoney: 0,
    });
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Game>} game
 */
async function tradeAdd(game, action) {
    /** @type {FirebaseFirestore.DocumentSnapshot<Monopolygony.Trade>} */
    const trade = await game.ref
        .collection('Trades')
        .doc(action.tradeId)
        .get();
    if (!trade.exists) return;
    /** @type {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} */
    const tile = await game.ref
        .collection('Tiles')
        .doc(action.tileId)
        .get();
    /** @type {FirebaseFirestore.QuerySnapshot<Monopolygony.Tile>} */
    const block = await game.ref
        .collection('Tiles')
        .where('group', '==', tile.data().group)
        .get();
    if (!canTrade(trade, tile, block)) return;
    const batch = admin.firestore().batch();
    if (trade.data().by === tile.data().owner) {
        batch.update(trade.ref, {
            bProperties: [...trade.data().bProperties, tile.id],
        });
    } else {
        batch.update(trade.ref, {
            with: tile.data().owner,
            wProperties: [...trade.data().wProperties, tile.id],
        });
    }
    return batch.commit();
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Game>} game
 */
async function tradeRemove(game, action) {
    /** @type {FirebaseFirestore.DocumentSnapshot<Monopolygony.Trade>} */
    const trade = await game.ref
        .collection('Trades')
        .doc(action.tradeId)
        .get();
    const { bProperties, wProperties } = trade.data();
    const bIndex = bProperties.indexOf(action.tileId);
    if (bIndex !== -1) {
        bProperties.splice(bIndex, 1);
        return await trade.ref.update({ bProperties });
    }
    const wIndex = wProperties.indexOf(action.tileId);
    if (wIndex !== -1) {
        wProperties.splice(wIndex, 1);
        return await trade.ref.update({ wProperties });
    }
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Game>} game
 */
async function tradeMoney(game, action) {
    /** @type {FirebaseFirestore.DocumentSnapshot<Monopolygony.Trade>} */
    const trade = await game.ref
        .collection('Trades')
        .doc(action.tradeId)
        .get();
    const { bMoney, wMoney } = action;
    if (bMoney != null) {
        return await trade.ref.update({ bMoney });
    } else {
        return await trade.ref.update({ wMoney });
    }
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Game>} game
 */
async function tradeCancel(game, action) {
    return await game.ref
        .collection('Trades')
        .doc(action.tradeId)
        .delete();
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Game>} game
 */
async function tradeDone(game, action) {
    /** @type {FirebaseFirestore.DocumentSnapshot<Monopolygony.Trade>} */
    const trade = await game.ref
        .collection('Trades')
        .doc(action.tradeId)
        .get();
    const batch = admin.firestore().batch();
    const {
        by: bId,
        with: wId,
        bMoney,
        wMoney,
        bProperties,
        wProperties,
    } = trade.data();

    /** @type {FirebaseFirestore.DocumentSnapshot<Monopolygony.Player>} */
    const bPlayer = await game.ref
        .collection('Players')
        .doc(bId)
        .get();
    batch.update(bPlayer.ref, {
        money: bPlayer.data().money + wMoney - bMoney,
    });

    /** @type {FirebaseFirestore.DocumentSnapshot<Monopolygony.Player>} */
    const wPlayer = await game.ref
        .collection('Players')
        .doc(wId)
        .get();
    batch.update(wPlayer.ref, {
        money: wPlayer.data().money + bMoney - wMoney,
    });

    const allTiles = await game.ref.collection('Tiles').get();
    allTiles.docs.forEach(tile => {
        if (bProperties.includes(tile.id)) {
            batch.update(tile.ref, { owner: wId });
        } else if (wProperties.includes(tile.id)) {
            batch.update(tile.ref, { owner: bId });
        }
    });
    return batch.commit();
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Game>} game
 */
async function treatBankrupcy(game, action) {
    const batch = admin.firestore().batch();
    const player = await game.ref
        .collection('Players')
        .doc(action.playerId)
        .get();
    batch.update(player.ref, { bankrupt: true });
    let { order, turn } = game.data();
    const pIndex = order.indexOf(player.id);
    if (turn === player.id) {
        const nextIndex = (pIndex + 1) % order.length;
        turn = order[nextIndex];
    }
    order.splice(pIndex, 1);
    batch.update(game.ref, { order, turn });
    return batch.commit();
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} game
 */

function addPlayer(game, action) {
    // if (game.players.length === PLAYER_COLORS.length) return state;
    return game.ref.collection('Players').add({
        position: 0,
        money: game.players[0].money,
        color: action.color,
        frozenTurns: -1,
    });
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} game
 */

function removePlayer(game, action) {
    // if (newState.players.length === 2) return state;
    return game.ref
        .collection('Players')
        .doc(action.playerId)
        .delete();
}
