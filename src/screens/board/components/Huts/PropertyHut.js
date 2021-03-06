import React from 'react';
import { properties } from '../../services/board.json';
import './styles/PropertyHut.css';
import { getBlockOwner } from '../../services/util.js';

function PropertyHut({ state, tile, side, children, onClick }) {
    const property = properties.find(p => p.id === tile.id);
    const classes = ['PropertyHut', side];
    const ownership = state.properties.find(p => p.id === tile.id);
    const owner = ownership && state.players[ownership.ownedBy];
    let moneyText = '$' + property.price;
    if (ownership) {
        moneyText = 'R$' + property.rent;
        if (ownership.mortgaged) {
            moneyText = 'M';
        } else if (getBlockOwner(state, property.group) === ownership.ownedBy) {
            if (ownership.houses === 0) moneyText = 'R$' + property.rent * 2;
            else
                moneyText = 'R$' + property.multpliedrent[ownership.houses - 1];
        }
    }
    if (
        state.selected &&
        state.selected.tile &&
        state.selected.tile.id === property.id &&
        state.trade.length === 0
    ) {
        classes.push('selected');
    }
    return (
        <div
            className={classes.join(' ')}
            onClick={e => {
                e.preventDefault();
                onClick();
            }}
            href={'#' + tile.id}
        >
            <div
                className="group"
                style={{ backgroundColor: property.group }}
            ></div>
            <span>{moneyText}</span>
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
