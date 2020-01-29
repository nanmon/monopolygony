const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const PLAYER_COLORS = [
    'red',
    'blue',
    'green',
    'gold',
    'purple',
    'darkorange',
    'pink',
    'darkcyan',
];

module.exports.onNewGame = functions.firestore
    .document('Games/{id}')
    .onCreate(async (snap, _ctx) => {
        const data = snap.data();
        const boardId = data.board;
        const tilesRef = admin
            .firestore()
            .collection(`Boards/${boardId}/Tiles`);
        const gameTilesRef = snap.ref.collection('Tiles');
        const tilesQuery = await tilesRef.get();
        const batch = admin.firestore().batch();
        tilesQuery.docs.forEach(tileDoc => {
            batch.set(gameTilesRef.doc(tileDoc.id), {
                ...tileDoc.data(),
                buildings: 0,
                owner: null,
                mortgaged: false,
            });
        });
        const playersRef = snap.ref.collection('Players');
        let players = [];
        Array.from({ length: 4 }).forEach((_, i) => {
            const ref = playersRef.doc();
            batch.set(ref, {
                color: PLAYER_COLORS[i],
                frozenTurns: -1,
                money: 1500,
                position: 'go',
                turn: i,
            });
            players.push(ref.id);
        });
        batch.update(snap.ref, {
            started: false,
            turn: players[0],
            phase: 'roll',
            doublesCount: 0,
            lastDices: [0, 0],
            order: players,
            initialMoney: 1500,
        });
        await batch.commit();
    });
