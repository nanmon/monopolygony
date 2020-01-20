import React from 'react';
import { properties } from '../services/board.json';

function PropertyHut({ tile, side }) {
    const property = properties.find(p => p.id === tile.id);
    const classes = ['PropertyHut', side];
    return (
        <div className={classes.join(' ')}>
            <div
                className="group"
                style={{ backgroundColor: property.group }}
            ></div>
            <span />
            <p>${property.price}</p>
        </div>
    );
}

export default PropertyHut;
