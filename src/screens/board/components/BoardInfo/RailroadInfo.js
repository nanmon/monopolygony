import React from 'react';
import { properties } from '../../services/board.json';
import PlayerToken from '../PlayerToken.js';
import { getRailroadsOwned } from '../../services/util.js';

function RailroadInfo({ state }) {
    const property = properties.find(p => p.id === state.selected.tile.id);
    const ownership = state.properties.find(
        p => p.id === state.selected.tile.id,
    );
    const ownedBy = ownership && state.players[ownership.ownedBy];
    let rentLvl = 0;
    if (ownership) {
        rentLvl = getRailroadsOwned(state, ownership.ownedBy);
    }
    return (
        <div className="RailroadInfo">
            <p>Railroad</p>
            {ownedBy && (
                <p>
                    Owned by: <PlayerToken player={ownedBy} />
                </p>
            )}
            {property.multpliedrent.map((r, i) => (
                <p
                    key={r}
                    style={{
                        fontWeight: rentLvl === i + 1 ? 'bold' : 'normal',
                    }}
                >
                    {i + 1} owned: ${r}
                </p>
            ))}
        </div>
    );
}

export default RailroadInfo;
