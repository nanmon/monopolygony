import React from 'react';
import PlayerInfo from './PlayerInfo';
import PropertyInfo from './PropertyInfo.js';
import RailroadInfo from './RailroadInfo.js';
import CompanyInfo from './CompanyInfo';
import TradeInfo from './TradeInfo';
import './styles/BoardInfo.css';
import { PLAYER_COLORS, getTileById } from '../../services/util';

function BoardInfo({ user, state, ui, dispatch, uiDispatch }) {
    function addPlayer() {
        const color = PLAYER_COLORS[state.players.size];
        if (!color) return;
        dispatch({ type: 'add-player', color });
    }

    function removePlayer() {
        const { size } = state.players;
        if (state.players.size === 2) return;
        const lastPlayer = state.players.docs[size - 1];
        dispatch({ type: 'remove-player', playerId: lastPlayer.id });
    }

    function joinGame() {
        const color = PLAYER_COLORS[state.players.size];
        dispatch({ type: 'join-game', userId: user.uid, color });
    }

    let content = null;
    if (state.trades.size > 0) {
        const trade = state.trades.docs[0];
        content = (
            <TradeInfo
                user={user}
                state={state}
                trade={trade}
                onMoney={args =>
                    dispatch({
                        ...args,
                        type: 'trade-money',
                        tradeId: trade.id,
                    })
                }
                onCancel={() =>
                    dispatch({ type: 'trade-cancel', tradeId: trade.id })
                }
                onDone={() =>
                    dispatch({ type: 'trade-done', tradeId: trade.id })
                }
            />
        );
    } else if (ui.selected == null) {
        content = (
            <PlayerInfo
                user={user}
                state={state}
                onNext={args => dispatch({ ...args, type: 'next' })}
                onAddPlayer={addPlayer}
                onRemovePlayer={removePlayer}
                onBankrupt={args => dispatch({ ...args, type: 'bankrupt' })}
                onJoinGame={joinGame}
            />
        );
    } else if (ui.selected.tileId) {
        const selectedTile = getTileById(state, ui.selected.tileId);
        if (selectedTile.data().type === 'property')
            content = (
                <PropertyInfo
                    user={user}
                    state={state}
                    tile={selectedTile}
                    onBuyHouse={() =>
                        dispatch({ type: 'buy-house', tileId: selectedTile.id })
                    }
                    onSellHouse={() =>
                        dispatch({
                            type: 'sell-house',
                            tileId: selectedTile.id,
                        })
                    }
                    onMortgage={() =>
                        dispatch({ type: 'mortgage', tileId: selectedTile.id })
                    }
                    onTrade={() =>
                        dispatch({
                            type: 'trade-new',
                            playerId: user.uid,
                            tileId: selectedTile.id,
                        })
                    }
                    onClose={() => uiDispatch({})}
                />
            );
        else if (selectedTile.data().type === 'railroad')
            content = (
                <RailroadInfo
                    user={user}
                    state={state}
                    tile={selectedTile}
                    onMortgage={() =>
                        dispatch({ type: 'mortgage', tileId: selectedTile.id })
                    }
                    onTrade={() =>
                        dispatch({
                            type: 'trade-new',
                            playerId: user.uid,
                            tileId: selectedTile.id,
                        })
                    }
                    onClose={() => uiDispatch({})}
                />
            );
        else if (selectedTile.data().type === 'company')
            content = (
                <CompanyInfo
                    user={user}
                    state={state}
                    tile={selectedTile}
                    onMortgage={() =>
                        dispatch({ type: 'mortgage', tileId: selectedTile.id })
                    }
                    onTrade={() =>
                        dispatch({
                            type: 'trade-new',
                            playerId: user.uid,
                            tileId: selectedTile.id,
                        })
                    }
                    onClose={() => uiDispatch({})}
                />
            );
    }
    return <div className="BoardInfo">{content}</div>;
}

export default BoardInfo;
