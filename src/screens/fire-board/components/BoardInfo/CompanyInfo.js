import React from 'react';
import { properties } from '../../services/board.json';
import PlayerToken from '../PlayerToken.js';
import {
    getCompaniesOwned,
    canMortgage,
    canUnmortgage,
    canTrade,
} from '../../services/util.js';
import './styles/CompanyInfo.css';

/**
 * @param {object} props
 * @param {Monopolygony.BoardBundle} props.state
 */

function CompanyInfo({ state, onMortgage, onTrade, onClose }) {
    const property = properties.find(p => p.id === state.selected.tile.id);
    const rent = property.multpliedrent;
    const ownership = state.properties.find(
        p => p.id === state.selected.tile.id,
    );
    const ownedBy = ownership && state.players[ownership.ownedBy];
    let rentLvl = 0;
    if (ownership) {
        rentLvl = getCompaniesOwned(state, ownership.ownedBy);
    }
    return (
        <div className="CompanyInfo">
            <div className="CompanyCard">
                <div className="Header">
                    {ownedBy ? <PlayerToken player={ownedBy} /> : <span />}
                    <span>Utility</span>
                    <button onClick={onClose}>X</button>
                </div>
                <div className="Content">
                    <p
                        style={{
                            fontWeight: rentLvl === 1 ? 'bold' : 'normal',
                        }}
                    >
                        Rent: Dice x {rent[0]}
                    </p>
                    <p
                        style={{
                            fontWeight: rentLvl === 2 ? 'bold' : 'normal',
                        }}
                    >
                        Dice x {rent[1]} if owning the two utilities
                    </p>
                </div>
            </div>
            <div className="Actions">
                {canMortgage(state, property.id) && (
                    <button className="ActionButton" onClick={onMortgage}>
                        Mortgage for ${property.price * 0.5}
                    </button>
                )}
                {canUnmortgage(state, property.id) && (
                    <button className="ActionButton" onClick={onMortgage}>
                        Unmortgage for ${Math.ceil(property.price * 0.55)}
                    </button>
                )}
                {canTrade(state, property.id) && (
                    <button className="ActionButton" onClick={onTrade}>
                        Trade
                    </button>
                )}
            </div>
        </div>
    );
}

export default CompanyInfo;
