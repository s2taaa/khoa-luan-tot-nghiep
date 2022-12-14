import React, { useEffect, useState } from "react";
import { getOrders } from "pages/api/orderAPI";
import Loading from "components/Loading";
import {
  List,
  Col,
  Row,
  Typography,
  Tag,
  Drawer,
  Divider,
  Table,
  Button,
  Avatar,
} from "antd";
import { SyncOutlined, TagsOutlined } from "@ant-design/icons";
import { formatMoney } from "utils/format";
import { getAllPromotionUseable } from "pages/api/promotionDetail";
import moment from "moment";
import Image from "next/image";
import Cookies from "js-cookie";
import slot_active from "public/images/slot_active.gif";
import order_cancel from "public/images/order_cancel.png";
import order_complete from "public/images/order_complete.gif";
import order_wait from "public/images/order_wait.gif";
import order_pay from "public/images/order_pay.png";
const { Title } = Typography;
const formatDate = "HH:mm DD/MM/YYYY";
import DrawerPromotionOrder from "components/Drawer/DrawerPromotionOrder";

const DescriptionItem = ({ title, content }) => (
  <div className="site-description-item-profile-wrapper">
    <p
      style={{ font: "bold" }}
      className="site-description-item-profile-p-label"
    >
      {title}:
    </p>
    {content}
  </div>
);
const ServiceCustomer = ({ status }) => {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [orderDetail, setOrderDetail] = useState({});
  const [promotionDetails, setPromotionDetails] = useState([]);
  const [showSelectPromotion, setShowSelectPromotion] = useState(false);
  const handleGetOrders = async () => {
    setLoading(true);
    const username = Cookies.get("username");
    let dataGetOrder = {
      keyword: username,
      pageSize: 20,
      pageNumber: 0,
      status: status,
      sort: [
        {
          key: "createDate",
          asc: true,
        },
      ],
    };
    try {
      const res = await getOrders(dataGetOrder);
      console.log(res.data.Data);
      setOrders(res.data.Data.content);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleFetchPromotion = async () => {
    try {
      const res = await getAllPromotionUseable(orderDetail?.id);
      setPromotionDetails(res.data.Data);
    } catch (error) {
      console.log(error);
    }
  };

  const totalPriceService = () => {
    return orderDetail?.services?.reduce((total, cur) => {
      return (total += cur?.servicePrice?.price);
    }, 0);
  };
  const totalTimeService = () => {
    return orderDetail?.services?.reduce((total, cur) => {
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
        if (promotion.type === "MONEY"|| promotion.type ==="SERVICE") {
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

  const convertOrderStatus = (status) => {
    console.log("statusss", status);
    switch (status) {
      case 0:
        return (
          <Tag
            style={{
              height: "30px",
              padding: "5px",
              fontSize: "15px",
            }}
            color="yellow"
          >
            ??ang ch??? x??? l??
          </Tag>
        );
      case 100:
        return (
          <Tag
            style={{
              height: "30px",
              padding: "5px",
              fontSize: "15px",
            }}
            color="pink"
          >
            ???? xu???t h??a ????n
          </Tag>
        );
      case 10:
        return (
          <Tag
            style={{
              height: "30px",
              padding: "5px",
              fontSize: "15px",
            }}
            color="green"
          >
            ???? ho??n th??nh
          </Tag>
        );
      case -100:
        return (
          <Tag
            style={{
              height: "30px",
              padding: "5px",
              fontSize: "15px",
            }}
            color="red"
          >
            ???? h???y
          </Tag>
        );
      case 2:
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

  useEffect(() => {
    handleGetOrders();
  }, [status]);

  useEffect(() => {
    if (orderDetail) {
      handleFetchPromotion();
    }
  }, [orderDetail]);

  const handleImage = (status) => {
    switch (status) {
      case -100:
        return <Image height={170} width={170} src={order_cancel} />;
      case 10:
        return <Image height={170} width={170} src={order_complete} />;
      case 100:
        return <Image height={170} width={170} src={order_pay} />;
      case 0:
        return <Image height={170} width={170} src={order_wait} />;
      case 2:
        return <Image height={170} width={170} src={slot_active} />;
      default:
        break;
    }
  };
  const handleStatusInList = (item) => {
    switch (item.status) {
      case -100:
        return (
          <Row gutter={16}>
               <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <DescriptionItem
                title="Ti???p nh???n y??u c???u"
                content={moment(item.createDate).format(formatDate)}
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <DescriptionItem
                title="Th???i gian h???y"
                content={moment(item.orderCanceledDate).format(formatDate)}
              />
            </Col>
          </Row>
        );
      case 10:
        return (
          <Row gutter={16}>
            {" "}
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <DescriptionItem
                title="Ti???p nh???n y??u c???u"
                content={moment(item.createDate).format(formatDate)}
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <DescriptionItem
                title="B???t ?????u x??? l??"
                content={moment(item.carExecutingDate).format(formatDate)}
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <DescriptionItem
                title="Ho??n th??nh x??? l??"
                content={moment(item?.carExecutedDate).format(formatDate)}
              />
            </Col>
          </Row>
        );
      case 100:
        return (
          <Row gutter={16}>
            {" "}
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <DescriptionItem
                title="B???t ?????u x??? l??"
                content={moment(item.carExecutingDate).format(formatDate)}
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <DescriptionItem
                title="Ho??n th??nh"
                content={moment(item?.carExecutedDate).format(formatDate)}
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <DescriptionItem
                title="Thanh to??n"
                content={moment(item?.paymentDate).format(formatDate)}
              />
            </Col>
          </Row>
        );
      case 0:
        return (
          <Row gutter={16}>
            {" "}
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <DescriptionItem
                title="Ti???p nh???n y??u c???u"
                content={moment(item.createDate).format(formatDate)}
              />
            </Col>
          </Row>
        );
      case 2:
        return (
          <Row gutter={16}>
               <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <DescriptionItem
                title="Ti???p nh???n y??u c???u"
                content={moment(item.createDate).format(formatDate)}
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <DescriptionItem
                title="B???t ?????u x??? l??"
                content={moment(item.carExecutingDate).format(formatDate)}
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <DescriptionItem
                title="Ho??n th??nh d??? ki???n"
                content={moment(item?.carExecutingDate)
                  .add(item?.totalEstimateTime, "m")
                  .format(formatDate)}
              />
            </Col>
          </Row>
        );
      default:
        break;
    }
  };

  return (
    <>
      <List
        itemLayout="vertical"
        size="small"
        pagination={{
          pageSize: 3,
        }}
        style={{ overflow: "auto", height: "520px" }}
        dataSource={orders}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            onClick={() => {
              setOrderDetail(item);
              setShowDetail(true);
            }}
            extra={handleImage(item.status)}
            style={{
              cursor: "pointer",
              border: "1px solid #9B9A9A",
              margin: "10px",
              borderRadius: "8px",
              padding: "10px",
              boxShadow: "0px 0px 3px 0px #9B9A9A",
              backgroundColor: "white",
            }}
          >
            <List.Item.Meta
              title={
                <Typography.Title style={{ color: "#1C1266" }} level={5}>
                  #{item.orderCode}
                </Typography.Title>
              }
            />
            <Row gutter={16}>
              {/* <Col span={8}>
                <DescriptionItem title="M?? xe" content={item.carCode} />
              </Col> */}
              <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                <DescriptionItem title="T??n xe" content={item.carName} />
              </Col>
              <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                <DescriptionItem
                  title="Bi???n s???"
                  content={item.carLicensePlate}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                <DescriptionItem
                  title="Tr???ng th??i"
                  content={convertOrderStatus(item?.status)}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                <DescriptionItem
                  title="T???ng ti???n d???ch v???"
                  content={formatMoney(item.totalServicePrice)}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                <DescriptionItem
                  title="Th???i gian x??? l?? ?????c t??nh"
                  content={item.totalEstimateTime + " ph??t"}
                />
              </Col>
              {(item.status === 10 || item.status === 100) && (
                      <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                    <DescriptionItem
                      title="Th???i gian x??? l?? th???c t???"
                      content={item.totalExecuteTime + " ph??t"}
                    />
                  </Col>
                )}
            </Row>
            {handleStatusInList(item)}
          </List.Item>
        )}
      />

      <Drawer
        title="Chi ti???t y??u c???u"
        placement="right"
        onClose={() => setShowDetail(false)}
        visible={showDetail}
        width='70%'
        extra={convertOrderStatus(orderDetail?.status)}
      >
        <Divider>
          <Title level={5}>Y??u c???u :# {orderDetail.orderCode}</Title>
        </Divider>
        <Row gutter={[16]}>
          {/* <Col span={8}>
            <DescriptionItem title="M?? xe" content={billDetail.carCode} />
          </Col> */}
          {orderDetail.executorName && (
            <Col span={24}>
              <DescriptionItem
                title="Nh??n vi??n x??? l??"
                content={orderDetail.executorName}
              />
            </Col>
          )}
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
            <DescriptionItem title="T??n xe" content={orderDetail.carName} />
          </Col>
          <Col xs={24} sm={24} md={24} lg={8} xl={8}>
            <DescriptionItem
              title="Bi???n s???"
              content={orderDetail.carLicensePlate}
            />
          </Col>
        </Row>

        {handleStatusInList(orderDetail)}
        <Row gutter={[16, 16]}>
          <Table
            size="small"
            pagination={false}
            bordered
            dataSource={orderDetail?.services}
            scroll={{ y: 260 }}
            summary={() => {
              return (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}></Table.Summary.Cell>
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
                    <Table.Summary.Cell index={0}></Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Button
                        icon={<TagsOutlined />}
                        type="ghost"
                        style={{
                          backgroundColor: "#B6D433",
                          color: "white",
                        }}
                        onClick={() => setShowSelectPromotion(true)}
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
                    <Table.Summary.Cell index={0}></Table.Summary.Cell>
                    <Table.Summary.Cell index={1}></Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <span style={{ color: "red", fontWeight: "bold" }}>
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
                    <span style={{ fontSize: "1rem", font: "bold" }}>
                      D???ch v??? s??? d???ng
                    </span>
                  </Col>
                </Row>
              </>
            )}
          >
            <Col
              title="STT"
              dataIndex="stt"
              key="stt"
              width={70}
              render={(text, record, dataIndex) => {
                return <div>{dataIndex + 1}</div>;
              }}
            />
            <Col title="T??n d???ch v???" dataIndex="name" key="name" />
            <Col
              dataIndex="estimateTime"
              key="estimateTime"
              render={(text, record) => {
                return <div>{record.estimateTime} ph??t</div>;
              }}
              title="Th???i gian s??? l??"
            ></Col>
            <Col
              title="Gi?? d???ch v???"
              dataIndex="price"
              key="price"
              render={(text, record, dataIndex) => {
                return (
                  <div>{formatMoney(record?.servicePrice?.price || 0)}</div>
                );
              }}
            />
          </Table>
        </Row>
        <DrawerPromotionOrder
          show={showSelectPromotion}
          promotionDetails={promotionDetails}
          handleCancel={() => setShowSelectPromotion(false)}
        />
      </Drawer>

      <Loading loading={loading} />
    </>
  );
};

export default ServiceCustomer;
