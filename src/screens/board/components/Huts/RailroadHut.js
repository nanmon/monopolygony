import React from 'react';
import { properties } from '../../services/board.json';
import './styles/RailroadHut.css';
import { getRailroadsOwned } from '../../services/util.js';

function RailroadHut({ state, tile, side, children, onClick }) {
    const classes = ['RailroadHut', side];
    const railroad = properties.find(p => p.id === tile.id);
    const ownership = state.properties.find(p => p.id === tile.id);
    const owner = ownership && state.players[ownership.ownedBy];
    let moneyText = '$' + railroad.price;
    if (ownership) {
        const ownedCount = getRailroadsOwned(state, ownership.ownedBy);
        const rent = railroad.multpliedrent[ownedCount - 1];
        moneyText = 'R$' + rent;
        if (ownership.mortgaged) {
            moneyText = 'M';
        }
    }
    if (
        state.selected &&
        state.selected.tile &&
        state.selected.tile.id === railroad.id &&
        state.trade.length === 0
    ) {
        classes.push('selected');
    }
    return (
        <div className={classes.join(' ')} onClick={onClick}>
            <span>Railroad</span>

            <span>{moneyText}</span>
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
