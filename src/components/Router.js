import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import BoardScreen from '../screens/board/BoardScreen';
const FireBoardScreen = React.lazy(() =>
    import('../screens/fire-board/FireBoardScreen'),
);

function Router(props) {
    return (
        <BrowserRouter>
            <React.Suspense fallback={<p>...</p>}>
                <Switch>
                    <Route exact path="/">
                        <BoardScreen />
                    </Route>
                    <Route path="/:id">
                        <FireBoardScreen />
                    </Route>
                </Switch>
            </React.Suspense>
        </BrowserRouter>
    );
}

export default Router;
