import React from 'react';
import PlayerToken from '../PlayerToken';
import { properties } from '../../services/board.json';

function TradeInfo({ state, onMoney, onCancel, onDone }) {
    const trade1 = state.trade[0];
    const trade2 = state.trade[1];
    const player1 = state.players[trade1.playerIndex];
    const player2 = trade2 && state.players[trade2.playerIndex];
    const trade1Props = trade1.properties.map(pId =>
        properties.find(p => p.id === pId),
    );
    const trade2Props =
        trade2 &&
        trade2.properties.map(pId => properties.find(p => p.id === pId));

    function onChangeMoney(e, trade) {
        const { value } = e.target;
        const money = Number(value);
        onMoney({ playerIndex: trade.playerIndex, money });
    }

    return (
        <div className="TradeInfo">
            <p>Trade</p>
            <PlayerToken player={player1} />
            <p>Money:</p>
            <input
                type="number"
                value={trade1.money}
                onChange={e => onChangeMoney(e, trade1)}
            />
            {trade1Props.map(p => (
                <div key={p.id} style={{ backgroundColor: p.group }}>
                    {p.id}
                </div>
            ))}
            {trade2 && (
                <>
                    <PlayerToken player={player2} />
                    <p>Money:</p>
                    <input
                        type="number"
                        value={trade2.money}
                        onChange={e => onChangeMoney(e, trade2)}
                    />
                    {trade2Props.map(p => (
                        <div key={p.id} style={{ backgroundColor: p.group }}>
                            {p.id}
                        </div>
                    ))}
                </>
            )}
            <button onClick={onCancel}>Cancel Trade</button>
            {trade2 && <button onClick={onDone}>Do Trade</button>}
        </div>
    );
}

export default TradeInfo;
