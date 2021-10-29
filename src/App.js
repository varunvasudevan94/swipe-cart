import SwipeCards from './Components/SwipeCards';
import './App.css';

function App() {
  const grocery = require('./grocery.json');
  return (
    <div className="App">
      <SwipeCards grocery={grocery} />
    </div>
  );
}

export default App;
