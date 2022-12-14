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
  Popconfirm,
  Drawer,
} from "antd";
import { useRouter } from "next/router";
import { openNotification, openNotificationWarning } from "utils/notification";
import { getPricesByHeader } from "pages/api/priceAPI";
import {
  deletePriceHeader,
  getPriceHeaderById,
  updatePriceHeader,
  activePriceHeader,
  inActivePriceHeader,
} from "pages/api/PriceHeaderAPI";
import { validateMessages } from "utils/messageForm";
import ModalQuestion from "components/Modal/ModalQuestion";
import ModalAddPrice from "components/Modal/ModalAddPrice";
import moment from "moment";
import Loading from "components/Loading";
import {
  ClearOutlined,
  SearchOutlined,
  PlusOutlined,
  SaveOutlined,
  EditFilled,
  EditOutlined,
  DeleteOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { formatMoney } from "utils/format";
import DrawerPriceDetail from "components/Drawer/DrawerPriceDetail";
const formatDate = "DD/MM/YYYY";
const PriceHeaderDetail = ({ priceHeaderId }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { TextArea } = Input;
  const [priceHeaderDetail, setPriceHeaderDetail] = useState({});
  const [prices, setPrices] = useState([]);
  const [modalQuestion, setModalQuestion] = useState(false);
  const [modalPrice, setModalPrice] = useState(false);

  const [modalPriceDetail, setModalPriceDetail] = useState(false);
  const [priceSelected, setPriceSelected] = useState({});

  const [loading, setLoading] = useState(false);

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

  const fetchPrice = async () => {
    setLoading(true);
    try {
      const response = await getPricesByHeader(priceHeaderId);
      console.log(response.data.Data);
      setPrices(response.data.Data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const fetchPriceHeaderDetail = async () => {
    setLoading(true);
    try {
      const response = await getPriceHeaderById(priceHeaderId);
      setPriceHeaderDetail(response.data.Data);
      form.setFieldsValue({
        name: response.data.Data.name,
        description: response.data.Data.description,
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
    if (priceHeaderId) {
      fetchPriceHeaderDetail();
      fetchPrice();
    }
  }, [priceHeaderId]);

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
      render: (text, record) => (
        <a    onClick={() => {
          setPriceSelected(record);
          setModalPriceDetail(true);
        }}
        style={{ color: "blue", textDecorationLine: "underline" }}>
          {record?.serviceCode}
        </a>
      ),
      filteredValue: [searchGlobal],
      onFilter: (value, record) => {
        return (
          String(record.serviceCode)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.name).toLowerCase().includes(value.toLowerCase()) ||
          String(record.statusName)
            .toLowerCase()
            .includes(value.toLowerCase()) ||
          String(record.price).toLowerCase().includes(value.toLowerCase())
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
      title: "Gi?? d???ch v???",
      dataIndex: "price",
      key: "price",
      ...getColumnSearchProps("price"),
      render: (price) => {
        return <div>{formatMoney(price)}</div>;
      },
    },
    // {
    //   title: "Tr???ng th??i",
    //   dataIndex: "status",
    //   key: "status",
    //   render: (status) => {
    //     return (
    //       <>
    //         {status === 100 ? (
    //           <Tag color={"green"}>??ang ho???t ?????ng</Tag>
    //         ) : (
    //           <Tag color={"red"}>Kh??ng ho???t ?????ng</Tag>
    //         )}
    //       </>
    //     );
    //   },
    // },
    // {
    //   dataIndex: "action",
    //   key: "action",
    //   width: 90,
    //   render: (text, record) => {
    //     return (
    //       <>
    //         <EditOutlined
    //           onClick={() => {
    //             setPriceSelected(record);
    //             setModalPriceDetail(true);
    //           }}
    //           style={{ fontSize: "20px", color: "blue" }}
    //         />
    //       </>
    //     );
    //   },
    // },
  ];

  const onFinish = async (values) => {
    setLoading(true);
    let body = {
      name: values.name,
      toDate: values.toDate,
    };
    if (moment().isBefore(values.fromDate)) {
      body.fromDate = values.fromDate;
    }
    try {
      const res = await updatePriceHeader(body, priceHeaderDetail.id);
      openNotification("Th??nh c??ng", "C???p nh???t b???ng gi?? th??nh c??ng!");
      fetchPrice();
      setLoading(false);
    } catch (error) {
      if (error?.response?.data?.message) {
        openNotificationWarning(error?.response?.data?.message);
      } else {
        openNotificationWarning("C???p nh???t b???ng gi?? th???t b???i");
      }
      setLoading(false);
    }
  };

  const handleSuccessCreatePrice = () => {
    fetchPrice();
  };

  const handleUpdatePrice = () => {
    fetchPrice();
  };
  const handleActivePrice = async () => {
    setLoading(true);
    if (prices.length === 0) {
      openNotificationWarning("kh??ng c?? gi?? d???ch v??? n??o trong b???ng gi??");
      return;
    }
    try {
      const res = await activePriceHeader(priceHeaderId);
      openNotification("Th??nh c??ng", "K??ch ho???t b???ng gi?? th??nh c??ng!");
      fetchPriceHeaderDetail();
      fetchPrice();
      setLoading(false);
    } catch (error) {
      if (error?.response?.data?.message) {
        openNotificationWarning(error?.response?.data?.message);
      } else {
        openNotificationWarning("Th???t b???i! C?? l???i x???y ra");
      }
      setLoading(false);
    }
  };

  const handleInActivePrice = async () => {
    setLoading(true);
    try {
      const res = await inActivePriceHeader(priceHeaderId);
      openNotification("Th??nh c??ng", "V?? hi???u b???ng gi?? th??nh c??ng!");
      fetchPriceHeaderDetail();
      fetchPrice();
      setLoading(false);
    } catch (error) {
      if (error?.response?.data?.message) {
        openNotificationWarning(error?.response?.data?.message);
      } else {
        openNotificationWarning("Th???t b???i! C?? l???i x???y ra");
      }
      setLoading(false);
    }
  };

  const handleDeletePrice = async () => {
    setLoading(true);
    try {
      const res = await deletePriceHeader(priceHeaderId);
      openNotification("Th??nh c??ng", "X??a b???ng gi?? th??nh c??ng!");
      router.push("/admin");
      setLoading(false);
    } catch (error) {
      if (error?.response?.data?.message) {
        openNotificationWarning(error?.response?.data?.message);
      } else {
        openNotificationWarning("Th???t b???i! C?? l???i x???y ra");
      }
      setLoading(false);
    }
  };

  return (
    <>
      <Row>
        <Col span={24}>
          <Form
            form={form}
            layout="vertical"
            autoComplete="off"
            validateMessages={validateMessages}
          >
            <Row gutter={[16]}>
              <Col span={12}>
                <Form.Item
                  label="T??n b???ng gi??"
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
              <Col span={4}>
                <Form.Item
                  label="Ng??y b???t ?????u"
                  name="fromDate"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <DatePicker
                    disabled={moment().isAfter(priceHeaderDetail?.fromDate)}
                    disabledDate={(d) =>
                      d.isBefore(moment()) ||
                      !d ||
                      (form.getFieldValue("toDate") &&
                        d.isAfter(form.getFieldValue("toDate")))
                    }
                    format={formatDate}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Ng??y k???t th??c"
                  name="toDate"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <DatePicker
                    disabled={moment().isAfter(priceHeaderDetail?.toDate)}
                    disabledDate={(d) =>
                      !d ||
                      d.isSameOrBefore(form.getFieldValue("fromDate")) ||
                      d.isSameOrBefore(moment())
                    }
                    format={formatDate}
                  />
                </Form.Item>
              </Col>
              {/* <Col span={4}>
                <Form.Item
                  label="Tr???ng th??i"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  name="status"
                >
                  <Select>
                    <Select.Option value="ACTIVE">Ho???t ?????ng</Select.Option>
                    <Select.Option value="INACTIVE">
                      Kh??ng ho???t ?????ng
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col> */}
              <Col span={4}>
                <Form.Item
                  label="Tr???ng th??i"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                  name="status"
                >
                  {priceHeaderDetail?.status === "ACTIVE" ? (
                    <Popconfirm
                      title="B???n c?? ch???c ch???n v?? hi???u b???ng gi?? n??y?"
                      placement="topLeft"
                      okText="????ng ??"
                      cancelText="H???y"
                      onConfirm={() => {
                        handleInActivePrice();
                      }}
                    >
                      <Button
                        style={{
                          backgroundColor: "#22C55E",
                          width: "100%",
                          color: "white",
                        }}
                      >
                        Ho???t d???ng
                      </Button>
                    </Popconfirm>
                  ) : (
                    <Popconfirm
                      title="B???n c?? ch???c ch???n k??ch ho???t b???ng gi?? n??y?"
                      placement="topLeft"
                      okText="????ng ??"
                      cancelText="H???y"
                      onConfirm={() => {
                        handleActivePrice();
                      }}
                    >
                      <Button style={{ width: "100%" }} type="danger">
                        Kh??ng ho???t d???ng
                      </Button>
                    </Popconfirm>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row className="PullRight">
              <div
                style={{ bottom: "0", right: "20px", margin: "10px" }}
                className="service-action"
              >
                <div>
                  {moment().isBefore(priceHeaderDetail?.fromDate) && (
                    <Popconfirm
                      title="B???n c?? ch???c ch???n x??a b???ng gi?? n??y?"
                      placement="topLeft"
                      okText="X??a"
                      cancelText="H???y"
                      onConfirm={() => {
                        handleDeletePrice(priceHeaderDetail.id);
                      }}
                    >
                      <Button
                        style={{ marginRight: "20px" }}
                        icon={<DeleteOutlined />}
                        type="danger"
                      >
                        X??a b???ng gi??
                      </Button>
                    </Popconfirm>
                  )}

                  <Popconfirm
                    title="C???p nh???t?"
                    placement="topLeft"
                    okText="X??c nh???n"
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
                    <Button icon={<SaveOutlined />} type="primary">
                      C???p nh???t
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            </Row>
          </Form>
        </Col>
        <Col span={24}>
          <Table
            size="small"
            bordered
            title={() => (
              <>
                <Row>
                  <Col span={8} style={{ marginRight: "10px" }}>
                    <Input.Search
                      placeholder="T??m ki???m m??/t??n d???ch v???"
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
                  <Col span={11}>
                    <Button
                      style={{ float: "right" }}
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setModalPrice(true)}
                    >
                      {" "}
                      Th??m gi??
                    </Button>
                  </Col>
                </Row>
              </>
            )}
            columns={columns}
            dataSource={prices}
            scroll={{
              y: 320,
            }}
            pagination={false}
            rowKey="id"
          />
        </Col>
      </Row>
      <DrawerPriceDetail
        show={modalPriceDetail}
        handleCancel={() => setModalPriceDetail(false)}
        onUpdate={handleUpdatePrice}
        price={priceSelected}
        canUpdatePrice={moment().isAfter(form.getFieldValue("fromDate"))}
      />

      <ModalAddPrice
        show={modalPrice}
        handleCancel={() => setModalPrice(false)}
        onSuccess={(data) => handleSuccessCreatePrice(data)}
        priceHeaderId={priceHeaderId}
      />
      <Loading show={loading} />
    </>
  );
};

export default PriceHeaderDetail;
