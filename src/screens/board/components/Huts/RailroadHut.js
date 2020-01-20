import React from 'react';
import { properties } from '../../services/board.json';
import './styles/RailroadHut.css';

function RailroadHut({ tile, side, owner, children }) {
    const classes = ['RailroadHut', side];
    const railroad = properties.find(p => p.id === tile.id);
    return (
        <div className={classes.join(' ')}>
            <span>Railroad</span>

            <span>${railroad.price}</span>
            <div className="Tokens">{children}</div>
            {owner && (
                <div
                    className="owner"
                    style={{ backgroundColor: owner.color }}
                ></div>
            )}
        </div>
    );
}

export default RailroadHut;
