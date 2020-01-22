import React from 'react';
import { properties } from '../../services/board.json';
import './styles/CompanyHut.css';
import { getCompaniesOwned } from '../../services/util.js';

function CompanyHut({ state, tile, side, children, onClick }) {
    const classes = ['CompanyHut', side];
    const company = properties.find(p => p.id === tile.id);
    const ownership = state.properties.find(p => p.id === tile.id);
    const owner = ownership && state.players[ownership.ownedBy];
    let moneyText = '$' + company.price;
    if (ownership) {
        const ownedCount = getCompaniesOwned(state, ownership.ownedBy);
        const multiplier = company.multpliedrent[ownedCount - 1];
        moneyText = 'Dx' + multiplier;
    }
    return (
        <div className={classes.join(' ')} onClick={onClick}>
            <span>Utility</span>
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

export default CompanyHut;
