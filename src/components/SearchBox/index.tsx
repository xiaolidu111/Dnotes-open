import { Input } from 'antd';
import './index.less';
interface ISearchBoxProps {
	setSearchText: (str: string) => void;
}
export default function SearchBox(props: ISearchBoxProps) {
	const { setSearchText } = props;
	// const onSearch = () => {
	// 	console.log('开始搜索1');
	// };
	const inputChangeHandler = (e: any) => {
		setSearchText(e.target.value);
	};
	return (
		<div className="search-container">
			{/* <Search placeholder="input search text" onSearch={onSearch} />
			 */}
			<Input
				placeholder="回车键搜索"
				variant="filled"
				onChange={inputChangeHandler}
			/>
			<div className="search-icon">{/* <SearchOutlined /> */}</div>
		</div>
	);
}
