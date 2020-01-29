const functions = require('firebase-functions');
const admin = require('firebase-admin');

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
        const tileProms = tilesQuery.docs.map(tileDoc => {
            return gameTilesRef.doc(tileDoc.id).set({
                ...tileDoc.data(),
                buildings: 0,
                owner: null,
                mortgaged: false,
            });
        });
        const playersRef = snap.ref.collection('Players');
        const playerProms = Array.from({ length: 4 }).map((_, i) => {
            return playersRef.add({
                color: PLAYER_COLORS[i],
                frozenTurns: -1,
                money: 1500,
                position: 'go',
            });
        });
        await Promise.all([...tileProms, ...playerProms]);
    });
