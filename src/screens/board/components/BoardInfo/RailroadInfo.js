import React from 'react';
import { properties } from '../../services/board.json';

function RailroadInfo({ state }) {
    const property = properties.find(p => p.id === state.selected.tile.id);
    return (
        <div className="RailroadInfo">
            <p>Railroad</p>
            {property.multpliedrent.map((r, i) => (
                <p key={r}>
                    {i + 1} owned: ${r}
                </p>
            ))}
        </div>
    );
}

export default RailroadInfo;
