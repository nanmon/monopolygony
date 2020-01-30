import React from 'react';
import PlayerToken from '../PlayerToken.js';
import {
    getRailroadsOwned,
    canMortgage,
    canUnmortgage,
    canTrade,
    getTileOwner,
} from '../../services/util.js';
import './styles/RailroadInfo.css';

/**
 * @param {object} props
 * @param {Monopolygony.BoardBundle} props.state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} props.tile
 */
function RailroadInfo({ isMaster, state, tile, onMortgage, onTrade, onClose }) {
    const ownedBy = getTileOwner(state, tile);
    let rentLvl = 0;
    if (ownedBy) {
        rentLvl = getRailroadsOwned(state, ownedBy.id);
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
                    {tile.data().rentIncreases.map((r, i) => (
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
            {isMaster && (
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

export default RailroadInfo;
