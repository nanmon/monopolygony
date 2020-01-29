import React from 'react';
import { useParams } from 'react-router-dom';
import firebase from 'firebase/app';
import { useDocument, useCollection } from 'react-firebase-hooks/firestore';

import './BoardScreen.css';
import PropertyHut from './components/Huts/PropertyHut';
import GoHut from './components/Huts/GoHut';
import TaxHut from './components/Huts/TaxHut';
import ChestHut from './components/Huts/ChestHut';
import RailroadHut from './components/Huts/RailroadHut';
import ChanceHut from './components/Huts/ChanceHut';
import CompanyHut from './components/Huts/CompanyHut';
import JailHut from './components/Huts/JailHut';
import FreeParkingHut from './components/Huts/FreeParkingHut';
import GoToJailHut from './components/Huts/GoToJailHut';
import PlayerToken from './components/PlayerToken';
import BoardInfo from './components/BoardInfo';
import { dispatcher } from './services/reducer';
import BoardCenter from './components/BoardCenter';
import { isBankrupt } from './services/util';
// import { bigboys, regular } from './services/presets.json';

// const PRESET = process.env.NODE_ENV === 'production' ? regular : bigboys;

function FireBoardScreen() {
    const { id } = useParams();
    const state = useFireBoard(id);

    React.useEffect(() => {
        if (!state.game) return;
        if (!state.game.exists) {
            state.game.ref.set({
                board: 'regular',
            });
        }
    }, [state.game]);

    async function dispatch(action) {
        await dispatcher(state, action);
    }

    /**
     * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} tile
     * */
    function onHutClick(tile) {
        if (state.trades.size > 0) {
            const trade = state.trades.docs[0];
            if (tile.data().owner == null) return;
            dispatch({
                type: 'trade-add',
                tradeId: trade.id,
                tileId: tile.id,
            });
        } else {
            console.error('select tile???');
            //dispatch({ type: 'select', tile });
        }
    }

    /**
     * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Player>} player
     * */
    function onPlayerClick(player) {
        if (state.trades.size > 0) {
            const trade = state.trades.docs[0];
            return e => {
                e.stopPropagation();
                dispatch({
                    type: 'trade-set',
                    tradeId: trade.id,
                    playerId: player.id,
                });
            };
        }
    }

    /**
     * @param {FirebaseFirestore.DocumentSnapshot<Monopolygony.Tile>} tile
     * @param {number} index
     * */
    function renderTile(tile, index) {
        const Hut = MAP[tile.data().type];
        const side = getSide(state, index);
        const classes = ['tile', tile.id, side];
        const tokens = state.players.docs.filter(p => {
            if (isBankrupt(state, p)) return false;
            return p.data().position === tile.id;
        });
        return (
            <div
                className={classes.join(' ')}
                key={tile.id}
                style={{
                    gridArea: tile.id,
                }}
            >
                <Hut
                    state={state}
                    tile={tile}
                    side={side}
                    onClick={() => onHutClick(tile)}
                >
                    {tokens.map(player => (
                        <PlayerToken
                            key={player.id}
                            player={player}
                            onClick={onPlayerClick(player)}
                        />
                    ))}
                </Hut>
            </div>
        );
    }

    return (
        <div className="BoardScreen">
            {state.ready && (
                <>
                    <div className="Board">
                        <BoardCenter
                            state={state}
                            onNext={args => dispatch({ ...args, type: 'next' })}
                        />
                        {state.tiles.docs.map(renderTile)}
                    </div>
                    <div className="AfterBoard">
                        <BoardInfo
                            state={state}
                            onBuyHouse={() => dispatch({ type: 'buy-house' })}
                            onSellHouse={() => dispatch({ type: 'sell-house' })}
                            onMortgage={() => dispatch({ type: 'mortgage' })}
                            onTrade={args =>
                                dispatch({ ...args, type: 'trade-add' })
                            }
                            onMoneyTrade={args =>
                                dispatch({ ...args, type: 'trade-set' })
                            }
                            onCancelTrade={() =>
                                dispatch({ type: 'trade-cancel' })
                            }
                            onDoneTrade={() => dispatch({ type: 'trade-done' })}
                            onClose={() => dispatch({ type: 'select' })}
                            onNext={args => dispatch({ ...args, type: 'next' })}
                            onAddPlayer={() => dispatch({ type: 'add-player' })}
                            onRemovePlayer={() =>
                                dispatch({ type: 'remove-player' })
                            }
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default FireBoardScreen;

const MAP = {
    go: GoHut,
    jail: JailHut,
    freeparking: FreeParkingHut,
    gotojail: GoToJailHut,
    property: PropertyHut,
    railroad: RailroadHut,
    company: CompanyHut,
    chest: ChestHut,
    chance: ChanceHut,
    tax: TaxHut,
};

/**
 * @param {Monopolygony.BoardBundle} state
 */

function getSide(state, index) {
    const tilesPerSide = state.tiles.size / 4;
    const sideIndex = Math.floor(index / tilesPerSide);
    return ['bottom', 'left', 'top', 'right'][sideIndex];
}

function useFireBoard(gameId) {
    const gameRef = React.useMemo(() => {
        return firebase
            .firestore()
            .collection('Games')
            .doc(gameId);
    }, [gameId]);

    const tilesRef = React.useMemo(() => {
        return gameRef.collection('Tiles').orderBy('position');
    }, [gameRef]);

    const playersRef = React.useMemo(() => {
        return gameRef.collection('Players');
    }, [gameRef]);

    const tradesRef = React.useMemo(() => {
        return gameRef.collection('Trades');
    }, [gameRef]);

    /** @type {[FirebaseFirestore.DocumentSnapshot<Monopolygony.Game>]} */
    const [game] = useDocument(gameRef);
    /** @type {[FirebaseFirestore.QuerySnapshot<Monopolygony.Tile>]} */
    const [tiles] = useCollection(tilesRef);
    /** @type {[FirebaseFirestore.QuerySnapshot<Monopolygony.Player>]} */
    const [players] = useCollection(playersRef);
    /** @type {[FirebaseFirestore.QuerySnapshot<Monopolygony.Trade>]} */
    const [trades] = useCollection(tradesRef);

    return {
        game,
        tiles,
        players,
        trades,
        ready:
            game &&
            game.exists &&
            tiles &&
            !tiles.empty &&
            players &&
            !players.empty &&
            trades != null,
    };
}
