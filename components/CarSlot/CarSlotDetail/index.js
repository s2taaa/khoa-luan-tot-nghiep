import React, { useState, useEffect } from "react";
import {
  Tag,
  Row,
  Col,
  Typography,
  Table,
  Timeline,
  Button,
  Text,
  Card,
  Steps,
  Modal,
  Drawer,
  List,
  Avatar,
  Select,
  Breadcrumb,
  Form,
} from "antd";
import {
  getCarSlotByCode,
  getCarSlotDetail,
  executeCarSlot,
  cancelCarSlot,
  completeCarSlot,
} from "pages/api/carSlotApi";
import {
  SyncOutlined,
  LoadingOutlined,
  PrinterOutlined,
  PlusCircleFilled,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  TagsOutlined,
  HomeOutlined,
  CarOutlined,
  RollbackOutlined,
  QuestionCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { getUserById, getUserAvaliable } from "pages/api/userAPI";
import { useRouter } from "next/router";
import { formatMoney } from "utils/format";
import { getCarById } from "pages/api/carAPI";
import { getOrderById, updateOrder } from "pages/api/orderAPI";
import { getCustomerById } from "pages/api/customerAPI";
import Loading from "components/Loading";
import Image from "next/image";
import moment from "moment";
import ModalSelectOrder from "components/Modal/ModalSelectOrder";
import { openNotification, openNotificationWarning } from "utils/notification";
import ModalCreateBill from "components/Modal/ModalCreateBill";
import ModalQuestion from "components/Modal/ModalQuestion";
import UpDateServiceOrder from "components/Modal/ModalUpdateServiceOrder";
import DrawerPromotionOrder from "components/Drawer/DrawerPromotionOrder";
import { getAllPromotionUseable } from "pages/api/promotionDetail";
import ModalChangeExcutor from "components/Modal/ModalChangeExecutor";

const { Option } = Select;

const formatDate = "HH:mm DD/MM/YYYY";

const CarSlotDetail = ({ carSlotId }) => {
  const [form] = Form.useForm();
  const { Title } = Typography;
  const { Column, ColumnGroup } = Table;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCreateBill, setShowCreateBill] = useState(false);

  const [order, setOrder] = useState(null);
  const [car, setCar] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);

  const [orderSelected, setOrderSelected] = useState(null);

  const [showConfimCancel, setShowConfimCancel] = useState(false);
  const [showConfimComplete, setShowConfimComplete] = useState(false);
  const [showConfimExecute, setShowConfimExecute] = useState(false);
  const [showUpdateServiceOrder, setShowUpdateServiceOrder] = useState(false);
  const [promotionDetails, setPromotionDetails] = useState([]);
  const [showSelectPromotion, setShowSelectPromotion] = useState(false);
  const [showChangeExcutor, setShowChangeExcutor] = useState(false);
  const [step, setStep] = useState(1);

  const [carSlotDetail, setCarSlotDetail] = useState();

  const fetchCarSlotDetail = async () => {
    setLoading(true);
    try {
      const response = await getCarSlotByCode(carSlotId);
      setCarSlotDetail(response.data.Data);
      fetchOrderDetail(response.data.Data?.orderId);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const fetchUser = async (data) => {
    console.log("id", data);
    try {
      const response = await getUserById(data);
      setUser(response.data.Data);
      // form.setFieldValue("executorId", response.data.Data.id);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCarDetail = async (data) => {
    setLoading(true);
    try {
      const response = await getCarById(data);
      setCar(response.data.Data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const fetchCustomerDetail = async (data) => {
    setLoading(true);
    try {
      const response = await getCustomerById(data);
      setCustomer(response.data.Data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (data) => {
    setLoading(true);
    try {
      const response = await getOrderById(data);
      console.log("order", response.data.Data);
      setOrder(response.data.Data);
      fetchCarDetail(response.data.Data.carId);
      fetchCustomerDetail(response.data.Data.customerId);
      fetchUser(response.data.Data.executorId);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleFetchPromotion = async () => {
    try {
      const res = await getAllPromotionUseable(order?.id);
      setPromotionDetails(res.data.Data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (carSlotId) {
      fetchCarSlotDetail();
    }
  }, [carSlotId]);
  useEffect(() => {
    if (order) {
      handleFetchPromotion();
    }
  }, [order]);

  const convertStatusCarSlot = (status) => {
    console.log("statusss", status);
    switch (status) {
      case "AVAILABLE":
        return (
          <Tag
            style={{
              height: "30px",
              padding: "5px",
              fontSize: "15px",
            }}
            color="green"
          >
            ??ang tr???ng
          </Tag>
        );
      case "INAVAILABLE":
        return (
          <Tag
            style={{
              height: "30px",
              alignItems: "center",
              fontSize: "15px",
            }}
            color="red"
          >
            ??ang s???a ch???a
          </Tag>
        );
      case "IN_USE":
        return (
          <Tag
            style={{
              height: "30px",
              padding: "5px",
              fontSize: "15px",
            }}
            icon={<SyncOutlined spin />}
            color="processing"
          >
            ??ang x??? l??
          </Tag>
        );
    }
  };
  console.log(carSlotDetail?.status);

  const handleExecuteOrder = async () => {
    setLoading(true);
    let dataExecute = {
      orderId: orderSelected,
      carSlotId: carSlotDetail?.id,
    };
    try {
      const response = await executeCarSlot(dataExecute);
      openNotification("Th??nh c??ng!", "B???t ?????u x??? l?? y??u c???u");
      fetchCarSlotDetail();
      setLoading(false);
    } catch (error) {
      if (error?.response?.data?.message) {
        openNotificationWarning(error?.response?.data?.message);
      } else {
        openNotificationWarning("???? c?? l???i x???y ra");
      }
      setLoading(false);
    }
  };
  const handleCompleteOrder = async () => {
    setLoading(true);
    let dataComplete = {
      orderId: order?.id,
      carSlotId: carSlotDetail?.id,
      totalExecuteTime: moment().diff(
        moment(carSlotDetail?.orderStartExecuting),
        "minutes"
      ),
    };
    try {
      console.log(dataComplete);
      const response = await completeCarSlot(dataComplete);
      openNotification("Ho??n th??nh x??? l?? th??nh c??ng!");
      fetchCarSlotDetail();
      setLoading(false);
    } catch (error) {
      if (error?.response?.data?.message) {
        openNotificationWarning(error?.response?.data?.message);
      } else {
        openNotificationWarning("???? c?? l???i x???y ra");
      }
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setLoading(true);
    try {
      const response = await cancelCarSlot(carSlotDetail?.id);
      openNotification("H???y y??u c???u th??nh c??ng!", "");
      fetchCarSlotDetail();
      setLoading(false);
    } catch (error) {
      if (error?.response?.data?.message) {
        openNotificationWarning(error?.response?.data?.message);
      } else {
        openNotificationWarning("???? c?? l???i x???y ra");
      }
      setLoading(false);
    }
  };

  const handleSuccessBill = () => {
    setShowCreateBill(false);
    fetchCarSlotDetail();
  };

  const totalPriceService = () => {
    return order?.services?.reduce((total, cur) => {
      return (total += cur?.servicePrice?.price);
    }, 0);
  };

  const totalTimeService = () => {
    return order?.services?.reduce((total, cur) => {
      return (total += cur?.estimateTime);
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

  const handleSuccessUPdateOrder = () => {
    setShowUpdateServiceOrder(false);
    fetchCarSlotDetail();
  };

  const handleSuccessChangeExcutor = () => {
    setShowChangeExcutor(false);
    fetchCarSlotDetail();
  };
  return (
    <>
      <Row style={{ paddingBottom: "10px" }}>
        <Col span={12}>
          <Breadcrumb style={{ margin: "5px", alignItems: "center" }}>
            <Breadcrumb.Item href="/admin">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="">
              <CarOutlined /> Qu???n l?? v??? tr?? ch??m s??c xe
            </Breadcrumb.Item>
            <Breadcrumb.Item href="">
              {carSlotDetail?.name}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col span={12}>
          <Button
            style={{ float: "right" }}
            icon={<RollbackOutlined />}
            onClick={() => router.back()}
          >
            Tr??? l???i
          </Button>
        </Col>
      </Row>
    
        <Form form={form} layout="vertical">
          <div className="carslot">
            <div className="carslot-content">
              <div className="carslot-content--header">
                {/* <Title style={{ padding: "0px", color: "blue" }} level={3}>
                  {carSlotDetail?.name}
                </Title> */}
                <div></div>
                <div style={{float:'right'}}> {convertStatusCarSlot(carSlotDetail?.status)}</div>
              </div>
              {carSlotDetail?.status == "IN_USE" && (
                <Row>
                  <Col span={6}>
                    <div
                      style={{ marginRight: "10px" }}
                      className="carslot-customer content-white"
                    >
                       
                      <Title level={4}>Nh??n vi??n x??? l??</Title>
                      <Timeline>
                        <span>{user?.name + " - " + user?.phone}</span>

                        <EditOutlined
                          style={{ marginLeft: "5px" }}
                          onClick={() => setShowChangeExcutor(true)}
                        />
                      </Timeline>
                      <Title level={4}>Th??ng tin kh??ch h??ng</Title>
                      <Timeline>
                        <Timeline.Item>
                          M??: {customer?.customerCode}
                        </Timeline.Item>
                        <Timeline.Item>T??n: {customer?.name}</Timeline.Item>
                        <Timeline.Item>
                          S??? ??i???n tho???i: {customer?.phoneNumber}
                        </Timeline.Item>
                      </Timeline>
                      <Title level={4}>Th??ng tin xe</Title>
                      <Timeline>
                        <Timeline.Item>T??n xe: {car?.name}</Timeline.Item>
                        <Timeline.Item>Nh??n hi???u: {car?.brand}</Timeline.Item>
                        <Timeline.Item>Lo???i xe: {car?.model}</Timeline.Item>
                        <Timeline.Item>Nhi??n li???u: {car?.fuel}</Timeline.Item>
                        <Timeline.Item>Ch??? ng???i: {car?.seats}</Timeline.Item>
                        <Timeline.Item>
                          Bi???n s???: {car?.licensePlate}
                        </Timeline.Item>
                        <Timeline.Item>M??u xe: {car?.color}</Timeline.Item>
                      </Timeline>
                    </div>
                  </Col>
                  <Col span={18}>
                    <Row>
                      <Col
                        className="content-white"
                        style={{ marginBottom: "1rem" }}
                        span={24}
                      >
                        <Steps current={step} className="site-navigation-steps">
                          <Steps.Step
                            title="Ti???p nh???n y??u c???u"
                            status="finish"
                            description={
                              moment(order?.createDate).format(formatDate) || ""
                            }
                          />
                          <Steps.Step
                            title="B??t ?????u x??? l??"
                            status="process"
                            icon={<LoadingOutlined />}
                            description={
                              moment(carSlotDetail?.orderStartExecuting).format(
                                formatDate
                              ) || ""
                            }
                          />
                          <Steps.Step
                            title="D??? ki???n ho??n th??nh"
                            status="wait"
                            description={moment(
                              carSlotDetail?.orderStartExecuting
                            )
                              .add(totalTimeService(), "m")
                              .format(formatDate)}
                          />
                        </Steps>
                      </Col>
                      <Col span={24}>
                        <Table
                          size="small"
                          pagination={false}
                          bordered
                          dataSource={order?.services}
                          scroll={{ y: 260 }}
                          summary={() => {
                            return (
                              <>
                                <Table.Summary.Row>
                                  <Table.Summary.Cell
                                    index={0}
                                  ></Table.Summary.Cell>
                                  <Table.Summary.Cell index={1}>
                                    T???ng d???ch v???
                                  </Table.Summary.Cell>
                                  <Table.Summary.Cell index={2}>
                                    {totalTimeService() || 0} ph??t
                                  </Table.Summary.Cell>
                                  <Table.Summary.Cell index={3}>
                                    {formatMoney(totalPriceService() || 0)}
                                  </Table.Summary.Cell>
                                </Table.Summary.Row>
                                <Table.Summary.Row>
                                  <Table.Summary.Cell
                                    index={0}
                                  ></Table.Summary.Cell>
                                  <Table.Summary.Cell index={1}>
                                    <Button
                                      icon={<TagsOutlined />}
                                      type="ghost"
                                      style={{
                                        backgroundColor: "#B6D433",
                                        color: "white",
                                      }}
                                      onClick={() =>
                                        setShowSelectPromotion(true)
                                      }
                                    >
                                      Khuy???n m??i ???????c ??p d???ng
                                    </Button>
                                  </Table.Summary.Cell>
                                  <Table.Summary.Cell index={2}>
                                    <span
                                      style={{
                                        fontWeight: "bold",
                                        color: "#677E31",
                                      }}
                                    >
                                      T???ng ti???n khuy???n m??i
                                    </span>
                                  </Table.Summary.Cell>
                                  <Table.Summary.Cell index={3}>
                                    <span
                                      style={{
                                        fontWeight: "bold",
                                        color: "#677E31",
                                      }}
                                    >
                                      {formatMoney(totalPromotionAmount() || 0)}
                                    </span>
                                  </Table.Summary.Cell>
                                </Table.Summary.Row>
                                <Table.Summary.Row>
                                  <Table.Summary.Cell
                                    index={0}
                                  ></Table.Summary.Cell>
                                  <Table.Summary.Cell
                                    index={1}
                                  ></Table.Summary.Cell>
                                  <Table.Summary.Cell index={2}>
                                    <span
                                      style={{
                                        color: "red",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      T???ng thanh to??n (t???m t??nh)
                                    </span>
                                  </Table.Summary.Cell>
                                  <Table.Summary.Cell index={3}>
                                    {" "}
                                    <span
                                      style={{
                                        fontWeight: "bold",
                                        color: "red",
                                      }}
                                    >
                                      {formatMoney(finalTotalPrice() || 0)}
                                    </span>
                                  </Table.Summary.Cell>
                                </Table.Summary.Row>
                              </>
                            );
                          }}
                          title={() => (
                            <>
                              <Row>
                                <Col span={12}>
                                  <span
                                    style={{ fontSize: "1rem", font: "bold" }}
                                  >
                                    D???ch v??? s??? d???ng
                                  </span>
                                </Col>
                                <Col span={12}>
                                  <Button
                                    style={{ float: "right" }}
                                    type="primary"
                                    icon={<PlusCircleFilled />}
                                    onClick={() =>
                                      setShowUpdateServiceOrder(true)
                                    }
                                  >
                                    Th??m d???ch v???
                                  </Button>
                                </Col>
                              </Row>
                            </>
                          )}
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
                            title="T??n d???ch v???"
                            dataIndex="name"
                            key="name"
                          />
                          <Column
                            dataIndex="estimateTime"
                            key="estimateTime"
                            render={(text, record) => {
                              return <div>{record.estimateTime} ph??t</div>;
                            }}
                            title="Th???i gian s??? l??"
                          ></Column>
                          <Column
                            title="Gi?? d???ch v???"
                            dataIndex="price"
                            key="price"
                            render={(text, record, dataIndex) => {
                              return (
                                <div>
                                  {formatMoney(
                                    record?.servicePrice?.price || 0
                                  )}
                                </div>
                              );
                            }}
                          />
                        </Table>
                      </Col>

                      <Col span={24}>
                        <Row className="PullRight">
                          <div
                            style={{
                              bottom: "0",
                              right: "20px",
                              margin: "10px",
                            }}
                            className="service-action"
                          >
                            <div style={{ marginRight: "20px" }}>
                              <Button
                                onClick={() => {
                                  setShowConfimCancel(true);
                                }}
                                size="large"
                                type="primary"
                                danger={true}
                              >
                                H???y y??u c???u
                              </Button>
                            </div>
                            <div>
                              <Button
                                type="primary"
                                size="large"
                                onClick={() => {
                                  form
                                    .validateFields()
                                    .then((values) => {
                                      setShowConfimComplete(true);
                                    })
                                    .catch((info) => {
                                      console.log("Validate Failed:", info);
                                    });
                                }}
                              >
                                Ho??n th??nh - Thanh to??n - In h??a ????n
                              </Button>
                            </div>
                          </div>
                        </Row>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              )}
              {carSlotDetail?.status == "AVAILABLE" && (
                  <div style={{overflow:'auto',height: "500px",minHeight:"75vh"}} className='content-white-admin'>
                <Row className="content-white" span={24}>
                  <Col span={24}>
                    <Typography.Title
                      className="content-center"
                      style={{ color: "#829822" }}
                      level={2}
                    >
                      V??? tr?? ??ang tr???ng !!! vui l??ng ch???n y??u c???u x??? l??
                    </Typography.Title>
                  </Col>
                  <Col span={24}>
                    <ModalSelectOrder
                      onSelectOrder={(value) => {
                        setOrderSelected(value);
                        setShowConfimExecute(true);
                      }}
                    />
                  </Col>
                </Row>
                </div>
              )}
            </div>
          </div>
        </Form>
    
      <ModalCreateBill
        order={order}
        show={showCreateBill}
        handleCancel={() => setShowCreateBill(false)}
        onSuccess={() => handleSuccessBill()}
      />
      <ModalQuestion
        title="B???n c?? ch???c ch???n x??? l?? y??u c???u n??y?"
        visible={showConfimExecute}
        handleCancel={() => setShowConfimExecute(false)}
        handleOk={() => {
          handleExecuteOrder();
          setShowConfimExecute(false);
        }}
      />
      <ModalQuestion
        title="B???n c?? ch???c ch???n h???y y??u c???u x??? l?? n??y?"
        visible={showConfimCancel}
        handleCancel={() => setShowConfimCancel(false)}
        handleOk={() => {
          handleCancelOrder();
          setShowConfimCancel(false);
        }}
      />
      <UpDateServiceOrder
        show={showUpdateServiceOrder}
        order={order}
        handleCancel={() => setShowUpdateServiceOrder(false)}
        onSuccess={() => handleSuccessUPdateOrder()}
      />
      <Modal
        title="Ho??n th??nh y??u c???u"
        width={700}
        onCancel={() => setShowConfimComplete(false)}
        visible={showConfimComplete}
        footer={
          <>
            <div className="steps-action">
              <Button
                style={{
                  margin: "0 8px",
                }}
                onClick={() => {
                  setShowConfimComplete(false);
                }}
              >
                H???y
              </Button>
              <Button
                type="dashed"
                icon={<PrinterOutlined />}
                onClick={() => {
                  handleCompleteOrder();
                  setShowConfimComplete(false);
                  setShowCreateBill(true);
                }}
              >
                Ho??n th??nh - Thanh to??n - In h??a ????n
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  handleCompleteOrder();
                  setShowConfimComplete(false);
                }}
              >
                Ho??n th??nh y??u c???u
              </Button>
            </div>
          </>
        }
      >
        <Typography.Title level={4}>
          <QuestionCircleOutlined style={{ color: "yellowgreen" }} /> B???n c??
          ch???c ch???n ho??n th??nh x??? l?? y??u c???u n??y?
        </Typography.Title>
      </Modal>

      <DrawerPromotionOrder
        show={showSelectPromotion}
        promotionDetails={promotionDetails}
        handleCancel={() => setShowSelectPromotion(false)}
      />
      <ModalChangeExcutor
        show={showChangeExcutor}
        handleCancel={() => setShowChangeExcutor(false)}
        order={order}
        onSuccess={() => handleSuccessChangeExcutor()}
      />

      <Loading loading={loading} />
    </>
  );
};

export default CarSlotDetail;
