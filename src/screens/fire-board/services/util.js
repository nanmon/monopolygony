export const PLAYER_COLORS = [
    'red',
    'blue',
    'green',
    'gold',
    'purple',
    'darkorange',
    'pink',
    'darkcyan',
];

/**
 * @param {Monopolygony.BoardBundle} state
 */

export function getPlayerInTurn(state) {
    const turnId = state.game.data().turn;
    return state.players.docs.find(p => p.id === turnId);
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {string} id
 */

export function getPlayerById(state, id) {
    return state.players.docs.find(p => p.id === id);
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Player>} player
 */

export function getPlayerTile(state, player) {
    return state.tiles.docs.find(t => t.id === player.data().position);
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} tile
 */

export function getTileOwner(state, tile) {
    const { owner } = tile.data();
    if (!owner) return null;
    return state.players.docs.find(p => p.id === owner);
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {number} position
 */

export function getTileById(state, id) {
    return state.tiles.docs.find(t => t.id === id);
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {number} position
 */

export function getTileAt(state, position) {
    return state.tiles.docs.find(t => t.data().position === position);
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {string} playerId
 */

export function getTilesOwnedBy(state, playerId) {
    return state.tiles.docs.filter(t => t.data().owner === playerId);
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {string} blockName
 */

export function getBlock(state, blockName) {
    return state.tiles.docs.filter(t => t.data().group === blockName);
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} tile
 */

export function getOwner(state, tile) {
    return state.players.docs.find(p => p.id === tile.data().owner);
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} tile
 */
export function isBuyable(state, tile) {
    if (getOwner(state, tile) != null) return false;
    if (tile.data().price != null) return true;
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} tile
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Player>} player
 */
export function canBuyProperty(state, tile, player) {
    if (!isBuyable(state, tile)) return false;
    return tile.data().price < player.data().money;
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} tile
 */
export function isMiscTile(tile) {
    return !['property', 'railroad', 'company'].includes(tile.data().type);
}

// export function getCurrentTileId(state) {
//     const player = state.players[state.turn];
//     const tile = tiles[player.position];
//     return tile.id;
// }

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {string} blockName
 */
export function getBlockOwner(state, blockName) {
    const blockProps = state.tiles.docs.filter(
        t => t.data().group === blockName,
    );
    if (blockProps.some(t => t.data().owner == null)) return null;
    const firstPropOwner = blockProps[0].data().owner;
    if (blockProps.every(t => t.data().owner === firstPropOwner))
        return firstPropOwner;
    return null;
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {string} playerId
 */
export function getRailroadsOwned(state, playerId) {
    return state.tiles.docs.filter(t => {
        return t.data().type === 'railroad' && t.data().owner === playerId;
    });
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {string} playerId
 */
export function getCompaniesOwned(state, playerId) {
    return state.tiles.docs.filter(t => {
        return t.data().type === 'company' && t.data().owner === playerId;
    });
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {string} tradeId
 */
export function getTradeById(state, tradeId) {
    return state.trades.docs.find(t => t.id === tradeId);
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {string} playerId
 */
export function getTradeByPlayer(state, playerId) {
    return state.trades.docs.find(t => t.data().by === playerId);
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {string} blockName
 */
export function blockHasHouses(state, blockName) {
    const block = getBlock(state, blockName);
    return block.some(t => t.data().buildings > 0);
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} tile
 */

export function canBuyHouses(state, tile) {
    if (tile.data().type !== 'property') return false;
    if (getBlockOwner(state, tile.data().group) == null) return false;
    if (tile.data().buildings === 5) return false;
    const owner = getTileOwner(state, tile);
    if (owner.data().money < tile.data().buildingCost) return false;
    const block = getBlock(state, tile.data().group);
    if (block.some(t => t.data().mortgaged)) return false;
    const blockHouses = block.map(t => t.data().buildings);
    const minHouses = Math.min(...blockHouses);
    return tile.data().buildings === minHouses;
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} tile
 */

export function canSellHouses(state, tile) {
    if (tile.data().buildings === 0) return false;
    const block = getBlock(state, tile.data().group);
    const blockHouses = block.map(t => t.data().buildings);
    const maxHouses = Math.max(...blockHouses);
    return tile.data().buildings === maxHouses;
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} tile
 */

export function canMortgage(state, tile) {
    if (tile.data().owner == null) return false;
    if (getBlockOwner(state, tile.data().group) != null) {
        const block = getBlock(state, tile.data().group);
        if (block.some(t => t.data().buildings > 0)) return false;
    }
    return !tile.data().mortgaged;
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} tile
 */

export function canUnmortgage(state, tile) {
    if (!tile.data().mortgaged) return false;
    const player = getTileOwner(state, tile);
    return player.data().money >= tile.data().price * 0.55; // half price + 10%
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Trade>} trade
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} tile
 */
export function canTrade(state, trade, tile) {
    if (tile.data().owner == null) return false;
    if (blockHasHouses(state, tile.data().group)) return false;
    if (!trade) return true;
    if (trade.data().by === tile.data().owner) return true;
    if (trade.data().with == null) return true;
    if (trade.data().with === tile.data().owner) return true;
    return false;
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Player>} player
 */
export function getPlayerAssetsValue(state, player) {
    const owned = getTilesOwnedBy(state, player.id);
    let assets = 0;
    owned.forEach(p => {
        if (p.data().mortgaged) assets += p.data().price / 2;
        else assets += p.data().price;
        if (p.data().buildingCost)
            assets += p.data().buildings * p.data().buildingCost;
    });
    return assets;
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Player>} player
 */
export function getDebt(player) {
    if (player.data().money >= 0) return 0;
    // if money is negative, player is in debt
    return -player.data().money;
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Player>} player
 */
export function isBankrupt(state, player) {
    const debt = getDebt(player);
    if (debt === 0) return false;
    const owned = getTilesOwnedBy(state, player.id);
    let payable = 0;
    owned.forEach(p => {
        const { mortgaged, price, buildingCost, buildings } = p.data();
        if (mortgaged) return;
        else payable += price / 2;
        if (buildingCost != null) payable += (buildings * buildingCost) / 2;
    });
    return payable < debt; // can't pay debt
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Trade>} trade
 */
export function canCompleteTrade(state, trade) {
    if (!trade.data().with) return false;
    if (trade.data().bMoney === '' || trade.data().wMoney === '') return false;
    const bMoney = Number(trade.data().bMoney);
    const wMoney = Number(trade.data().wMoney);
    if (bMoney < 0 || bMoney % 1 !== 0 || isNaN(bMoney)) return false;
    const player1 = getPlayerById(state, trade.data().by);
    if (player1.data().money < bMoney) return false;
    if (wMoney < 0 || wMoney % 1 !== 0 || isNaN(wMoney)) return false;
    const player2 = getPlayerById(state, trade.data().with);
    if (player2.data().money < wMoney) return false;
    return true;
}

/**
 * @param {Monopolygony.BoardBundle} state
 */
export function canProcede(state) {
    if (isGameOver(state)) return false;
    const player = getPlayerInTurn(state);
    if (!isBankrupt(state, player) && getDebt(player) > 0) return false;
    return true;
}

/**
 * @param {Monopolygony.BoardBundle} state
 */
export function isGameOver(state) {
    const bankruptPlayers = state.players.docs.filter(player =>
        isBankrupt(state, player),
    );
    // everybody bankrupt except one
    if (bankruptPlayers.length === state.players.docs.length - 1) return true;
    return false;
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {firebase.User} user
 */
export function canJoinGame(state, user) {
    if (!user) return false;
    if (state.game.data().started) return false;
    if (state.players.size >= PLAYER_COLORS.length) return false;
    const isMaster = user.uid === state.game.data().master;
    if (isMaster) return false;
    const hasJoined = state.players.docs.some(p => p.id === user.uid);
    return !hasJoined;
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {firebase.User} user
 */
export function isMaster(state, user) {
    return user && user.uid === state.game.data().master;
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {firebase.User} user
 */
export function isMyTurn(state, user) {
    return user && user.uid === state.game.data().turn;
}

/**
 * @param {Monopolygony.BoardBundle} state
 * @param {firebase.firestore.DocumentSnapshot<Monopolygony.Trade>} trade
 * @param {firebase.User} user
 */
export function isMyTradeTurn(state, trade, user) {
    const turn =
        trade.data().turn === 'b' ? trade.data().by : trade.data().with;
    return user.uid === turn;
}
