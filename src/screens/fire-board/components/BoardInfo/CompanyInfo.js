import React from 'react';
import PlayerToken from '../PlayerToken.js';
import {
    getCompaniesOwned,
    canMortgage,
    canUnmortgage,
    canTrade,
    getTileOwner,
    isMyTurn,
} from '../../services/util.js';
import './styles/CompanyInfo.css';

/**
 * @param {object} props
 * @param {Monopolygony.BoardBundle} props.state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} props.tile
 */

function CompanyInfo({ user, state, tile, onMortgage, onTrade, onClose }) {
    const rent = tile.data().rentIncreases;
    const ownedBy = getTileOwner(state, tile);
    let rentLvl = 0;
    if (ownedBy) {
        rentLvl = getCompaniesOwned(state, ownedBy.id).length;
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
            {isMyTurn(state, user) && (
                <div className="Actions">
                    {canMortgage(state, tile) && (
                        <button className="ActionButton" onClick={onMortgage}>
                            Mortgage for ${tile.data().price * 0.5}
                        </button>
                    )}
                    {canUnmortgage(state, tile) && (
                        <button className="ActionButton" onClick={onMortgage}>
                            Unmortgage for $
                            {Math.ceil(tile.data().price * 0.55)}
                        </button>
                    )}
                    {canTrade(state, null, tile) && (
                        <button className="ActionButton" onClick={onTrade}>
                            Trade
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default CompanyInfo;
