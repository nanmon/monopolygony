import React from 'react';
import { properties } from '../../services/board.json';

function PropertyInfo({ state }) {
    const property = properties.find(p => p.id === state.selected.tile.id);
    return (
        <div className="PropertyInfo">
            <p>Property</p>
            <p>Block: {property.group}</p>
            <p>Rent: ${property.rent}</p>
            <p>Doubled if complete block owned</p>
            {property.multpliedrent.map((r, i) => (
                <p key={r}>
                    {i + 1} houses: ${r}
                </p>
            ))}
        </div>
    );
}

export default PropertyInfo;
