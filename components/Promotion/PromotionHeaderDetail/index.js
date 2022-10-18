import React, { useEffect, useState, useRef } from "react";
import {
  Col,
  Row,
  Space,
  Button,
  Tag,
  Form,
  Select,
  Input,
  DatePicker,
  Table,
} from "antd";
import { useRouter } from "next/router";
import { openNotification } from "utils/notification";

import { getPromotionLineByHeaderId } from "pages/api/promotionLineAPI";
import {
  getPromotionHeaderByCode,
  getPromotionHeaderById,
} from "pages/api/promotionHeaderAPI";

import { validateMessages } from "utils/messageForm";
import ModalQuestion from "components/Modal/ModalQuestion";
import ModalAddPromotionLine from "components/Modal/ModalAddPromotionLine";
import moment from "moment";
import Loading from "components/Loading";
import { ClearOutlined, SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { EditOutlined } from "@ant-design/icons";
import { formatMoney } from "utils/format";
const formatDate = "DD/MM/YYYY";
import DrawerPromorionDetail from "components/Drawer/DrawerPromotionDetail";

const PromotionHeaderDetail = ({
  promotionHeaderId,
  onUpdatePromotionHeader,
}) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { TextArea } = Input;
  const [promotionHeaderDetail, setPromotionHeaderDetail] = useState({});
  const [promotionLine, setPromotionLine] = useState([]);
  const [modalQuestion, setModalQuestion] = useState(false);
  const [modalPrice, setModalPrice] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showDrawer, setShowDrawer] = useState(false);
  const [promotionLineSelected, setPromotionLineSelected] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [searchGlobal, setSearchGlobal] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

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

  const fetchPromotionLine = async () => {
    setLoading(true);
    try {
      const response = await getPromotionLineByHeaderId(promotionHeaderId);
      console.log(response.data.Data);
      setPromotionLine(response.data.Data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      openNotification(error.response.data.message[0]);
    }
  };

  const fetchPromotionHeaderDetail = async () => {
    setLoading(true);
    try {
      const response = await getPromotionHeaderById(promotionHeaderId);
      setPromotionHeaderDetail(response.data.Data);
      console.log(response.data.Data);
      form.setFieldsValue({
        name: response.data.Data.description,
        fromDate: moment(moment(response.data.Data.fromDate), formatDate),
        toDate: moment(moment(response.data.Data.toDate), formatDate),
        status: response.data.Data.status,
      });

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (promotionHeaderId) {
      fetchPromotionHeaderDetail();
      fetchPromotionLine();
    }
  }, [promotionHeaderId]);

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
      title: "Mã",
      dataIndex: "promotionLineCode",
      key: "promotionLineCode",
      filteredValue: [searchGlobal],
      onFilter: (value, record) => {
        return (
          String(record.promotionLineCode)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.description)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.status).toLowerCase().includes(value.toLowerCase())
        );
      },
    },
    {
      title: "Tên",
      dataIndex: "description",
      key: "description",
      ...getColumnSearchProps("description"),
    },
    {
      title: "Từ ngày",
      dataIndex: "fromDate",
      key: "fromDate",
      render: (text, record) => {
        return <div>{moment(record.fromDate).format(formatDate)}</div>;
      },
    },
    {
      title: "Đến ngày",
      dataIndex: "toDate",
      key: "toDate",
      render: (text, record) => {
        return <div>{moment(record.toDate).format(formatDate)}</div>;
      },
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (text,record) => {
        return handleType(record.type);
        
        
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        return (
          <div>
            {status === "ACTIVE" ? (
              <Tag color="green">Hoạt động</Tag>
            ) : (
              <Tag color="red">Không hoạt động</Tag>
            )}
          </div>
        );
      },
      ...getColumnSearchProps("status"),
    },
    {
      dataIndex: "action",
      key: "action",
      render: (text, record) => {
        return (
          <div>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setPromotionLineSelected(record.id);
                setShowDrawer(true);
              }}
            >
              Sửa
            </Button>
          </div>
        );
      },
    },
  ];

  const handleType = (value) => {
    switch (value) {
      case "MONEY":
        return <Tag color='blue'>Giảm tiền</Tag>;
      case "PERCENTAGE":
        return <Tag color='green'>Giảm theo %</Tag>;
      case "GIFT":
        return <Tag color='gold'>Tặng quà</Tag>;
      default:
    }
  };

  const onFinish = async (values) => {
    loading(true);
    let body = {
      id: promotionHeaderDetail.id,
      type: values.type,
      name: values.name,
      description: values.description,
      categoryId: values.categoryId,
      status: values.status,
    };
    try {
      const res = await updatePriceHeader(body, promotionHeaderDetail.id);
      openNotification("Cập nhật dịch vụ thành công!", "");
      onUpdatePromotionHeader();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      openNotification(error.response.data.message[0]);
    }
  };

  const handleSuccessCreatePromotionLine = () => {
    fetchPromotionLine();
  };

  return (
    <>
      <Button type="link" size="small" onClick={() => router.push("/admin")}>
        Trở lại
      </Button>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Form
            form={form}
            layout="vertical"
            autoComplete="off"
            validateMessages={validateMessages}
          >
            <Row gutter={[32, 8]}>
              <Col span={6}>
                <Form.Item
                  label="Tên chương trình"
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
              <Col span={6}>
                <Form.Item
                  label="Ngày bắt đầu"
                  name="fromDate"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <DatePicker format={formatDate} />
                  {/* <Input /> */}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Ngày kết thúc"
                  name="toDate"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <DatePicker />
                  {/* <Input /> */}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Trạng thái"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  name="status"
                >
                  <Select>
                    <Select.Option value="ACTIVE">Hoạt động</Select.Option>
                    <Select.Option value="INACTIVE">
                      Không hoạt động
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row className="PullRight">
              <div
                style={{ bottom: "0", right: "20px", margin: "10px" }}
                className="service-action"
              >
                <div style={{ marginRight: "20px" }}>
                  <Button
                    onClick={() => {
                      fetchPromotionHeaderDetail();
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
            </Row>
          </Form>
        </Col>
        <Col span={24}>
          <Table
            bordered
            title={() => (
              <>
                <Row>
                  <Col span={8} style={{ marginRight: "10px" }}>
                    <Input.Search
                      placeholder="Tìm kiếm mã/tên"
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
                  <Col span={11}>
                    <Button
                      style={{ float: "right" }}
                      type="primary"
                      onClick={() => setModalPrice(true)}
                    >
                      {" "}
                      Thêm dòng khuyến mãi
                    </Button>
                  </Col>
                </Row>
              </>
            )}
            columns={columns}
            dataSource={promotionLine}
            pagination={{
              pageSize: 10,
            }}
            scroll={{
              y: 280,
            }}
            rowKey="id"
          />
        </Col>
      </Row>
      <DrawerPromorionDetail
        show={showDrawer}
        handleCancel={() => setShowDrawer(false)}
        lineId={promotionLineSelected}
      />
      <ModalAddPromotionLine
        show={modalPrice}
        handleCancel={() => setModalPrice(false)}
        onSuccess={(data) => handleSuccessCreatePromotionLine(data)}
        promotionHeaderId={promotionHeaderId}
      />
      <Loading show={loading} />
    </>
  );
};

export default PromotionHeaderDetail;