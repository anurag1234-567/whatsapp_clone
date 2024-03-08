import { Routes, Route } from 'react-router-dom';
import PrivateRouting from './privateRouting';
import Container from './container';
import Login from './login';
import './App.css';

function App(){

    return(
        <Routes>
            <Route path='/' element={<PrivateRouting />}>
                <Route path='/' element={<Container />} />
            </Route>
            <Route path='/login' element={<Login />} />
        </Routes>
    )
}
export default App;