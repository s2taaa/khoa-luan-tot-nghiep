import { Table, Tag, Button, Input, Row, Col, Modal,Drawer, Space,List,Avatar,Typography  } from "antd";
import React, { useState, useEffect, useRef } from "react";
import { SearchOutlined, ClearOutlined,TagsOutlined } from "@ant-design/icons";
import { getServices } from "pages/api/serviceAPI";
import { useRouter } from "next/router";
import Loading from "components/Loading";
import Highlighter from "react-highlight-words";
import { formatMoney } from "utils/format";
import { updateOrder } from "pages/api/orderAPI";
import moment from "moment";
import { openNotification } from "utils/notification";
import { getAllPromotionUseAbleByServiceIds } from "pages/api/promotionDetail";
const {Title} = Typography;

function UpDateServiceOrder({ order, show, onSuccess, handleCancel }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  // search
  const [searchText, setSearchText] = useState("");
  const [searchGlobal, setSearchGlobal] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const [promotionDetails, setPromotionDetails] = useState([]);
  const [showSelectPromotion, setShowSelectPromotion] = useState(false);

  const handleGetServices = async () => {
    setLoading(true);
    try {
      const response = await getServices();
      setServices(response.data.Data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const handleFetchPromotion = async () => {
    try {
      const res = await getAllPromotionUseAbleByServiceIds(
        selectedRowKeys
      );
      setPromotionDetails(res.data.Data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetServices();
    if (order) {
      setSelectedRowKeys(order?.services.map((item) => item.id));
      setSelectedRows(order?.services);
     
    }
  }, [order]);

  console.log(promotionDetails)
  useEffect(() => {
    handleFetchPromotion();
  }, [selectedRowKeys]);

  const handleSearch = (selectedKeys, dataIndex) => {
    setSearchText(selectedKeys[0]);
    setSearchGlobal(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = () => {
    setSearchText("");
    setSearchGlobal("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys }) => (
      <div
        style={{
          padding: 8,
        }}
      >
        <Input
          ref={searchInput}
          placeholder={`Tìm ${dataIndex}`}
          value={selectedKeys[0]}
          onSearch={(value) => setSearchText(value)}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => {
              handleReset();
            }}
            size="small"
            style={{
              width: 90,
            }}
          >
            Xóa bộ lọc
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1890ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      width: 70,
      render: (text, record, dataIndex) => {
        return <div>{dataIndex + 1}</div>;
      },
    },
    {
      title: "Mã dịch vụ",
      dataIndex: "serviceCode",
      key: "serviceCode",
      render: (serviceCode) => <a style={{ color: "blue" }}>{serviceCode}</a>,
      filteredValue: [searchGlobal],
      onFilter: (value, record) => {
        return (
          String(record.serviceCode)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.name).toLowerCase().includes(value.toLowerCase()) ||
          String(record.type).toLowerCase().includes(value.toLowerCase()) ||
          String(record.status).toLowerCase().includes(value.toLowerCase()) ||
          String(record.servicePrice?.price)
            .toLowerCase()
            .includes(value.toLowerCase())
        );
      },
    },
    {
      title: "Tên dịch vụ",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Loại dịch vụ",
      dataIndex: "type",
      key: "type",
      ...getColumnSearchProps("type"),
    },
    {
      title: "Thời gian xử lí",
      dataIndex: "estimateTime",
      key: "estimateTime",
      render: (estimateTime) => {
        return <div>{estimateTime} phút</div>;
      },
    },
    {
      title: "Giá",
      dataIndex: "servicePrice",
      key: "servicePrice",
      render: (servicePrice) => {
        return (
          <>
            {servicePrice === null ? (
              <Tag color={"red"}>{"Chưa có giá"}</Tag>
            ) : (
              <div>{formatMoney(servicePrice.price)}</div>
            )}
          </>
        );
      },
    },
  ];
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
    },
  };
  console.log("rowSelection", rowSelection);
  const totalPriceService = () => {
    return selectedRows.reduce((total, cur) => {
      return (total += cur.servicePrice.price);
    }, 0);
  };

  const onFinish = async () => {
    setLoading(true);
    let dataUpdate = {
      serviceIds: selectedRowKeys,
    };
    try {
      const res = await updateOrder(order.id, dataUpdate);
      openNotification("Thành công", "cập nhật yêu cầu thành công");
      onSuccess();
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const totalTimeService = () => {
    return selectedRows.reduce((total, cur) => {
      return (total += cur.estimateTime);
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
        if (promotion.type === "MONEY") {
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

  return (
    <>
      <Modal
        title="Danh sách dịch vụ"
        visible={show}
        onCancel={handleCancel}
        width={1200}
        okText="Xác nhận"
        cancelText="Hủy bỏ"
        onOk={() => {
          onFinish();
        }}
      >
        <Row style={{ margin: "10px 0px" }}>
          <Col span={8} style={{ marginRight: "10px" }}>
            <Input.Search
              placeholder="Tìm kiếm"
              onChange={(e) => setSearchGlobal(e.target.value)}
              onSearch={(value) => setSearchGlobal(value)}
              value={searchGlobal}
            />
          </Col>
          <Col span={4}>
            <Button
              onClick={() => setSearchGlobal("")}
              icon={<ClearOutlined />}
            >
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
        <Table
          rowKey={(record) => record.id}
          onChange={handleSearch}
          columns={columns}
          dataSource={services}
          bordered
          rowSelection={rowSelection}
          pagination={{
            pageSize: 20,
          }}
          scroll={{
            y: 200,
          }}
          size="small"
          footer={() => {
            return (
              <>
                <Row gutter={[16, 16]}>
                  <Col style={{ marginRight: "40px" }} span={10}></Col>
                  <Col style={{ marginRight: "25px" }} span={4}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#E34262",
                      }}
                    >
                      Tổng tiền dịch vụ
                    </span>
                  </Col>
                  <Col style={{ marginRight: "15px" }} span={4}>
                    {totalTimeService() || 0} phút
                  </Col>
                  <Col span={4}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#E34262",
                      }}
                    >
                      {formatMoney(totalPriceService() || 0)}
                    </span>
                  </Col>
                  <Col style={{ marginRight: "40px" }} span={10}>
                    <Button
                      icon={<TagsOutlined />}
                      type="ghost"
                      style={{
                        backgroundColor: "#B6D433",
                        color: "white",
                      }}
                      onClick={() => setShowSelectPromotion(true)}
                    >
                      Danh sách khuyến mãi
                    </Button>
                  </Col>
                  <Col style={{ marginRight: "25px" }} span={4}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#677E31",
                      }}
                    >
                      Tổng tiền khuyến mãi
                    </span>
                  </Col>
                  <Col style={{ marginRight: "15px" }} span={4}></Col>

                  <Col span={4}>
                    {" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#677E31",
                      }}
                    >
                      {formatMoney(totalPromotionAmount() || 0)}
                    </span>
                  </Col>
                  <Col style={{ marginRight: "40px" }} span={10}></Col>
                  <Col style={{ marginRight: "25px" }} span={4}>
                    <span style={{ color: "red", fontWeight: "bold" }}>
                      Tổng thanh toán (tạm tính)
                    </span>
                  </Col>
                  <Col style={{ marginRight: "15px" }} span={4}></Col>

                  <Col span={4}>
                    {" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "red",
                      }}
                    >
                      {formatMoney(finalTotalPrice() || 0)}
                    </span>
                  </Col>
                </Row>
              </>
            );
          }}
        />
      </Modal>
      <Drawer
        title="Danh sách khuyến mãi được áp dụng"
        placement="right"
        onClose={() => setShowSelectPromotion(false)}
        visible={showSelectPromotion}
        width={700}
      >
        <>
          <List
            dataSource={promotionDetails}
            itemLayout="vertical"
            size="large"
            renderItem={(item) => (
              <Row gutter={16}>
                <Col
                  style={{
                    border: "solid gray 1px",
                    borderRadius: "5px",
                    margin: "10px",
                  }}
                  span={24}
                >
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={{
                            xs: 24,
                            sm: 32,
                            md: 40,
                            lg: 64,
                            xl: 80,
                            xxl: 100,
                          }}
                          icon={<TagsOutlined />}
                        />
                      }
                      title={<a>{item.name}</a>}
                      description={<Title level={5}>{item.description}</Title>}
                    />
                    <Row>
                      {item.type === "PERCENTAGE" ? (
                        <Col span={24}>
                          {" "}
                          <span style={{ color: "red", fontWeight: "bold" }}>
                            Giảm {item.amount}%{" "}
                          </span>
                        </Col>
                      ) : (
                        <Col span={24}>
                          <span style={{ color: "red", fontWeight: "bold" }}>
                            Giảm {formatMoney(item.amount || 0)}{" "}
                          </span>
                        </Col>
                      )}
                      <Col span={12}>
                        <span style={{ fontWeight: "bold" }}>
                          Số tiền đơn hàng tối thiểu:{" "}
                        </span>
                        {formatMoney(item.minimumSpend || 0)}
                      </Col>
                      {item.type === "PERCENTAGE" && (
                        <Col span={12}>
                          <span style={{ fontWeight: "bold" }}>
                            Giảm tối đa:{" "}
                          </span>
                          {formatMoney(item.maximumDiscount || 0)}
                        </Col>
                      )}
                      <Col span={12}>
                        <span style={{ fontWeight: "bold" }}>
                          Ngày bắt đầu:{" "}
                        </span>
                        {moment(item.fromDate).format("DD/MM/YYYY")}
                      </Col>
                      <Col span={12}>
                        <span style={{ fontWeight: "bold" }}>Kết thúc: </span>
                        {moment(item.toDate).format("DD/MM/YYYY")}
                      </Col>
                    </Row>
                  </List.Item>
                </Col>
              </Row>
            )}
          />
        </>
      </Drawer>
      <Loading loading={loading} />
    </>
  );
}

export default UpDateServiceOrder;