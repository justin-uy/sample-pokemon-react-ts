import { MouseEvent, useEffect, useState } from 'react';
import Pokedex from './pokedex/Pokedex';
import Search from './search/Search';

import './App.css';

enum Location {
  SEARCH = '#search',
  POKEDEX = '#pokedex',
}

const DEFAULT_LOCATION = Location.SEARCH;

const headerItems = [
  {
    displayText: 'Search',
    hash: Location.SEARCH,
  },
  {
    displayText: 'Pokedex',
    hash: Location.POKEDEX,
  },
]

type HeaderItemProps = {
  displayText: string,
  hash: string,
  currentLocation: string,
  onClick: (e: MouseEvent<HTMLAnchorElement>) => void,
}

function HeaderItem(props: HeaderItemProps) {
  const { displayText, hash, currentLocation, onClick } = props;
  return (
    <a
      href={hash}
      className={currentLocation === hash ? 'selected' : ''}
      onClick={onClick}>
      {displayText}
    </a>
  );
}

function App() {
  const [currentLocation, setCurrentLocation] = useState(window.location.hash || DEFAULT_LOCATION)

  useEffect(() => {
    // Handle browser navigation
    const onPopStateCallback = () => {
      setCurrentLocation(window.location.hash);
    };
    window.addEventListener('popstate', onPopStateCallback);
    return () => {
      window.removeEventListener('popstate', onPopStateCallback);
    };
  }, [])

  return (
    <div className="App">
      <header className="header-bar">
        {headerItems.map(item =>
          <HeaderItem
            key={item.hash}
            displayText={item.displayText}
            hash={item.hash}
            currentLocation={currentLocation}
            onClick={(e) => {
              if (currentLocation === item.hash) {
                e.preventDefault();
                return;
              }

              setCurrentLocation(item.hash);
            }} />)}
      </header>
      {currentLocation === '#pokedex' && <Pokedex />}
      {currentLocation === '#search' && <Search />}
    </div>
  );
}

export default App;
