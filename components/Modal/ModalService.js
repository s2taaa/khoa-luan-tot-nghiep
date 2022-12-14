import {
  Table,
  Tag,
  Button,
  Input,
  Row,
  Col,
  Space,
  Select,
  Steps,
  Drawer,
  List,
  Divider,
  Avatar,
  Typography,
} from "antd";
import { getAllPromotionUseAbleByServiceIds } from "pages/api/promotionDetail";
import React, { useState, useEffect, useRef } from "react";
import { SearchOutlined, ClearOutlined, TagsOutlined } from "@ant-design/icons";
import { getServices ,searchService } from "pages/api/serviceAPI";
import { useRouter } from "next/router";
import Loading from "components/Loading";
import Highlighter from "react-highlight-words";
import { formatMoney } from "utils/format";
import moment from "moment";
import DrawerPromotionOrder from "components/Drawer/DrawerPromotionOrder";

const { Step } = Steps;
const { Title } = Typography;

function ServiceOrder({ onSelected, selectedService }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const [promotionDetails, setPromotionDetails] = useState([]);
  const [showSelectPromotion, setShowSelectPromotion] = useState(false);
  // search
  const [searchText, setSearchText] = useState("");
  const [searchGlobal, setSearchGlobal] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [filteredInfo, setFilteredInfo] = useState({});

  const [totalAmountToParent, setTotalAmountToParent] = useState(0);
  const [totalAmountPromotion, setTotalAmountPromotion] = useState(0);

  const handleGetServices = async () => {
    setLoading(true);
    let dataGetOrder = {
      status: 100,
    };
    try {
      const response = await searchService(dataGetOrder);
      // const response = await getServices();
      setServices(response.data.Data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const handleFetchPromotion = async () => {
    try {
      const res = await getAllPromotionUseAbleByServiceIds(selectedRowKeys);
      setPromotionDetails(res.data.Data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetServices();
  }, []);

  useEffect(() => {
    handleFetchPromotion();
  }, [selectedRows]);

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
          placeholder={`T??m ${dataIndex}`}
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
            T??m
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
            X??a b??? l???c
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
      title: "M?? d???ch v???",
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
      title: "T??n d???ch v???",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Lo???i d???ch v???",
      dataIndex: "type",
      key: "type",
      render: (text, record) => {
        return handleTypeService(record.type);
      },
    },
    {
      title: "Th???i gian x??? l??",
      dataIndex: "estimateTime",
      key: "estimateTime",
      render: (estimateTime) => {
        return <div>{estimateTime} ph??t</div>;
      },
    },
    {
      title: "Gi??",
      dataIndex: "servicePrice",
      key: "servicePrice",
      render: (servicePrice) => {
        return (
          <>
            {servicePrice === null ? (
              <Tag color={"red"}>{"Ch??a c?? gi??"}</Tag>
            ) : (
              <div>{formatMoney(servicePrice.price)}</div>
            )}
          </>
        );
      },
    },
  ];
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
      onSelected(selectedRowKeys);
      selectedService(selectedRows);
    },
  };
  const totalPriceService = () => {
    return selectedRows.reduce((total, cur) => {
      return (total += cur.servicePrice.price);
    }, 0);
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

  const handleTypeService = (value) => {
    switch (value) {
      case "NORMAL":
        return <Tag color={"blue"}>{"Th??ng th?????ng"}</Tag>;
      case "NEW":
        return <Tag color={"green"}>{"M???i"}</Tag>;
      case "LIKE":
        return <Tag color={"pink"}>{"Y??u th??ch"}</Tag>;
      default:
        break;
    }
  };

  return (
    <>
      <div>
        <Row style={{ margin: "10px 0px" }}>
          <Col span={8} style={{ marginRight: "10px" }}>
            <Input.Search
              placeholder="T??m ki???m"
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
              X??a b??? l???c
            </Button>
          </Col>
        </Row>
        <Table
          rowKey={(record) => record.id}
          columns={columns}
          dataSource={services}
          bordered
          rowSelection={rowSelection}
          pagination={{
            pageSize: 30,
          }}
          scroll={{
            y: 170,
          }}
          size="small"
          footer={() => {
            return (
              <>
                <Row gutter={[16]}>
                  <Col style={{ marginRight: "40px" }} span={10}></Col>
                  <Col style={{ marginRight: "25px" }} span={4}>
                    T???ng ti???n d???ch v???
                  </Col>
                  <Col style={{ marginRight: "15px" }} span={4}>
                    {totalTimeService() || 0} ph??t
                  </Col>
                  <Col span={4}>{formatMoney(totalPriceService() || 0)}</Col>
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
                      Khuy???n m??i ???????c ??p d???ng
                    </Button>
                  </Col>
                  <Col style={{ marginRight: "25px" }} span={4}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#677E31",
                      }}
                    >
                      T???ng ti???n khuy???n m??i
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
                      T???ng thanh to??n (t???m t??nh)
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
      </div>
      <DrawerPromotionOrder
        show={showSelectPromotion}
        promotionDetails={promotionDetails}
        handleCancel={() => setShowSelectPromotion(false)}
      />

      <Loading loading={loading} />
    </>
  );
}

export default ServiceOrder;
