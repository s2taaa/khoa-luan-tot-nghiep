import React, { useEffect, useState, useRef } from "react";
import {
  Col,
  Row,
  Image,
  Button,
  Form,
  Select,
  Input,
  DatePicker,
  Upload,
  Popconfirm,
  Cascader,
} from "antd";
import { useRouter } from "next/router";
import { openNotification, openNotificationWarning } from "utils/notification";
import { updateUserById, uploadImagesUser } from "pages/api/userAPI";
import { getCustomerByCode, updateCustomer } from "pages/api/customerAPI";
import { validateMessages } from "utils/messageForm";
import ModalQuestion from "components/Modal/ModalQuestion";
import moment from "moment";
import ModalUploadImage from "components/Modal/ModalUploadImage";
import {
  CarOutlined,
  UploadOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import Loading from "components/Loading";
import JsonData from "data/address-vn.json";
import DrawerCar from "components/Drawer/DrawerCar";

const formatDate = "DD/MM/YYYY";

function CustomerDetail({ customerId, onUpdateCustomer }) {
  const router = useRouter();
  const [form] = Form.useForm();
  const { TextArea } = Input;
  const [customerDetail, setCustomerDetail] = useState({});
  const [modalUpload, setModalUpload] = useState(false);
  const [listFiles, setListFiles] = useState({
    images: [],
    imageBlob: [],
  });
  const [addressData, setAddressData] = useState(JsonData);
  const [modalQuestion, setModalQuestion] = useState(false);
  const [imageS3, setImageS3] = useState(null);
  const [loading, setLoading] = useState(false);

  const [provinceSelected, setProvinceSelected] = useState("");
  const [districtSelected, setDistrictSelected] = useState("");
  const [wardSelected, setWardSelected] = useState("");
  const [provinceSelectedCode, setProvinceSelectedCode] = useState("");
  const [districtSelectedCode, setDistrictSelectedCode] = useState("");
  const [wardSelectedCode, setWardSelectedCode] = useState("");

  const [carDrawer, setCarDrawer] = useState(false);

  const fetchcustomerDetail = async () => {
    setLoading(true);
    try {
      const response = await getCustomerByCode(customerId);
      setCustomerDetail(response.data.Data);
      console.log(response);
      form.setFieldsValue({
        name: response.data.Data.name,
        customerCode: response.data.Data.customerCode,
        phoneNumber: response.data.Data.phoneNumber,
        email: response.data.Data.email,
        gender: response.data.Data.gender,
        nationality: response.data.Data.nationality,
        identityNumber: response.data.Data.identityNumber,
        statusName: response.data.Data.statusName,
        dateOfBirth: response.data.Data.dateOfBirth
          ? moment(moment(response.data.Data.dateOfBirth), formatDate)
          : "",
        address: response.data.Data.address,
        addressvn: [
          response.data.Data.provinceCode,
          response.data.Data.districtCode,
          response.data.Data.wardCode,
        ],
        image: response.data.Data.image,
        status: response.data.Data.status,
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchcustomerDetail();
    }
  }, [customerId]);

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

  const onFinish = async (values) => {
    try {
      let body = {
        name: values.name,
        email: values.email,
        address: values.address,
        district: districtSelected,
        province: provinceSelected,
        ward: wardSelected,
        districtCode: districtSelectedCode,
        provinceCode: provinceSelectedCode,
        wardCode: wardSelectedCode,
        status: values.status,
        // image: imageS3 || customerDetail?.image,
        dateOfBirth: values.dateOfBirth,
        phoneNumber: values.phoneNumber,
        identityNumber: values.identityNumber,
        gender: values.gender,
        nationality: values.nationality,
      };
      const res = await updateCustomer(customerDetail.id, body);

      setCustomerDetail(res.data.Data);
      openNotification("C???p nh???t kh??ch h??ng th??nh c??ng!", "");
    } catch (error) {
      if (error?.response?.data?.message) {
        openNotificationWarning(error?.response?.data?.message);
      } else {
        openNotificationWarning("C?? l???i x???y ra, vui l??ng th??? l???i sau");
      }
    }
  };
  // handle upload image

  const handleFileChosen = (info) => {
    const result = info.fileList.map((file) => {
      const blob = new Blob([file.originFileObj], {
        type: file.type,
      });
      return (window.URL || window.webkitURL).createObjectURL(blob);
    });
    setListFiles({ images: info.fileList, imageBlob: result });
    setModalUpload(true);
  };
  const handleUpdateImage = async (imageUpload) => {
    let body = {
      image: imageUpload,
    };
    try {
      const res = await updateCustomer(customerDetail.id, body);
      openNotification("Th??nh c??ng!", "C???p nh???t ???nh ?????i di???n th??nh c??ng");
    } catch (error) {
      if (error?.response?.data?.message) {
        openNotificationWarning(error?.response?.data?.message);
      } else {
        openNotificationWarning("C?? l???i x???y ra, vui l??ng th??? l???i sau");
      }
    }
  };

  const handleUploadImages = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      listFiles.images.map((image) => {
        formData.append("files", image.originFileObj);
      });
      const response = await uploadImagesUser(formData);
      setImageS3(response.data.Data[0]);
      setCustomerDetail((prevState) => {
        return { ...prevState, image: response.data.Data[0] };
      });
      setListFiles({ images: [], imageBlob: [] });
      handleUpdateImage(response.data.Data[0]);
      openNotification("Th??nh c??ng", "T???i ???nh l??n th??nh c??ng");
      setModalUpload(false);
      setLoading(false);
    } catch (error) {
      if (error?.response?.data?.message) {
        openNotificationWarning(error?.response?.data?.message);
      } else {
        openNotificationWarning("C?? l???i x???y ra, vui l??ng th??? l???i sau");
      }
      setLoading(false);
    }
  };

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Image width={300} height={250} src={customerDetail.image} />
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Upload
              onChange={(info) => handleFileChosen(info)}
              showUploadList={false}
              fileList={listFiles.imageBlob}
              maxCount={1}
              listType="picture"
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Thay ?????i ???nh ?????i di???n</Button>
            </Upload>
          </div>
        </Col>
        <Col span={18}>
          <Form
            form={form}
            layout="vertical"
            autoComplete="off"
            validateMessages={validateMessages}
          >
            <Row gutter={[32]}>
              <Col span={12}>
                <Form.Item
                  label="T??n"
                  name="name"
                  rules={[
                    {
                      pattern: new RegExp(
                        "^[A-Z_????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????]+[a-zA-Z_??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????]*( *[a-zA-Z0-9_??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????]*)*$"
                      ),
                      required: true,
                      message: "T??n ng?????i d??ng kh??ng h???p l???!",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="site-form-item-icon" />}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="M?? kh??ch h??ng"
                  name="customerCode"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Xe Kh??ch h??ng">
                  <Button
                    type="primary"
                    style={{ width: "100%" }}
                    icon={<CarOutlined />}
                    onClick={() => {
                      setCarDrawer(true);
                    }}
                  >
                    Xem xe
                  </Button>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Ng??y sinh" name="dateOfBirth">
                  <DatePicker
                    disabledDate={(d) => !d || d.isSameOrAfter(moment())}
                    format={formatDate}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Nh??m kh??ch h??ng" name="status">
                  <Select>
                  <Select.Option value={0}>Ti???n n??ng</Select.Option>
                    <Select.Option value={1}>Th??ng th?????ng</Select.Option>
                    <Select.Option value={2}>VIP</Select.Option>

                  </Select>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="Gi???i t??nh" name="gender">
                  <Select>
                    <Select.Option value="Nam">Nam</Select.Option>
                    <Select.Option value="N???">N???</Select.Option>
                    <Select.Option value="Kh??c">Kh??c</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Qu???c t???ch" name="nationality">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="S??? ??i???n tho???i"
                  name="phoneNumber"
                  rules={[
                    {
                      pattern: new RegExp("^(84|0[3|5|7|8|9])+([0-9]{8})$"),
                      required: true,
                      message:
                        "S??? ??i???n tho???i kh??ng h???p l???! S??? ??i???n tho???i bao g???m 10 k?? t??? s??? b???t ?????u l?? 84 ho???c 03, 05, 07, 08, 09",
                    },
                  ]}
                >
                  <Input
                    minLength={10}
                    maxLength={10}
                    prefix={<PhoneOutlined className="site-form-item-icon" />}
                    placeholder="s??? ??i???n tho???i"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  rules={[
                    {
                      pattern: new RegExp("[0-9]{9,12}"),
                      message: "S??? CMND/CCCD kh??ng h???p l???!",
                    },
                  ]}
                  name="identityNumber"
                  label="S??? CMND / CCCD"
                >
                  <Input
                    placeholder="S??? C??n c?????c/Ch???ng minh"
                    minLength={9}
                    maxLength={12}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  rules={[
                    {
                      pattern: new RegExp(
                        "^[a-z][a-z0-9_.]{5,32}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$"
                      ),
                      message: "Email kh??ng h???p l???!",
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

              <Col span={24}>
                <Form.Item
                  name="addressvn"
                  label="T???nh/Th??nh ph??? - Qu???n/Huy???n - Ph?????ng/X??"
                >
                  <Cascader
                    changeOnSelect
                    options={addressData}
                    onChange={onChange}
                    placeholder="T???nh/Th??nh ph??? - Qu???n/Huy???n - Ph?????ng/X??"
                    showSearch={{
                      filter,
                    }}
                    onSearch={(value) => console.log(value)}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="S??? nh?? / T??n ???????ng" name="address">
                  <TextArea rows={2} />
                </Form.Item>
              </Col>
            </Row>
            <Row className="PullRight">
              <div
                style={{ bottom: "0", right: "20px", margin: "10px" }}
                className="service-action"
              >
                {/* <div style={{ marginRight: "20px" }}>
                  <Button
                    onClick={() => {
                      fetchcustomerDetail();
                    }}
                  >
                    ?????t l???i
                  </Button>
                </div> */}
                <div>
                  <Popconfirm
                    title="X??c nh???n?"
                    placement="topLeft"
                    okText="?????ng ??"
                    cancelText="H???y"
                    onConfirm={() => {
                      form
                        .validateFields()
                        .then((values) => {
                          onFinish(values);
                        })
                        .catch((info) => {
                          console.log("Validate Failed:", info);
                        });
                    }}
                  >
                    <Button icon={<SaveOutlined/>} type="primary">C???p nh???t</Button>
                  </Popconfirm>
                </div>
              </div>
            </Row>
          </Form>
        </Col>
      </Row>
      <ModalUploadImage
        visible={modalUpload}
        handleCancel={() => setModalUpload(false)}
        handleOk={() => handleUploadImages()}
        listImage={listFiles.imageBlob}
      />
      <DrawerCar
        show={carDrawer}
        handleCancel={() => setCarDrawer(false)}
        id={customerDetail?.id}
      />
      <Loading loading={loading} />
    </>
  );
}

export default CustomerDetail;
