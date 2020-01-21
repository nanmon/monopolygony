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
    return firstPropOwner;
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
