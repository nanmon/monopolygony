function isMiscTile(tile) {
    return [
        'go',
        'chance',
        'chest',
        'freeparking',
        'gotojail',
        'jail',
        'tax',
    ].includes(tile.data().type);
}

/**
 * @param {FirebaseFirestore.QuerySnapshot} block
 */
function getBlockOwner(block) {
    const firstOwner = block.docs[0].data().owner;
    if (!firstOwner) return null;
    if (block.docs.every(d => d.data().owner === firstOwner)) return firstOwner;
    return null;
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} tile
 * @param {FirebaseFirestore.QuerySnapshot} block
 * @param {FirebaseFirestore.QuerySnapshot} owner
 */
function canBuyHouses(tile, block, owner) {
    if (tile.data().type !== 'property') return false;
    if (getBlockOwner(block) == null) return false;
    if (tile.data().buildings === 5) return false;
    if (owner.data().money < tile.data().buildingCost) return false;
    if (block.docs.some(p => p.data().mortgaged)) return false;
    const blockHouses = block.map(p => p.data().buildings);
    const minHouses = Math.min(...blockHouses);
    return tile.data().buildings === minHouses;
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} tile
 * @param {FirebaseFirestore.QuerySnapshot} block
 */
function canSellHouses(tile, block) {
    if (tile.data().buildings === 0) return false;
    const blockHouses = block.docs.map(p => p.data().buildings);
    const maxHouses = Math.max(...blockHouses);
    return tile.data().buildings === maxHouses;
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} tile
 * @param {FirebaseFirestore.QuerySnapshot} block
 */
function canMortgage(tile, block) {
    if (tile.data().owner == null) return false;
    if (getBlockOwner(block) != null) {
        if (block.docs.some(p => p.buildings > 0)) return false;
    }
    return !tile.data().mortgaged;
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot} tile
 * @param {FirebaseFirestore.DocumentSnapshot} owner
 */
function canUnmortgage(tile, owner) {
    if (!tile.data().mortgaged) return false;
    return owner.data().money >= tile.data().price * 0.55; // half price + 10%
}

/**
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Trade>} trade
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} tile
 * @param {FirebaseFirestore.QuerySnapshot<Monopolygony.Tile>} block
 */
function canTrade(trade, tile, block) {
    if (tile.data().owner == null) return false;
    if (block.docs.some(p => p.data().buildings > 0)) return false;
    if (trade.data().with) {
        return (
            trade.data().by === tile.data().owner ||
            trade.data().with === tile.data().owner
        );
    }
    return true;
}

exports.isMiscTile = isMiscTile;
exports.getBlockOwner = getBlockOwner;
exports.canBuyHouses = canBuyHouses;
exports.canSellHouses = canSellHouses;
exports.canMortgage = canMortgage;
exports.canUnmortgage = canUnmortgage;
exports.canTrade = canTrade;
