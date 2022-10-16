import { notification } from "antd";
import {SmileOutlined} from '@ant-design/icons';
const openNotification = (message = "", description = "") => {
  notification.open({
    message: message,
    description: description,
    icon:  <SmileOutlined style={{ color: '#4B31DE' }} />,
  
    style: {
     backgroundColor: "#D9EEE1",
      color: "#4B31DE",
      // textAlign: "center",
      borderRadius: "10px",
    },

  });
};

export { openNotification };
