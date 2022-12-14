import React, { useState, useEffect } from "react";
import {
  Modal,
  Row,
  Col,
  Form,
  Input,
  Select,
  Typography,
  Steps,
  Button,
  DatePicker,
  Divider,
  Timeline,
  Table,
} from "antd";
import { PlusCircleOutlined, UserAddOutlined } from "@ant-design/icons";
import { getUsers ,getUserAvaliable } from "pages/api/userAPI";
import { getAllPromotionUseAbleByServiceIds } from "pages/api/promotionDetail";
import { getCustomers } from "pages/api/customerAPI";
import { getCustomerById } from "pages/api/customerAPI";
import { getCarById } from "pages/api/carAPI";
import { createOrder } from "pages/api/orderAPI";
import { getCarbyCustomerId } from "pages/api/carAPI";
import { validateMessages } from "utils/messageForm";
import { openNotification, openNotificationWarning } from "utils/notification";
import ServiceOrder from "./ModalService";
import { formatMoney } from "utils/format";
import ModalAddCustomer from "./ModalAddCustomer";
import ModalAddCarWithCustomer from "./ModalAddCarWithCustomer";
import moment from "moment";
import Loading from "components/Loading";


const { Title } = Typography;
const { Option } = Select;
const { Column, ColumnGroup } = Table;
const formatDate = "HH:mm DD/MM/YYYY";

const ModalAddOrder = ({ show, onSuccess, handleCancel }) => {
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [userSelected, setUserSelected] = useState({});

  const [cars, setCars] = useState([]);

  const [customerOrder, setCustomerOrder] = useState(null);
  const [carOrder, setCarOrder] = useState(null);

  const [promotionDetails, setPromotionDetails] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceIds, setServiceIds] = useState([]);

  const [modalCar, setModalCar] = useState(false);
  const [modalCustomer, setModalCustomer] = useState(false);

  const [loading, setLoading] = useState(false);

  const [current, setCurrent] = useState(0);

  const handleFetchCustomer = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data.Data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleFetchUser = async () => {
    try {
      const res = await getUserAvaliable();
      setUsers(res.data.Data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleFetchCar = async () => {
    try {
      const res = await getCarbyCustomerId(form.getFieldValue("customerId"));
      setCars(res.data.Data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleFetchPromotion = async () => {
    try {
      console.log(services.map((s) => s.id));
      const res = await getAllPromotionUseAbleByServiceIds(
        services.map((s) => s.id)
      );
      setPromotionDetails(res.data.Data);
      console.log(res.data.Data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (show) {
      handleFetchCustomer();
      handleFetchUser();
    }
    handleFetchCar();
    if (current == 2) {
      handleFetchPromotion();
      handleGetData();
    }
  }, [show, current, form]);

  const handelChangeUser = async () => {
    form.setFieldValue("carId", null);
    handleFetchCar();
  };

  const handleGetData = async () => {
    const resCustomer = await getCustomerById(form.getFieldValue("customerId"));
    setCustomerOrder(resCustomer.data.Data);
    console.log(resCustomer.data.Data);
    const resCar = await getCarById(form.getFieldValue("carId"));
    setCarOrder(resCar.data.Data);
    console.log(resCar.data.Data);
  };
  const next = () => {
    if (current == 0) {
      if (form.getFieldValue("customerId") == null) {
        openNotification("Vui l??ng ch???n kh??ch h??ng!");
        return;
      }
      if (form.getFieldValue("carId") == null) {
        openNotification("Vui l??ng ch???n xe!");
        return;
      }
    }
    if (current == 1) {
      if (services.length == 0) {
        openNotification("Vui l??ng ch???n d???ch v???!");
        return;
      }
    }
    setCurrent(current + 1);
  };
  const prev = () => {
    setCurrent(current - 1);
  };

  const handleSuccessCreateCar = async (data) => {
    await handleFetchCar();
    form.setFieldsValue({
      carId: data.id,
    });
  };
  const handleSuccessCreateCustomer = async (data) => {
    await handleFetchCustomer();

    form.setFieldsValue({
      customerId: data.id,
      carId: null,
    });
  };

  const totalTimeService = () => {
    return services.reduce((total, cur) => {
      return (total += cur.estimateTime);
    }, 0);
  };

  const onFinish = async () => {
    setLoading(true);
    const dataCreateOrder = {
      carId: form.getFieldValue("carId"),
      customerId: form.getFieldValue("customerId"),
      serviceIds: services.map((item) => item.id),
      receiveDate: form.getFieldValue("receiveDate"),
      executeDate: form.getFieldValue("executeDate"),
      executorId: form.getFieldValue("executorId"),
    };

    try {
      const res = await createOrder(dataCreateOrder);
      openNotification("Th??nh c??ng!", "T???o y??u c???u th??nh c??ng");
      handleCancel();
      handleReset();
      onSuccess(res?.data?.Data);
      form.resetFields();
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

  const handleReset = () => {
    form.resetFields();
    setCarOrder(null);
    setCustomerOrder(null);
    setServices([]);
    setServiceIds([]);
    setCurrent(0);
  };

  const totalPriceService = () => {
    return services.reduce((total, cur) => {
      return (total += cur.servicePrice.price);
    }, 0);
  };
  const totalPromotionAmount = () => {
    let totalPromotion = 0;
    promotionDetails.forEach((promotion) => {
      if (promotion.type === "PERCENTAGE") {
        let total = (totalPriceService() * promotion.amount) / 100;
        if (total > promotion.maximumDiscount) {
          totalPromotion += promotion.maximumDiscount;
        } else {
          totalPromotion += total;
        }
      } else {
        if (promotion.type === "MONEY" || promotion.type === "SERVICE") {
          totalPromotion += promotion.amount;
        }
      }
    });
    return totalPromotion;
  };
  const finalTotalPrice = () => {
    let total = totalPriceService() - totalPromotionAmount();
    return total;
  };
  const handleChangeCustomer = (values) => {
    const user = users.find((u) => u.id === values);
    setUserSelected(user);
  };
  return (
    <>
      <Modal
        title="T???o m???i y??u c???u"
        centered
        visible={show}
        width="90%"
        bodyStyle={{ minHeight: "65vh" }}
        closable
        onCancel={handleCancel}
        cancelText="H???y b???"
        footer={
          <>
            <div className="steps-action">
              {current > 0 && (
                <Button
                  style={{
                    margin: "0 8px",
                  }}
                  onClick={() => prev()}
                >
                  Quay l???i
                </Button>
              )}
              {current < 2 && (
                <Button type="primary" onClick={() => next()}>
                  Ti???p t???c
                </Button>
              )}
              {current === 2 && (
                <Button
                  type="primary"
                  onClick={() =>
                    form.validateFields().then((values) => {
                      onFinish(values);
                    })
                  }
                >
                  Ho??n th??nh
                </Button>
              )}
            </div>
          </>
        }
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          validateMessages={validateMessages}
        >
          <Row gutter={[16]}>
            <Col span={24}>
              <div style={{ margin: "10px" }}>
                <Steps current={current}>
                  <Steps.Step title="Ch???n kh??ch h??ng" />
                  <Steps.Step title="Ch???n d???ch v???" />
                  <Steps.Step title="Ho??n th??nh y??u c???u" />
                </Steps>
              </div>
            </Col>
            {current === 0 && (
              <>
                <Col span={11}>
                  <Form.Item
                    label="Kh??ch h??ng"
                    name="customerId"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Ch???n kh??ch h??ng"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.includes(input)
                      }
                      filterSort={(optionA, optionB) =>
                        optionA.children
                          .toLowerCase()
                          .localeCompare(optionB.children.toLowerCase())
                      }
                      onChange={handelChangeUser}
                    >
                      {customers.map((item) => (
                        <Option value={item.id}>
                          {item.customerCode +
                            " - " +
                            item.name +
                            " - " +
                            item.phoneNumber}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col style={{ display: "flex", alignItems: "center" }} span={1}>
                  <Button
                    icon={<UserAddOutlined />}
                    type="primary"
                    onClick={() => setModalCustomer(true)}
                  ></Button>
                </Col>
                <Col span={11}>
                  <Form.Item
                    label="Xe"
                    name="carId"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Ch???n xe"
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
                      {cars.map((item) => (
                        <Option value={item.id}>{item.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col style={{ display: "flex", alignItems: "center" }} span={1}>
                  <Button
                    icon={<PlusCircleOutlined />}
                    type="primary"
                    onClick={() => {
                      if (form.getFieldValue("customerId")) {
                        setModalCar(true);
                      } else {
                        openNotification("Vui l??ng ch???n kh??ch h??ng!");
                      }
                    }}
                  ></Button>
                </Col>
                <Col span={8}>
                  <Form.Item label="Nh??n vi??n x??? l??" name="executorId">
                    <Select
                      showSearch
                      placeholder="Ch???n nh??n vi??n"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.includes(input)
                      }
                      filterSort={(optionA, optionB) =>
                        optionA.children
                          .toLowerCase()
                          .localeCompare(optionB.children.toLowerCase())
                      }
                      onChange={handleChangeCustomer}
                    >
                      {users.map((item) => (
                        <Option value={item.id}>
                          {item.name + " - " + item.phone}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Ng??y nh???n xe d??? ki???n"
                    name="receiveDate"
                    initialValue={moment()}
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <DatePicker
                      disabledDate={(d) => !d || d.isBefore(moment())}
                      disabledTime={(d) => !d || d.isBefore(moment())}
                      showTime
                      placeholder="Ng??y nh???n xe d??? ki???n"
                      format={formatDate}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Ng??y x??? l?? d??? ki???n"
                    name="executeDate"
                    initialValue={moment()}
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <DatePicker
                      showTime
                      disabledDate={(d) => !d || d.isBefore(moment())}
                      disabledTime={(d) => !d || d.isBefore(moment())}
                      placeholder="Ng??y x??? l?? d??? ki???n"
                      format={formatDate}
                    />
                  </Form.Item>
                </Col>
              </>
            )}
            {current === 1 && (
              <Col span={24}>
                <ServiceOrder
                  selectedService={(value) => setServices(value)}
                  onSelected={(value) => setServiceIds(value)}
                />
              </Col>
            )}
            {current === 2 && (
              <>
                <Col span={24}>
                  <Title level={4}>Th??ng tin y??u c???u</Title>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Table
                        size="small"
                        pagination={false}
                        summary={() => {
                          return (
                            <>
                              <Table.Summary.Row>
                                <Table.Summary.Cell
                                  index={0}
                                ></Table.Summary.Cell>
                                <Table.Summary.Cell
                                  index={1}
                                ></Table.Summary.Cell>
                                <Table.Summary.Cell
                                  index={2}
                                ></Table.Summary.Cell>
                                <Table.Summary.Cell index={3}>
                                  {totalTimeService() || 0} ph??t
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={4}>
                                  {formatMoney(totalPriceService() || 0)}
                                </Table.Summary.Cell>
                              </Table.Summary.Row>
                            </>
                          );
                        }}
                        dataSource={services}
                        bordered
                        scroll={{
                          y: 150,
                        }}
                      >
                        <Column
                          title="STT"
                          dataIndex="stt"
                          key="stt"
                          width={70}
                          render={(text, record, dataIndex) => {
                            return <div>{dataIndex + 1}</div>;
                          }}
                        />
                        <Column
                          title="M?? d???ch v???"
                          dataIndex="serviceCode"
                          key="serviceCode"
                        />
                        <Column
                          title="T??n d???ch v???"
                          dataIndex="name"
                          key="name"
                        />
                        <Column
                          dataIndex="estimateTime"
                          key="estimateTime"
                          title="Th???i gian s??? l??"
                          render={(text) => {
                            return <div>{text} ph??t</div>;
                          }}
                        ></Column>
                        <Column
                          title="Gi?? d???ch v???"
                          dataIndex="price"
                          key="price"
                          render={(text, record, dataIndex) => {
                            return (
                              <div>
                                {formatMoney(record.servicePrice.price)}
                              </div>
                            );
                          }}
                        />
                      </Table>
                    </Col>
                    <Col span={24}>
                      <div
                        style={{
                          backgroundColor: "#fff",
                          padding: "10px",
                          borderRadius: "10px",
                        }}
                      >
                        <Row gutter={32}>
                          <Col
                            style={{ borderRight: "solid LightGray 1px" }}
                            span={5}
                          >
                            <Divider>Kh??ch h??ng </Divider>
                            <Timeline style={{ marginTop: "15px" }}>
                              <Timeline.Item>
                                M??: {customerOrder?.customerCode}
                              </Timeline.Item>
                              <Timeline.Item>
                                T??n: {customerOrder?.name}
                              </Timeline.Item>
                              <Timeline.Item>
                                S??? ??i???n tho???i: {customerOrder?.phoneNumber}
                              </Timeline.Item>
                            </Timeline>
                          </Col>
                          <Col
                            style={{ borderRight: "solid LightGray 1px" }}
                            span={5}
                          >
                            <Divider>Xe </Divider>
                            <Timeline style={{ marginTop: "15px" }}>
                              <Timeline.Item>
                                M??: {carOrder?.carCode}
                              </Timeline.Item>
                              <Timeline.Item>
                                Xe: {carOrder?.name}
                              </Timeline.Item>
                              <Timeline.Item>
                                Bi???n s???: {carOrder?.licensePlate}
                              </Timeline.Item>
                            </Timeline>
                          </Col>
                          <Col
                            style={{ borderRight: "solid LightGray 1px" }}
                            span={7}
                          >
                            <Divider>Th??ng tin</Divider>
                            <Timeline style={{ marginTop: "5px" }}>
                              <Timeline.Item>
                                Nh??n vi??n x??? l??:{" "}
                                {userSelected?.name || "Ch??a ch???n"}
                              </Timeline.Item>
                              <Timeline.Item>
                                Th???i gian nh???n xe d??? ki???n:{" "}
                                {moment(
                                  form.getFieldsValue(["receiveDate"])
                                    .receiveDate
                                ).format(formatDate)}{" "}
                              </Timeline.Item>
                              <Timeline.Item>
                                Th???i gian s??? l?? d??? ki???n:{" "}
                                {moment(
                                  form.getFieldsValue(["executeDate"])
                                    .executeDate
                                ).format(formatDate)}{" "}
                              </Timeline.Item>
                              <Timeline.Item>
                                Th???i gian ho??n th??nh d??? ki???n:
                                {moment(form.getFieldValue("executeDate"))
                                  .add(totalTimeService(), "m")
                                  .format(formatDate)}
                              </Timeline.Item>
                            </Timeline>
                          </Col>
                          <Col span={7}>
                            <Divider>Th??ng tin thanh to??n</Divider>
                            <Timeline style={{ marginTop: "15px" }}>
                              <Timeline.Item>
                                T???ng ti???n d???ch v???:{" "}
                                {formatMoney(totalPriceService() || 0)}
                              </Timeline.Item>
                              <Timeline.Item>
                                Khuy???n m??i: -{" "}
                                {formatMoney(totalPromotionAmount() || 0)}
                              </Timeline.Item>
                              <Timeline.Item>
                                T???ng thanh to??n :
                                {formatMoney(finalTotalPrice() || 0)}
                              </Timeline.Item>
                            </Timeline>
                          </Col>
                        </Row>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </>
            )}
          </Row>
        </Form>
      </Modal>
      {/* <ModalAddCar
        show={modalCar}
        handleCancel={() => setModalCar(false)}
        onSuccess={(value) => handleSuccessCreateCar(value)}
      /> */}
      <ModalAddCustomer
        show={modalCustomer}
        handleCancel={() => setModalCustomer(false)}
        onSuccess={(value) => handleSuccessCreateCustomer(value)}
      />
      <ModalAddCarWithCustomer
        customerId={form.getFieldValue("customerId")}
        show={modalCar}
        handleCancel={() => setModalCar(false)}
        onSuccess={(value) => handleSuccessCreateCar(value)}
      />
      <Loading loading={loading} />
    </>
  );
};

export default ModalAddOrder;
