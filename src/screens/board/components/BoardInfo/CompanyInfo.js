import React from 'react';
import { properties } from '../../services/board.json';
import PlayerToken from '../PlayerToken.js';
import {
    getCompaniesOwned,
    canMortgage,
    canUnmortgage,
    canTrade,
} from '../../services/util.js';

function CompanyInfo({ state, onMortgage, onTrade }) {
    const property = properties.find(p => p.id === state.selected.tile.id);
    const rent = property.multpliedrent;
    const ownership = state.properties.find(
        p => p.id === state.selected.tile.id,
    );
    const ownedBy = ownership && state.players[ownership.ownedBy];
    let rentLvl = 0;
    if (ownership) {
        rentLvl = getCompaniesOwned(state, ownership.ownedBy);
    }
    return (
        <div className="CompanyInfo">
            <p>Utility</p>
            {ownedBy && (
                <p>
                    Owned by: <PlayerToken player={ownedBy} />
                </p>
            )}
            <p style={{ fontWeight: rentLvl === 1 ? 'bold' : 'normal' }}>
                Rent: Dice x {rent[0]}
            </p>
            <p style={{ fontWeight: rentLvl === 2 ? 'bold' : 'normal' }}>
                Dice x {rent[1]} if owning the two utilities
            </p>
            {canMortgage(state, property.id) && (
                <button onClick={onMortgage}>
                    Mortgage for ${property.price * 0.5}
                </button>
            )}
            {canUnmortgage(state, property.id) && (
                <button onClick={onMortgage}>
                    Unmortgage for ${Math.ceil(property.price * 0.55)}
                </button>
            )}
            {canTrade(state, property.id) && (
                <button onClick={onTrade}>Trade</button>
            )}
        </div>
    );
}

export default CompanyInfo;
