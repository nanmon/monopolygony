import React from 'react';
import { properties } from '../../services/board.json';
import PlayerToken from '../PlayerToken.js';
import { getBlockOwner } from '../../services/util.js';

function PropertyInfo({ state }) {
    const property = properties.find(p => p.id === state.selected.tile.id);
    const ownership = state.properties.find(
        p => p.id === state.selected.tile.id,
    );
    const ownedBy = ownership && state.players[ownership.ownedBy];
    let rentLvl = 0;
    if (ownership) {
        rentLvl = 1;
        if (getBlockOwner(state, property.group) === ownership.ownedBy)
            rentLvl++;
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
            <p>With 1 house: ${property.multpliedrent[0]}</p>
            {property.multpliedrent.slice(1, 4).map((r, i) => (
                <p key={r}>
                    With {i + 2} houses: ${r}
                </p>
            ))}
            <p>With hotel: ${property.multpliedrent[4]}</p>
        </div>
    );
}

export default PropertyInfo;
