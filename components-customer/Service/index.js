import React, { useEffect, useState } from "react";
import { getOrders } from "pages/api/orderAPI";
import Loading from "components/Loading";
import { List, Col, Row, Typography } from "antd";
import { formatMoney } from "utils/format";
import moment from "moment";
import Image from "next/image";
import Cookies from "js-cookie";
import payment_completed from "public/images/payment_complete.gif";
import slot_active from "public/images/slot_active.gif";
import order_cancel from "public/images/order_cancel.png";
import order_complete from "public/images/order_complete.gif";

const formatDate = "HH:ss DD/MM/YYYY";

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
const ServiceCustomer = () => {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [billDetail, setBillDetail] = useState({});

  const handleGetOrders = async () => {
    setLoading(true);
    const username = Cookies.get("username");
    let dataGetOrder = {
      keyword: username,
      pageSize: 20,
      pageNumber: 0,
      status: 2,
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

  const totalPriceService = () => {
    return billDetail?.services?.reduce((total, cur) => {
      return (total += cur?.servicePrice?.price);
    }, 0);
  };
  const totalTimeService = () => {
    return billDetail?.services?.reduce((total, cur) => {
      return (total += cur?.estimateTime);
    }, 0);
  };

  useEffect(() => {
    handleGetOrders();
  }, []);

  const handleImage = (status) => {
    switch (status) {
      case -100:
        return <Image height={170} width={170} src={order_cancel} />;
      case 10:
        return <Image height={170} width={170} src={order_complete} />;
      case 2:
        return <Image height={170} width={170} src={slot_active} />;
      default:
        break;
    }
  };

  return (
    <>
      <List
        itemLayout="vertical"
        size="large"
        pagination={{
          onChange: (page) => {
            console.log(page);
          },
          pageSize: 5,
        }}
        dataSource={orders}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            onClick={() => {
              setBillDetail(item);
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
            }}
          >
            <List.Item.Meta
              title={
                <Typography.Title style={{color:"#1C1266"}} level={4}>#{item.orderCode}</Typography.Title>
              }
              description={
                <>
                  <Row gutter={16}>
                    <Col span={8}>
                      <DescriptionItem title="Mã xe" content={item.carCode} />
                    </Col>
                    <Col span={8}>
                      <DescriptionItem title="Biển số" content={item.carName} />
                    </Col>
                    <Col span={8}>
                      <DescriptionItem
                        title="Tên xe"
                        content={item.carLicensePlate}
                      />
                    </Col>
                  </Row>
                </>
              }
            />
            <Row gutter={16}>
              <Col span={8}>
                <DescriptionItem title="Trạng thái" content={item.statusName} />
              </Col>
              <Col span={8}>
                <DescriptionItem
                  title="Tổng tiền dịch vụ"
                  content={formatMoney(item.totalServicePrice)}
                />
              </Col>
              <Col span={8}>
                <DescriptionItem
                  title="Thời gian xử lý ước tính"
                  content={item.totalEstimateTime + " phút"}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <DescriptionItem
                  title="Thời gian tiếp nhận yêu cầu"
                  content={moment(item.createDate).format(formatDate)}
                />
              </Col>
              <Col span={8}>
                <DescriptionItem
                  title="Thời gian bắt đầu xử lý"
                  content={moment(item.carExecutingDate).format(formatDate)}
                />
              </Col>
              <Col span={8}>
                <DescriptionItem
                  title="Thời gian hoàn thành dự kiến"
                  content={moment(item?.orderStartExecuting)
                    .add(totalTimeService(), "m")
                    .format(formatDate)}
                />
              </Col>
            </Row>
          </List.Item>
        )}
      />

      <Loading loading={loading} />
    </>
  );
};

export default ServiceCustomer;