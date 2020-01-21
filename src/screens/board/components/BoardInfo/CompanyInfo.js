import React from 'react';
import { properties } from '../../services/board.json';
import PlayerToken from '../PlayerToken.js';

function CompanyInfo({ state }) {
    const property = properties.find(p => p.id === state.selected.tile.id);
    const rent = property.multpliedrent;
    const owned = state.properties.find(p => p.id === state.selected.tile.id);
    const ownedBy = owned && state.players[owned.ownedBy];
    return (
        <div className="CompanyInfo">
            <p>Utility</p>
            {ownedBy && (
                <p>
                    Owned by: <PlayerToken player={ownedBy} />
                </p>
            )}
            <p>Rent: Dice x {rent[0]}</p>
            <p>Dice x {rent[1]} if owning the two utilities</p>
        </div>
    );
}

export default CompanyInfo;
