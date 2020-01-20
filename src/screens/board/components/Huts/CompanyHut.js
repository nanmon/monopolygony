import React from 'react';
import { properties } from '../../services/board.json';
import './styles/CompanyHut.css';

function CompanyHut({ tile, side, owner, children }) {
    const classes = ['CompanyHut', side];
    const company = properties.find(p => p.id === tile.id);
    return (
        <div className={classes.join(' ')}>
            <span>{company.name}</span>
            <span>${company.price}</span>
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
