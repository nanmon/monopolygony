import React from 'react';
import { properties } from '../../services/board.json';
import PlayerToken from '../PlayerToken.js';
import {
    getRailroadsOwned,
    canMortgage,
    canUnmortgage,
    canTrade,
} from '../../services/util.js';
import './styles/RailroadInfo.css';

function RailroadInfo({ state, onMortgage, onTrade, onClose }) {
    const property = properties.find(p => p.id === state.selected.tile.id);
    const ownership = state.properties.find(
        p => p.id === state.selected.tile.id,
    );
    const ownedBy = ownership && state.players[ownership.ownedBy];
    let rentLvl = 0;
    if (ownership) {
        rentLvl = getRailroadsOwned(state, ownership.ownedBy);
    }
    return (
        <div className="RailroadInfo">
            <div className="RailroadCard">
                <div className="Header">
                    {ownedBy ? <PlayerToken player={ownedBy} /> : <span />}
                    <span>Railroad</span>
                    <button onClick={onClose}>X</button>
                </div>
                <div className="Content">
                    {property.multpliedrent.map((r, i) => (
                        <p
                            key={r}
                            style={{
                                fontWeight:
                                    rentLvl === i + 1 ? 'bold' : 'normal',
                            }}
                        >
                            {i + 1} owned: ${r}
                        </p>
                    ))}
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

export default RailroadInfo;
