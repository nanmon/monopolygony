import React from 'react';
import './BoardScreen.css';
import { tiles, properties } from './services/board.json';
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

function BoardScreen() {
    const [state, dispatch] = React.useReducer(reducer, null, init);

    function renderTile(tile, index) {
        const Hut = MAP[tile.type];
        const side = getSide(index);
        const classes = ['tile', tile.id, side];
        const tokens = state.players.filter(p => p.position === index);
        const owned = state.properties.find(p => p.index === index);
        return (
            <div
                className={classes.join(' ')}
                key={tile.id}
                style={{
                    gridArea: tile.id,
                }}
            >
                <Hut
                    tile={tile}
                    side={side}
                    owner={owned && state.players[owned.ownedBy]}
                    onClick={() => dispatch({ type: 'select', tile })}
                >
                    {tokens.map(player => (
                        <PlayerToken
                            key={player.color}
                            player={player}
                            onClick={() => dispatch({ type: 'select', player })}
                        />
                    ))}
                </Hut>
            </div>
        );
    }

    const currentPlayer = state.players[state.turn];
    return (
        <div className="BoardScreen">
            <div className="Board">
                <div className="center">
                    {state.phase === 'advance' && (
                        <button onClick={() => dispatch({ type: 'roll' })}>
                            Roll dices
                        </button>
                    )}
                    {state.phase === 'pay' && (
                        <>
                            {ownership(state) ? (
                                <button
                                    onClick={() =>
                                        dispatch({ type: 'pay-rent' })
                                    }
                                >
                                    Pay rent
                                </button>
                            ) : (
                                <button
                                    onClick={() => dispatch({ type: 'pass' })}
                                >
                                    Continue
                                </button>
                            )}
                            {buyable(state) && (
                                <button
                                    onClick={() => dispatch({ type: 'buy' })}
                                >
                                    Buy property
                                </button>
                            )}
                        </>
                    )}
                    <div className="turn">
                        <span>Turn:</span>
                        <PlayerToken player={currentPlayer} />
                    </div>
                    <span>${currentPlayer.money}</span>
                </div>
                {tiles.map(renderTile)}
            </div>
            <BoardInfo state={state} />
        </div>
    );
}

export default BoardScreen;

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

function init() {
    return {
        players: [
            { position: 0, money: 1500, color: 'red' },
            { position: 0, money: 1500, color: 'blue' },
            { position: 0, money: 1500, color: 'green' },
            { position: 0, money: 1500, color: 'gold' },
        ],
        properties: [
            // {
            //     index: 2,
            //     id: 'asdasd'
            //     ownedBy: -1, // player index,
            //     houses: 0, // 0 - 5
            //     mortgaged: false
            // }
        ],
        turn: 0,
        phase: 'advance',
        lastDices: [0, 0],
        selected: {
            type: 'player',
            index: 0,
        },
    };
}

function reducer(state, action) {
    let newState = { ...state };
    switch (action.type) {
        case 'roll': {
            newState = advance(newState);
            newState.phase = 'pay';
            break;
        }
        case 'pay-rent': {
            newState = payRent(newState);
            newState.turn = (state.turn + 1) % state.players.length;
            newState.phase = 'advance';
            break;
        }
        case 'buy': {
            newState = tryBuy(newState);
            newState.turn = (state.turn + 1) % state.players.length;
            newState.phase = 'advance';
            break;
        }
        case 'pass': {
            newState.turn = (state.turn + 1) % state.players.length;
            newState.phase = 'advance';
            break;
        }
        case 'select': {
            if (action.player) {
                const index = state.players.indexOf(action.player);
                newState.selected = { type: 'player', index };
            } else {
                newState.selected = { type: 'property', tile: action.tile };
            }
            break;
        }
        default:
            throw new Error('invalid action type');
    }
    return newState;
}

function advance(state) {
    const newState = { ...state };
    const dice1 = Math.ceil(Math.random() * 6);
    const dice2 = Math.ceil(Math.random() * 6);
    newState.lastDices = [dice1, dice2];
    const player = { ...state.players[state.turn] };
    player.position = (player.position + dice1 + dice2) % 40;
    newState.players = [...state.players];
    newState.players[state.turn] = player;
    return newState;
}

function ownership(state) {
    const { position } = state.players[state.turn];
    return state.properties.find(p => p.index === position);
}

function buyable(state) {
    if (ownership(state)) return;
    const player = state.players[state.turn];
    const tile = tiles[player.position];
    const property = properties.find(p => p.id === tile.id);
    if (property && property.price) return property;
}

function payRent(state) {
    const newState = { ...state };
    const landed = ownership(state);
    const tile = tiles[landed.index];
    const property = properties.find(p => p.id === tile.id);
    if (!property || !property.rent) return newState;
    newState.players = [...state.players];
    const payingPlayer = { ...state.players[state.turn] };
    const payedPlayer = { ...state.players[landed.ownedBy] };
    payingPlayer.money -= property.rent;
    payedPlayer.money += property.rent;
    newState.players[state.turn] = payingPlayer;
    newState.players[landed.ownedBy] = payedPlayer;
    return newState;
}

function tryBuy(state) {
    const newState = { ...state };
    newState.players = [...state.players];
    newState.properties = [...state.properties];
    const player = { ...state.players[state.turn] };
    const tile = tiles[player.position];
    const property = properties.find(p => p.id === tile.id);
    if (!property || !property.price) return newState;
    if (property.price > player.money) return newState;
    player.money -= property.price;
    newState.properties.push({
        index: player.position,
        id: property.id,
        ownedBy: state.turn,
        houses: 0,
        mortgaged: false,
    });
    newState.players[state.turn] = player;
    return newState;
}

function getSide(index) {
    const tilesPerSide = tiles.length / 4;
    const sideIndex = Math.floor(index / tilesPerSide);
    return ['bottom', 'left', 'top', 'right'][sideIndex];
}
