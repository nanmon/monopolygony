import React from 'react';
import { properties } from '../../services/board.json';
import PlayerToken from '../PlayerToken.js';

function RailroadInfo({ state }) {
    const property = properties.find(p => p.id === state.selected.tile.id);
    const owned = state.properties.find(p => p.id === state.selected.tile.id);
    const ownedBy = owned && state.players[owned.ownedBy];
    return (
        <div className="RailroadInfo">
            <p>Railroad</p>
            {ownedBy && (
                <p>
                    Owned by: <PlayerToken player={ownedBy} />
                </p>
            )}
            {property.multpliedrent.map((r, i) => (
                <p key={r}>
                    {i + 1} owned: ${r}
                </p>
            ))}
        </div>
    );
}

export default RailroadInfo;
