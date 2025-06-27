import { Provider } from 'react-redux';
import { store } from './core/application/store/store';
import { HomePage } from './presentation/pages/HomePage';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <HomePage />
    </Provider>
  );
}

export default App;
