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
  InputNumber,
  Upload,
} from "antd";
import { useRouter } from "next/router";
import { openNotification } from "utils/notification";
import {
  getUserById,
  updateUserById,
  uploadImagesUser,
} from "pages/api/userAPI";
import { getCarModelById } from "pages/api/carModel";
import { validateMessages } from "utils/messageForm";
import ModalQuestion from "components/Modal/ModalQuestion";
import moment from "moment";
import ModalUploadImage from "components/Modal/ModalUploadImage";
import { UploadOutlined } from "@ant-design/icons";
const formatDate = "YYYY/MM/DD";

const CarModelDetail = ({ carModelId, onUpdateCarModel }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { TextArea } = Input;
  const [carModelDetail, setCarModelDetail] = useState({});
  const [modalUpload, setModalUpload] = useState(false);
  const [listFiles, setListFiles] = useState({
    images: [],
    imageBlob: [],
  });
  const [modalQuestion, setModalQuestion] = useState(false);

  const [brands, setBrands] = useState([
    "Toyota",
    "VinFast",
    "Nissan",
    "Suzuki",
    "Subaru",
    "Lexus",
    "Audi",
    "Volkswagen",
    "Honda",
    "Volvo",
    "Hyundai",
    "Mazda",
    "KIA",
    "Mitsubishi",
    "Maserati",
    "Chevrolet",
    "Ford",
    "Mercedes-Benz",
    "BMW",
  ]);

  const fetchcarModelDetail = async () => {
    try {
      const response = await getCarModelById(carModelId);
      setCarModelDetail(response.data.Data);
      form.setFieldsValue({
        id: response.data.Data.id,
        name: response.data.Data.name,
        brand: response.data.Data.brand,
        model: response.data.Data.model,
        engine: response.data.Data.engine,
        imageUrl: response.data.Data.imageUrl,
        transmission: response.data.Data.transmission,
        seats: response.data.Data.seats,
        fuel: response.data.Data.fuel,
      });
    } catch (error) {
      openNotification(error.response.Message);
    }
  };

  useEffect(() => {
    if (carModelId) {
      fetchcarModelDetail();
    }
  }, [carModelId]);

  const onFinish = async (values) => {
    try {
      let body = {
        name: values.name,
        email: values.email,
        address: values.address,
        status: values.status,
        image: values.image,
        birthDay: values.birthDay,
      };
      const res = await updateUserById(body, carModelId);
      if (res.data.StatusCode == "200") {
        openNotification("Cập nhật người dùng thành công!", "");
        onUpdateCarModel();
      }
    } catch (error) {
      console.log(error);
    }
  };
  // handle upload image

  const handleFileChosen = (info) => {
    console.log(info);
    const result = info.fileList.map((file) => {
      const blob = new Blob([file.originFileObj], {
        type: file.type,
      });
      return (window.URL || window.webkitURL).createObjectURL(blob);
    });
    setListFiles({ images: info.fileList, imageBlob: result });
    setModalUpload(true);
  };

  const handleUploadImages = async () => {
    try {
      const formData = new FormData();
      listFiles.images.map((image) => {
        formData.append("files", image.originFileObj);
      });

      const response = await uploadImagesUser(formData);
      setListFiles({ images: [], imageBlob: [] });
      setModalUpload(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Button type="link" size="small" onClick={() => router.push("/admin")}>
        Trở lại
      </Button>
      <br />
      <br />
      <Row>
        <Col span={6}>
          <Image width={300} height={250} src={carModelDetail.image} />
          <div style={{ marginTop: "10px" ,display:'flex',justifyContent:'center' }}>
            <Upload
              onChange={(info) => handleFileChosen(info)}
              multiple
              showUploadList={false}
              fileList={listFiles.imageBlob}
            >
              <Button icon={<UploadOutlined />}>Tải hình lên</Button>
            </Upload>
          </div>
        </Col>
        <Col span={17}>
          <Form
            form={form}
            layout="vertical"
            autoComplete="off"
            validateMessages={validateMessages}
          >
             <Row>
            <Col span={11} className="MarRight20">
              <Form.Item
                label="Tên mẫu xe"
                name="name"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={5} className="MarRight20">
              <Form.Item
                label="Số nghế ngồi"
                name="seats"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber style={{width:'100%'}} min={1} max={16} />
              </Form.Item>
            </Col>
            <Col span={5} className="MarRight20">
              <Form.Item
                label="Năm sản xuất"
                name="year"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber style={{width:'100%'}} min={1900} max={moment().year()} />
              </Form.Item>
            </Col>
            <Col span={11}  className="MarRight20">
              <Form.Item
                label="Model"
                name="model"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                label="Thương hiệu"
                name="brand"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Chọn thương hiệu"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.includes(input)
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.children
                      .toLowerCase()
                      .localeCompare(optionB.children.toLowerCase())
                  }
                >
                  {brands.map((brand) => (
                    <Option key={brand}>{brand}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
        
            <Col span={7}  className="MarRight20">
              <Form.Item
                label="Đông cơ"
                name="engine"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={7} className="MarRight20"  >
              <Form.Item
                label="Truyền động"
                name="transmission"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={7} className="MarRight20">
              <Form.Item
                label="Nhiên liệu"
                name="fuel"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select 
                  showSearch
                  placeholder="Chọn nhiên liệu"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.includes(input)
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.children
                      .toLowerCase()
                      .localeCompare(optionB.children.toLowerCase())
                  }
                >
                  <Option value="Xăng">Xăng</Option>
                  <Option value="Dầu">Dầu</Option>
                  <Option value="Điện">Điện</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
            <div className="service-action">
              <div style={{ marginRight: "20px" }}>
                <Button
                  onClick={() => {
                    router.push("/admin");
                  }}
                >
                  Đặt lại
                </Button>
              </div>
              <div>
                <Button
                  type="primary"
                  onClick={() => {
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
                  Cập nhật
                </Button>
              </div>
            </div>
          </Form>
        </Col>
      </Row>
      <ModalUploadImage
        visible={modalUpload}
        handleCancel={() => setModalUpload(false)}
        handleOk={() => handleUploadImages()}
        listImage={listFiles.imageBlob}
      />
    </>
  );
};

export default CarModelDetail;