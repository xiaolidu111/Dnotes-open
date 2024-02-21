import { useState } from 'react';
import './App.css';
import './index.less';
import MainHeader from './components/MainHeader';
import SearchBox from './components/SearchBox';
import DNotesContainer from './components/DNotesContainer/DNotesContainer';
import { Route, Routes } from 'react-router-dom';
import AddNotes from './components/AddNotes';

function App() {
	const [searchText, setSearchText] = useState<string>('');
	return (
		<div className="container">
			<Routes>
				<Route
					path="/"
					element={
						<>
							<MainHeader />
							<div className="main-title">便笺</div>
							<SearchBox setSearchText={setSearchText} />
							<DNotesContainer searchText={searchText} />
						</>
					}
				></Route>
				<Route path="/addNew/:id" element={<AddNotes />}></Route>
			</Routes>
		</div>
	);
}

export default App;
