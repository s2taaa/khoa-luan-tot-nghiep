import { Table , message } from "antd";
import React, { useState, useEffect } from "react";
import Column from "antd/lib/table/Column";
import {getServices} from 'api/serviceAPI';
function ServiceTable(props) {
	// const {
	// 	topics,
	// 	setInitialValue,
	// 	setIsModalVisible,
	// 	setIsAddMode,
	// 	courses,
	// 	query,
	// } = props;

	// const handleRedundantProperty = (id) => {
	// 	const filter = courses.filter((course) => course.id === id);
	// 	const course = filter ? filter[0] : null;
	// 	if (course) {
	// 		delete course.stt;
	// 		delete course.personNumber;
	// 		delete course.wordNumber;
	// 	}
	// 	return course;
	// };
	const [services, setServices] = useState([]);

	const handleGetServices = async () => {
		try {
			getServices().then((res) => {
				console.log("res:", res);
				if (res.data.status == 1) {
					setServices(res.data.data);
				} else {
					message.error(res.message);
				}
			})
		}catch(err){
			console.log(err)
	  
		  }
	}

	useEffect(() => {
		handleGetServices()
	  }, []);

	return (
		<Table  pagination={false}>
			<Column
				align="center"
				width="60px"
				title="STT"
				dataIndex="stt"
				key="stt"
			/>
			<Column title="Tên khóa học" dataIndex="name" key="name" />
			<Column
				title="Chủ đề"
				dataIndex="topicId"
				key="topicId"
				// render={(_, record) => {
				// 	const result = topics
				// 		.filter((topic) => topic.id === record.topicId)
				// 		.map((topic) => topic.name);

				// 	return <>{result}</>;
				// }}
			/>
			<Column
				title="Số từ"
				width="80px"
				dataIndex="wordNumber"
				key="wordNumber"
			/>
			{/* <Column
				key="action"
				align="center"
				render={(_, record, index) => {
					const course = handleRedundantProperty(record.id);
					return (
						<CourseAction
							course={course}
							setInitialValue={setInitialValue}
							setIsModalVisible={setIsModalVisible}
							setIsAddMode={setIsAddMode}
							query={query}
						/>
					);
				}}
			/> */}
		</Table>
	);
}

// CourseTable.propTypes = {
// 	courses: PropTypes.array,
// 	topics: PropTypes.array,
// 	setInitialValue: PropTypes.func,
// 	setIsModalVisible: PropTypes.func,
// 	setIsAddMode: PropTypes.func,
// 	query: PropTypes.object,
// };

// CourseTable.defaultProps = {
// 	courses: [],
// 	topics: [],
// 	setInitialValue: null,
// 	setIsModalVisible: null,
// 	setIsAddMode: null,
// };

export default ServiceTable;
