import React from 'react';
import { properties } from '../../services/board.json';
import './styles/PropertyHut.css';

function PropertyHut({ tile, side, children }) {
    const property = properties.find(p => p.id === tile.id);
    const classes = ['PropertyHut', side];
    return (
        <div className={classes.join(' ')}>
            <div
                className="group"
                style={{ backgroundColor: property.group }}
            ></div>
            <span>${property.price}</span>
            <div className="Tokens">{children}</div>
        </div>
    );
}

export default PropertyHut;
