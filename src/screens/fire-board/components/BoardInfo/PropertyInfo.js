import React from 'react';
import PlayerToken from '../PlayerToken.js';
import {
    getBlockOwner,
    canBuyHouses,
    canMortgage,
    canUnmortgage,
    canSellHouses,
    canTrade,
    getTileOwner,
} from '../../services/util.js';
import './styles/PropertyInfo.css';

/**
 * @param {object} props
 * @param {Monopolygony.BoardBundle} props.state
 * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} props.tile
 */
function PropertyInfo({
    state,
    tile,
    onBuyHouse,
    onSellHouse,
    onMortgage,
    onTrade,
    onClose,
}) {
    const ownedBy = getTileOwner(state, tile);
    const blockOwner = getBlockOwner(state, tile.data().group);
    let rentLvl = 0;
    if (ownedBy) {
        rentLvl = 1;
        if (blockOwner !== null) rentLvl += tile.data().buildings + 1;
    }
    return (
        <div className="PropertyInfo">
            <div className="PropertyCard">
                <div
                    className="Header"
                    style={{ backgroundColor: tile.data().groupColor }}
                >
                    {ownedBy ? <PlayerToken player={ownedBy} /> : <span />}
                    <button onClick={onClose}>X</button>
                </div>
                <div className="Content">
                    <p
                        style={{
                            fontWeight: rentLvl === 1 ? 'bold' : 'normal',
                        }}
                    >
                        Rent: ${tile.data().rent}
                    </p>
                    <p
                        style={{
                            fontWeight: rentLvl === 2 ? 'bold' : 'normal',
                        }}
                    >
                        With whole block: ${tile.data().rent * 2}
                    </p>
                    <p
                        style={{
                            fontWeight: rentLvl === 3 ? 'bold' : 'normal',
                        }}
                    >
                        With 1 house: ${tile.data().rentIncreases[0]}
                    </p>
                    {tile
                        .data()
                        .rentIncreases.slice(1, 4)
                        .map((r, i) => (
                            <p
                                key={r}
                                style={{
                                    fontWeight:
                                        rentLvl === i + 4 ? 'bold' : 'normal',
                                }}
                            >
                                With {i + 2} houses: ${r}
                            </p>
                        ))}
                    <p
                        style={{
                            fontWeight: rentLvl === 7 ? 'bold' : 'normal',
                        }}
                    >
                        With hotel: ${tile.data().rentIncreases[4]}
                    </p>
                    <p>${tile.data().buildingCost} per house or hotel</p>
                </div>
            </div>
            <div className="Actions">
                {canBuyHouses(state, tile) && (
                    <button className="ActionButton" onClick={onBuyHouse}>
                        Buy {tile.data().buildings === 4 ? 'hotel' : 'house'}
                    </button>
                )}
                {canSellHouses(state, tile) && (
                    <button className="ActionButton" onClick={onSellHouse}>
                        Sell {tile.data().buildings === 5 ? 'hotel' : 'house'}{' '}
                        for ${tile.data().buildingCost / 2}
                    </button>
                )}
                {canMortgage(state, tile) && (
                    <button className="ActionButton" onClick={onMortgage}>
                        Mortgage for ${tile.data().price * 0.5}
                    </button>
                )}
                {canUnmortgage(state, tile) && (
                    <button className="ActionButton" onClick={onMortgage}>
                        Unmortgage for ${Math.ceil(tile.data().price * 0.55)}
                    </button>
                )}
                {canTrade(state, null, tile) && (
                    <button className="ActionButton" onClick={onTrade}>
                        Trade
                    </button>
                )}
            </div>
        </div>
    );
}

export default PropertyInfo;
