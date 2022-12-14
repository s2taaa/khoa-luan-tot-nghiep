import { Table, Tag, Button, Input, Row, Col, Space, Select, Form } from "antd";
import React, { useState, useEffect, useRef } from "react";
import { SearchOutlined, ClearOutlined, PlusOutlined } from "@ant-design/icons";
import { getServices, searchService } from "pages/api/serviceAPI";
import { getCategories } from "pages/api/categoryAPI";
import ModalAddService from "components/Modal/ModalAddService";
import { useRouter } from "next/router";
import ServiceDetail from "../ServiceDetail";
import Loading from "components/Loading";
import Highlighter from "react-highlight-words";
import { formatMoney } from "utils/format";

function ServiceTable({}) {
  const [form] = Form.useForm();
  const [services, setServices] = useState([]);
  const [modalService, setModalService] = useState(false);
  const router = useRouter();
  const { serviceId } = router.query;
  const [loading, setLoading] = useState(false);
  const [listCategory, setListCategory] = useState();
  const [type, setType] = useState();
  const [categoryId, setCategoryId] = useState();
  // search
  const [searchText, setSearchText] = useState("");
  const [searchGlobal, setSearchGlobal] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const handleGetServices = async () => {
    setLoading(true);
    let body = {
      key: "",
      categoryId: form.getFieldValue("categoryId"),
      type: form.getFieldValue("type"),
    };
    try {
      const response = await searchService(body);
      setServices(response.data.Data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const fetchCategoryServices = async () => {
    setLoading(true);
    try {
      const response = await getCategories();
      setListCategory(response.data.Data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetServices();
  }, [serviceId]);

  useEffect(() => {
    fetchCategoryServices();
  }, []);

  const handleSuccessCreateService = (data) => {
    handleGetServices();
    fetchCategoryServices();
  };

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
      render: (text, record) => (
        <a
          onClick={() => {
            router.push(`/admin?serviceId=${record.id}`);
          }}
          style={{ color: "blue", textDecorationLine: "underline" }}
        >
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
          String(record.type).toLowerCase().includes(value.toLowerCase())
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
      title: "Th???i gian x??? l??",
      key: "estimateTime",
      dataIndex: "estimateTime",
      sorter: {
        compare: (a, b) => a.estimateTime - b.estimateTime,
        multiple: 2,
      },
      render: (estimateTime) => {
        return <div>{estimateTime} ph??t</div>;
      },
    },
    // {
    //   title: "Gi??",
    //   dataIndex: "servicePrice",
    //   key: "servicePrice",
    //   render: (servicePrice) => {
    //     return (
    //       <>
    //         {servicePrice === null ? (
    //           <Tag color={"red"}>{"Ch??a c?? gi??"}</Tag>
    //         ) : (
    //           <div>{formatMoney(servicePrice.price)}</div>
    //         )}
    //       </>
    //     );
    //   },
    // },
    {
      title: "Lo???i d???ch v???",
      dataIndex: "type",
      key: "type",
      render: (text, record) => {
        return handleTypeService(record.type);
      },
    },
    {
      title: "Danh m???c d???ch v???",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (categoryName) => {
        return <Tag color={"purple"}>{categoryName}</Tag>;
      },
    },
    {
      title: "Tr???ng th??i",
      key: "status",
      dataIndex: "status",
      render: (status) => {
        return (
          <>
            {status === 100 ? (
              <Tag color={"green"}>{"??ang ho???t ?????ng"}</Tag>
            ) : (
              <Tag color={"red"}>{"Ng??ng ho???t ?????ng"}</Tag>
            )}
          </>
        );
      },
    },
  ];

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

  console.log(services);

  return (
    <>
      {serviceId ? (
        <ServiceDetail
          serviceId={serviceId}
          onUpdateService={handleGetServices}
        />
      ) : (
        <div>
          <Form form={form}>
            <Row gutter={16} style={{ margin: "5px" }}>
              <Col span={8} style={{ marginRight: "10px" }}>
                <Input
                  placeholder="T??m ki???m"
                  onChange={(e) => setSearchGlobal(e.target.value)}
                  // onSearch={(value) => setSearchGlobal(value)}

                  value={searchGlobal}
                />
              </Col>
              <Col span={4}>
                <Form.Item name="type">
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Lo???i d???ch v???"
                  >
                    <Option value="NORMAL">Th??ng th?????ng</Option>
                    <Option value="NEW">M???i</Option>
                    <Option value="LIKE">Y??u th??ch</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="categoryId">
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Danh m???c"
                  >
                    {listCategory?.map((item) => {
                      return (
                        <Select.Option key={item.id} value={item.id}>
                          {item.name}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={1}>
                <Button
                  onClick={() => {
                    setSearchGlobal("");
                    form.resetFields();
                    handleGetServices();
                  }}
                  icon={<ClearOutlined />}
                ></Button>
              </Col>
              <Col span={2}>
                <Button
                  onClick={() => {
                    handleGetServices();
                  }}
                >
                  T??m ki???m
                </Button>
              </Col>
              <Col span={3}>
                <Button
                  style={{ float: "right" }}
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setModalService(true)}
                >
                  Th??m d???ch v???
                </Button>
              </Col>
            </Row>
          </Form>
          <Table
            // onChange={handleSearch}
            columns={columns}
            dataSource={services}
            bordered
            pagination={{
              pageSize: 20,
            }}
            scroll={{
              y: 425,
            }}
            // onRow={(record, rowIndex) => {
            //   return {
            //     onClick: (event) => {
            //       router.push(`/admin?serviceId=${record.id}`);
            //     },
            //   };
            // }}
          />
        </div>
      )}
      <ModalAddService
        show={modalService}
        handleCancel={() => setModalService(false)}
        onSuccess={(data) => handleSuccessCreateService(data)}
      />
      <Loading loading={loading} />
    </>
  );
}

export default ServiceTable;
