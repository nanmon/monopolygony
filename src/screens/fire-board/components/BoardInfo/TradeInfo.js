import React from 'react';
import PlayerToken from '../PlayerToken';
import {
    canCompleteTrade,
    getPlayerById,
    isMiscTile,
} from '../../services/util';
import './styles/TradeInfo.css';

/**
 * @param {object} props
 * @param {Monopolygony.BoardBundle} props.state
 * @param {firebase.firestore.DocumentSnapshot<Monopolygony.Trade>} props.trade
 */
function TradeInfo({ isMaster, state, trade, onMoney, onCancel, onDone }) {
    const [bInput, setBInput] = React.useState('');
    const [wInput, setWInput] = React.useState('');

    React.useEffect(() => {
        const timerId = setTimeout(() => {
            onMoney({ bMoney: bInput });
        }, 500);
        return () => clearTimeout(timerId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bInput]);

    React.useEffect(() => {
        const timerId = setTimeout(() => {
            onMoney({ wMoney: wInput });
        }, 500);
        return () => clearTimeout(timerId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wInput]);

    const { bMoney, wMoney } = trade.data();
    React.useEffect(() => {
        setBInput(bMoney);
    }, [bMoney]);
    React.useEffect(() => {
        setWInput(wMoney);
    }, [wMoney]);

    const player1 = getPlayerById(state, trade.data().by);
    const player2 =
        trade.data().with && getPlayerById(state, trade.data().with);

    const groups = {};
    state.tiles.docs.forEach(p => {
        if (isMiscTile(p)) return;
        const groupName = p.data().group;
        if (!groups[groupName]) groups[groupName] = [p];
        else groups[groupName].push(p);
    });

    function onChangeMoney(e, who) {
        const { value } = e.target;
        if (who === 'by') {
            setBInput(value);
            // onMoney({ tradeId: trade.id, bMoney: value });
        } else {
            setWInput(value);
            // onMoney({ tradeId: trade.id, wMoney: value });
        }
    }

    const disabled = !canCompleteTrade(state, trade);

    return (
        <div className="TradeInfo">
            <div className="TradeCard">
                <div className="PlayerMoney">
                    <PlayerToken player={player1} />
                    <p>Money:</p>
                    <input
                        type="number"
                        value={bInput}
                        onChange={e => onChangeMoney(e, 'by')}
                        readOnly={!isMaster}
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
                                        borderColor: ppty.data().groupColor,
                                        backgroundColor: getColor(
                                            trade,
                                            ppty,
                                            'by',
                                        ),
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {player2 && (
                <div className="TradeCard">
                    <div className="PlayerMoney">
                        <PlayerToken player={player2} />
                        <p>Money:</p>
                        <input
                            type="number"
                            value={wInput}
                            onChange={e => onChangeMoney(e, 'with')}
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
                                            borderColor: ppty.data().groupColor,
                                            backgroundColor: getColor(
                                                trade,
                                                ppty,
                                                'with',
                                            ),
                                        }}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {isMaster && (
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
            )}
        </div>
    );
}

export default TradeInfo;

function getColor(trade, tile, who) {
    let playerId = trade.data().by;
    let trading = trade.data().bProperties;
    if (who === 'with') {
        playerId = trade.data().with;
        trading = trade.data().wProperties;
    }
    if (tile.data().owner !== playerId) return 'transparent';
    else if (trading.includes(tile.id)) {
        if (
            tile.data().groupColor === 'white' ||
            tile.data().groupColor === 'Yellow'
        )
            return 'lightgray';
        return 'white';
    }
    return tile.data().groupColor;
}
