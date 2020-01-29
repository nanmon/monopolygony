import React from 'react';
import PlayerToken from '../PlayerToken';
import { properties } from '../../services/board.json';
import { canCompleteTrade } from '../../services/util';
import './styles/TradeInfo.css';

function TradeInfo({ state, onMoney, onCancel, onDone }) {
    const trade1 = state.trade[0];
    const trade2 = state.trade[1];
    const player1 = state.players[trade1.playerIndex];
    const player2 = trade2 && state.players[trade2.playerIndex];

    const groups = {};
    properties.forEach(p => {
        const ownership = state.properties.find(o => o.id === p.id);
        const property = { ...p, ownership };
        if (!groups[p.group]) groups[p.group] = [property];
        else groups[p.group].push(property);
    });

    function onChangeMoney(e, trade) {
        const { value } = e.target;
        onMoney({ playerIndex: trade.playerIndex, money: value });
    }

    const disabled = !canCompleteTrade(state);

    return (
        <div className="TradeInfo">
            <div className="TradeCard">
                <div className="PlayerMoney">
                    <PlayerToken player={player1} />
                    <p>Money:</p>
                    <input
                        type="number"
                        value={trade1.moneyStr}
                        onChange={e => onChangeMoney(e, trade1)}
                    />
                </div>
                <div className="Groups">
                    {Object.entries(groups).map(([groupColor, ppties]) => (
                        <div key={groupColor} className="Group">
                            {ppties.map(ppty => (
                                <div
                                    key={ppty.id}
                                    className="Property"
                                    style={{
                                        borderColor: ppty.groupColor,
                                        backgroundColor: getColor(ppty, trade1),
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {trade2 && (
                <div className="TradeCard">
                    <div className="PlayerMoney">
                        <PlayerToken player={player2} />
                        <p>Money:</p>
                        <input
                            type="number"
                            value={trade2.moneyStr}
                            onChange={e => onChangeMoney(e, trade2)}
                        />
                    </div>
                    <div className="Groups">
                        {Object.entries(groups).map(([groupColor, ppties]) => (
                            <div key={groupColor} className="Group">
                                {ppties.map(ppty => (
                                    <div
                                        key={ppty.id}
                                        className="Property"
                                        style={{
                                            borderColor: ppty.groupColor,
                                            backgroundColor: getColor(
                                                ppty,
                                                trade2,
                                            ),
                                        }}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="Actions">
                <button className="ActionButton" onClick={onCancel}>
                    Cancel Trade
                </button>
                <button
                    className="ActionButton"
                    disabled={disabled}
                    onClick={onDone}
                >
                    Do Trade
                </button>
            </div>
        </div>
    );
}

export default TradeInfo;

function getColor(property, tradeObj) {
    if (
        !property.ownership ||
        property.ownership.ownedBy !== tradeObj.playerIndex
    )
        return 'transparent';
    if (tradeObj.properties.find(pId => pId === property.ownership.id)) {
        if (property.group === 'Railroad' || property.group === 'Utilities')
            return 'lightgray';
        return 'white';
    }
    return property.groupColor;
}
