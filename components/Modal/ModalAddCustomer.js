import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Col,
  Row,
  InputNumber,
  DatePicker,
  Cascader,
} from "antd";
import { PhoneOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { createCustomer } from "pages/api/customerAPI";
import { validateMessages } from "utils/messageForm";
import { openNotification, openNotificationWarning } from "utils/notification";
import JsonData from "data/address-vn.json";
import moment from "moment";
const { TextArea } = Input;
const { Option } = Select;

function ModalAddCustomer({ show, onSuccess, handleCancel }) {
  const [form] = Form.useForm();

  const [addressData, setAddressData] = useState(JsonData);

  const [provinceSelected, setProvinceSelected] = useState("");
  const [districtSelected, setDistrictSelected] = useState("");
  const [wardSelected, setWardSelected] = useState("");
  const [provinceSelectedCode, setProvinceSelectedCode] = useState("");
  const [districtSelectedCode, setDistrictSelectedCode] = useState("");
  const [wardSelectedCode, setWardSelectedCode] = useState("");

  const formatDate = "DD/MM/YYYY";

  const onFinish = async (values) => {
    let dataUser = {
      name: values.name,
      email: values.email,
      phoneNumber: values.phone,
      address: values.address,
      district: districtSelected,
      province: provinceSelected,
      ward: wardSelected,
      districtCode: districtSelectedCode,
      provinceCode: provinceSelectedCode,
      wardCode: wardSelectedCode,
      gender: values.gender,
      dateOfBirth: values.dateOfBirth,
      nationality: values.nationality,
      identityType: 2,
      identityNumber: values.identityNumber,
    };
    console.log(dataUser);
    try {
      const res = await createCustomer(dataUser);
      console.log(res);
      openNotification("Thành công", "Tạo mới khách hàng thành công");
      openNotification(
        "Thành công",
        "Tài khoản khách hàng là số điện thoại,mật khẩu mặc định là 123456"
      );
      handleCancel();
      onSuccess(res.data.Data);
      form.resetFields();
    } catch (error) {
      if (error?.response?.data?.message) {
        openNotificationWarning(error?.response?.data?.message);
      } else {
        openNotificationWarning("Có lỗi xảy ra, vui lòng thử lại sau");
      }
    }
  };

  const onChange = (value, selectedOptions) => {
    console.log(value, selectedOptions);
    if (selectedOptions) {
      setProvinceSelected(selectedOptions[0]?.label);
      setDistrictSelected(selectedOptions[1]?.label);
      setWardSelected(selectedOptions[2]?.label);
      setProvinceSelectedCode(selectedOptions[0]?.value);
      setDistrictSelectedCode(selectedOptions[1]?.value);
      setWardSelectedCode(selectedOptions[2]?.value);
    }
  };
  const filter = (inputValue, path) =>
    path.some(
      (option) =>
        option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    );

  return (
    <>
      <Modal
        title="Thêm khách hàng mới"
        visible={show}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              onFinish(values);
            })
            .catch((info) => {
              console.log("Validate Failed:", info);
            });
        }}
        onCancel={handleCancel}
        width={700}
        okText="Xác nhận"
        cancelText="Hủy bỏ"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={[16]}>
            <Col span={18}>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập họ tên!",
                  },
                ]}
                label="Tên người dùng"
                name="name"
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item initialValue="Nam" name="gender" label="Giới tính">
                <Select>
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                rules={[
                  {
                    pattern: new RegExp("^(84|0[3|5|7|8|9])+([0-9]{8})$"),
                    required: true,
                    message:
                      "Số điện thoại không hợp lệ! Số điện thoại bao gồm 10 ký tự số bắt đầu là 84 hoặc 03, 05, 07, 08, 09",
                  },
                ]}
                name="phone"
                label="Số điện thoại"
              >
                <Input
                  minLength={10}
                  maxLength={10}
                  prefix={<PhoneOutlined className="site-form-item-icon" />}
                  placeholder="số điện thoại"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                rules={[
                  {
                    required: true,
                    pattern: new RegExp("[0-9]{12}"),
                    message:
                      "Số CMND/CCCD không hợp lệ!, Số CMND/CCCD bao gồm 12 ký tự số",
                  },
                ]}
                name="identityNumber"
                label="Số CMND"
              >
                <Input maxLength={12} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                rules={[
                  {
                    pattern: new RegExp(
                      "^[a-z][a-z0-9_.]{5,32}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$"
                    ),
                    message: "Email không hợp lệ!",
                  },
                ]}
                name="email"
                label="Email"
              >
                <Input
                  prefix={<MailOutlined className="site-form-item-icon" />}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dateOfBirth" label="Ngày sinh">
                <DatePicker
                  disabledDate={(d) => !d || d.isSameOrAfter(moment())}
                  placeholder="Chọn ngày sinh"
                  format={formatDate}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                initialValue="Việt Nam"
                name="nationality"
                label="Quốc gia"
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="addressvn" label="Tỉnh/Thành phố - Quận - Huyện">
                <Cascader
                  options={addressData}
                  onChange={onChange}
                  placeholder="Tỉnh/Thành phố - Quận - Huyện"
                  showSearch={{
                    filter,
                  }}
                  onSearch={(value) => console.log(value)}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="address" label="Địa chỉ chi tiết">
                <TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}

export default ModalAddCustomer;
