import React from 'react';
import { properties } from '../../services/board.json';
import PlayerToken from '../PlayerToken.js';
import {
    getBlockOwner,
    canBuyHouses,
    canMortgage,
    canUnmortgage,
    canSellHouses,
    canTrade,
} from '../../services/util.js';
import './styles/PropertyInfo.css';

function PropertyInfo({
    state,
    onBuyHouse,
    onSellHouse,
    onMortgage,
    onTrade,
    onClose,
}) {
    const property = properties.find(p => p.id === state.selected.tile.id);
    const ownership = state.properties.find(
        p => p.id === state.selected.tile.id,
    );
    const ownedBy = ownership && state.players[ownership.ownedBy];
    const blockOwner = ownership ? getBlockOwner(state, property.group) : -1;
    let rentLvl = 0;
    if (ownership) {
        rentLvl = 1;
        if (blockOwner !== -1) rentLvl += ownership.houses + 1;
    }
    return (
        <div className="PropertyInfo">
            <div className="PropertyCard">
                <div
                    className="Header"
                    style={{ backgroundColor: property.groupColor }}
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
                        Rent: ${property.rent}
                    </p>
                    <p
                        style={{
                            fontWeight: rentLvl === 2 ? 'bold' : 'normal',
                        }}
                    >
                        With whole block: ${property.rent * 2}
                    </p>
                    <p
                        style={{
                            fontWeight: rentLvl === 3 ? 'bold' : 'normal',
                        }}
                    >
                        With 1 house: ${property.multpliedrent[0]}
                    </p>
                    {property.multpliedrent.slice(1, 4).map((r, i) => (
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
                        With hotel: ${property.multpliedrent[4]}
                    </p>
                    <p>${property.housecost} per house or hotel</p>
                </div>
            </div>
            <div className="Actions">
                {canBuyHouses(state, property.id) && (
                    <button className="ActionButton" onClick={onBuyHouse}>
                        Buy {ownership.houses === 4 ? 'hotel' : 'house'}
                    </button>
                )}
                {canSellHouses(state, property.id) && (
                    <button className="ActionButton" onClick={onSellHouse}>
                        Sell {ownership.houses === 5 ? 'hotel' : 'house'} for $
                        {property.housecost / 2}
                    </button>
                )}
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

export default PropertyInfo;
