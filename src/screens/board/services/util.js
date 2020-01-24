import { tiles, properties } from './board.json';

export function getOwner(state, id = getCurrentTileId(state)) {
    const ownership = state.properties.find(p => p.id === id);
    return ownership ? ownership.ownedBy : -1;
}

export function isBuyable(state, id = getCurrentTileId(state)) {
    if (getOwner(state, id) !== -1) return false;
    const property = properties.find(p => p.id === id);
    if (property && property.price) return true;
}

export function isMiscTile(state, id = getCurrentTileId(state)) {
    return properties.find(p => p.id === id) == null;
}

export function getCurrentTileId(state) {
    const player = state.players[state.turn];
    const tile = tiles[player.position];
    return tile.id;
}

export function getBlockOwner(state, block) {
    const blockProps = properties
        .filter(p => p.group === block)
        .map(p => {
            return {
                ...p,
                ownership: state.properties.find(op => op.id === p.id),
            };
        });
    if (blockProps.some(p => !p.ownership)) return -1;
    const firstPropOwner = blockProps[0].ownership.ownedBy;
    if (blockProps.every(p => p.ownership.ownedBy === firstPropOwner))
        return firstPropOwner;
    return -1;
}

export function getRailroadsOwned(state, playerIndex) {
    return properties.filter(p => {
        const ownership = state.properties.find(op => op.id === p.id);
        return (
            p.group === 'Railroad' &&
            ownership &&
            ownership.ownedBy === playerIndex
        );
    }).length;
}

export function getCompaniesOwned(state, playerIndex) {
    return properties.filter(p => {
        const ownership = state.properties.find(op => op.id === p.id);
        return (
            p.group === 'Utilities' &&
            ownership &&
            ownership.ownedBy === playerIndex
        );
    }).length;
}

export function canBuyHouses(state, propertyId) {
    const tile = tiles.find(t => t.id === propertyId);
    if (tile.type !== 'property') return false;
    const property = properties.find(p => p.id === propertyId);
    if (getBlockOwner(state, property.group) === -1) return false;
    const ownership = state.properties.find(p => p.id === propertyId);
    if (ownership.houses === 5) return false;
    const owner = state.players[ownership.ownedBy];
    if (owner.money < property.housecost) return false;
    const block = properties.filter(p => p.group === property.group);
    const blockOwns = block.map(p =>
        state.properties.find(op => op.id === p.id),
    );
    if (blockOwns.some(b => b.mortgaged)) return false;
    const blockHouses = blockOwns.map(p => p.houses);
    const minHouses = Math.min(...blockHouses);
    return ownership.houses === minHouses;
}

export function canSellHouses(state, propertyId) {
    const ownership = state.properties.find(p => p.id === propertyId);
    if (ownership && ownership.houses > 0) return true;
}

export function canMortgage(state, propertyId) {
    const ownership = state.properties.find(p => p.id === propertyId);
    if (!ownership) return false;
    const property = properties.find(p => p.id === propertyId);
    if (getBlockOwner(state, property.group) !== -1) {
        const blockProps = properties.filter(p => p.group === property.group);
        const blockOwns = blockProps.map(p =>
            state.properties.find(op => op.id === p.id),
        );
        if (blockOwns.some(p => p.houses > 0)) return false;
    }
    return !ownership.mortgaged;
}

export function canUnmortgage(state, propertyId) {
    const ownership = state.properties.find(p => p.id === propertyId);
    if (!ownership || !ownership.mortgaged) return false;
    const player = state.players[ownership.ownedBy];
    const property = properties.find(p => p.id === propertyId);
    return player.money >= property.price * 0.55; // half price + 10%
}

export function canTrade(state, propertyId) {
    const ownership = state.properties.find(p => p.id === propertyId);
    if (!ownership) return false;
    if (state.trade.length < 2) return true;
    if (state.trade[0].playerIndex === ownership.ownedBy) return true;
    if (state.trade[1].playerIndex === ownership.ownedBy) return true;
    return false;
}

export function userAssetsValue(state, playerIndex = state.turn) {
    const owned = state.properties
        .filter(p => p.ownedBy === playerIndex)
        .map(ownership => {
            const property = properties.find(pp => ownership.id === pp.id);
            return { ...property, ownership };
        });
    let assets = 0;
    owned.forEach(p => {
        if (p.ownership.mortgaged) assets += p.price / 2;
        else assets += p.price;
        if (p.housecost) assets += p.ownership.houses * p.housecost;
    });
    return assets;
}

export function getDebt(state, playerIndex = state.turn) {
    const player = state.players[playerIndex];
    if (player.money >= 0) return 0;
    // if money is negative, player is in debt
    return -player.money;
}

export function isBankrupt(state, playerIndex = state.turn) {
    const debt = getDebt(state, playerIndex);
    if (debt === 0) return false;
    const owned = state.properties
        .filter(p => p.ownedBy === playerIndex)
        .map(ownership => {
            const property = properties.find(pp => ownership.id === pp.id);
            return { ...property, ownership };
        });
    let payable = 0;
    owned.forEach(p => {
        if (p.ownership.mortgaged) return;
        else payable += p.price / 2;
        if (p.housecost) payable += (p.ownership.houses * p.housecost) / 2;
    });
    return payable < debt; // can't pay debt
}

export function canCompleteTrade(state) {
    if (state.trade.length !== 2) return false;
    const trade1 = state.trade[0];
    if (trade1.moneyStr === '' || trade1.money < 0) return false;
    const player1 = state.players[trade1.playerIndex];
    if (player1.money < trade1.money) return false;
    const trade2 = state.trade[1];
    if (trade2.moneyStr === '' || trade2.money < 0) return false;
    const player2 = state.players[trade2.playerIndex];
    if (player2.money < trade2.money) return false;
    return true;
}
