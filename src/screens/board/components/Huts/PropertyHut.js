import React from 'react';
import { properties } from '../../services/board.json';
import './styles/PropertyHut.css';

function PropertyHut({ tile, side, owner, children }) {
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
            {owner && (
                <div
                    className="owner"
                    style={{
                        backgroundColor: owner.color,
                        borderColor:
                            owner.color === 'yellow' ? 'black' : 'white',
                    }}
                ></div>
            )}
        </div>
    );
}

export default PropertyHut;
