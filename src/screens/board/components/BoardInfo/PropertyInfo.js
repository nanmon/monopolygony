import React from 'react';
import { properties } from '../../services/board.json';
import PlayerToken from '../PlayerToken.js';
import { getBlockOwner, canBuyHouses } from '../../services/util.js';

function PropertyInfo({ state, onBuyHouse }) {
    const property = properties.find(p => p.id === state.selected.tile.id);
    const ownership = state.properties.find(
        p => p.id === state.selected.tile.id,
    );
    const ownedBy = ownership && state.players[ownership.ownedBy];
    const blockOwner = ownership ? getBlockOwner(state, property.group) : -1;
    let rentLvl = 0;
    if (ownership) {
        rentLvl = 1;
        if (blockOwner !== -1) rentLvl += ownership.houses + 1;
    }
    return (
        <div className="PropertyInfo">
            <p>Property</p>
            {ownedBy && (
                <p>
                    Owned by: <PlayerToken player={ownedBy} />
                </p>
            )}
            <p>Block: {property.group}</p>
            <p style={{ fontWeight: rentLvl === 1 ? 'bold' : 'normal' }}>
                Rent: ${property.rent}
            </p>
            <p style={{ fontWeight: rentLvl === 2 ? 'bold' : 'normal' }}>
                With whole block: ${property.rent * 2}
            </p>
            <p style={{ fontWeight: rentLvl === 3 ? 'bold' : 'normal' }}>
                With 1 house: ${property.multpliedrent[0]}
            </p>
            {property.multpliedrent.slice(1, 4).map((r, i) => (
                <p
                    key={r}
                    style={{
                        fontWeight: rentLvl === i + 4 ? 'bold' : 'normal',
                    }}
                >
                    With {i + 2} houses: ${r}
                </p>
            ))}
            <p style={{ fontWeight: rentLvl === 7 ? 'bold' : 'normal' }}>
                With hotel: ${property.multpliedrent[4]}
            </p>
            {canBuyHouses(state, property.id) && (
                <button onClick={onBuyHouse}>Buy house or hotel</button>
            )}
        </div>
    );
}

export default PropertyInfo;
