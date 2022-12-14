import React, { useState, useEffect } from "react";
import {
  Breadcrumb,
  Col,
  Row,
  Select,
  Form,
  DatePicker,
  Button,
  Typography,
  Table,
  Cascader,
} from "antd";
import {
  ExportOutlined,
  HomeOutlined,
  FileExcelOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { getReport, getSaleReportByCustomer } from "pages/api/reportAPI";
import { getCustomers } from "pages/api/customerAPI";
import Loading from "components/Loading";
import { formatMoney } from "utils/format";
import { openNotification, openNotificationWarning } from "utils/notification";
const { RangePicker } = DatePicker;
import JsonData from "data/address-vn.json";

const dateFormat = "DD/MM/YYYY";

const SaleReportCustomer = () => {
  const [form] = Form.useForm();
  const [typeDate, setTypeDate] = useState("d");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataSaleReport, setDataSaleReport] = useState([]);

  const [addressData, setAddressData] = useState(JsonData);

  const [provinceSelected, setProvinceSelected] = useState("");
  const [districtSelected, setDistrictSelected] = useState("");
  const [wardSelected, setWardSelected] = useState("");
  const [provinceSelectedCode, setProvinceSelectedCode] = useState("");
  const [districtSelectedCode, setDistrictSelectedCode] = useState("");
  const [wardSelectedCode, setWardSelectedCode] = useState("");

  const handleFetchCustomer = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data.Data);
    } catch (error) {
      console.log(error);
    }
  };

  const onChangeTypeDate = (value) => {
    setTypeDate(value);
    handleDatePicker();
  };
  const handleDatePicker = () => {
    switch (typeDate) {
      case "d":
        return (
          <RangePicker
            disabledDate={(d) => !d || d.isAfter(moment())}
            format={dateFormat}
          />
        );
      case "m":
        return (
          <RangePicker
            disabledDate={(d) => !d || d.isAfter(moment())}
            picker="month"
          />
        );
      case "y":
        return (
          <RangePicker
            disabledDate={(d) => !d || d.isAfter(moment())}
            picker="year"
          />
        );
    }
  };

  const handleExportExcel = async (values) => {
    if (dataSaleReport.length === 0) {
      openNotificationWarning("Kh??ng c?? d??? li???u ????? xu???t file");
      return;
    }
    openNotification("??ang xu???t file excel");
    let fromDate;
    let toDate;
    if (values.typeDate === "d") {
      fromDate = values.rangerDate[0];
      toDate = values.rangerDate[1];
    }
    if (values.typeDate === "m") {
      fromDate = moment(values.rangerDate[0]).startOf("month").add(1, "days");
      toDate = moment(values.rangerDate[1]).endOf("month");
    }
    if (values.typeDate === "y") {
      fromDate = moment(values.rangerDate[0]).startOf("year").add(1, "days");
      toDate = moment(values.rangerDate[1]).endOf("year");
    }

    setLoading(true);
    let body = {
      reportType: 3,
      customerDistrict: districtSelectedCode,
      customerProvince: provinceSelectedCode,
      customerWard: wardSelectedCode,
      username: values.customer,
      fromDate: fromDate,
      toDate: toDate,
    };
    try {
      const response = await getReport(body);
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

  const onFinish = async (values) => {
    setLoading(true);
    let fromDate;
    let toDate;
    if (values.typeDate === "d") {
      fromDate = values.rangerDate[0];
      toDate = values.rangerDate[1];
    }
    if (values.typeDate === "m") {
      fromDate = moment(values.rangerDate[0]).startOf("month").add(1, "days");
      toDate = moment(values.rangerDate[1]).endOf("month");
    }
    if (values.typeDate === "y") {
      fromDate = moment(values.rangerDate[0]).startOf("year").add(1, "days");
      toDate = moment(values.rangerDate[1]).endOf("year");
    }

    let body = {
      customerDistrict: districtSelectedCode,
      customerProvince: provinceSelectedCode,
      customerWard: wardSelectedCode,
      customerId: values.customer,
      fromDate: fromDate,
      toDate: toDate,
    };
    try {
      const res = await getSaleReportByCustomer(body);
      console.log(res.data.Data);
      setDataSaleReport(res.data.Data);
      setLoading(false);
    } catch (error) {}
  };

  useEffect(() => {
    handleFetchCustomer();
  }, []);

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
      title: "M?? kh??ch h??ng",
      dataIndex: "customerCode",
      key: "customerCode",
    },
    {
      title: "T??n kh??ch h??ng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "?????a ch???",
      dataIndex: "address",
      key: "address",
    },

    {
      title: "T???nh/Th??nh",
      dataIndex: "province",
      key: "province",
    },
    {
      title: "Qu???n/Huy???n",
      dataIndex: "district",
      key: "district",
    },
    {
      title: "Ph?????ng/X??",
      dataIndex: "ward",
      key: "ward",
    },

    {
      title: "Nh??m kh??ch h??ng",
      dataIndex: "statusName",
      key: "statusName",
    },
    {
      title: "M?? xe",
      dataIndex: "carCode",
      key: "carCode",
    },
    {
      title: "Th????ng hi???u",
      dataIndex: "carBrand",
      key: "carBrand",
    },
    {
      title: "Bi???n s??? xe",
      dataIndex: "licensePlate",
      key: "licensePlate",
    },
    {
      title: "T???ng ti???n d???ch v???",
      dataIndex: "totalServicePrice",
      key: "totalServicePrice",
      render: (text, record) => {
        return <div>{formatMoney(record.totalServicePrice)}</div>;
      },
    },
    {
      title: "T???ng ti???n khuy???n m??i",
      dataIndex: "totalPromotionAmount",
      key: "totalPromotionAmount",
      render: (text, record) => {
        return <div>{formatMoney(record.totalPromotionAmount)}</div>;
      },
    },
    {
      title: "T???ng ti???n thanh to??n",
      dataIndex: "totalPaymentAmount",
      key: "totalPaymentAmount",
      render: (text, record) => {
        return <div>{formatMoney(record.totalPaymentAmount)}</div>;
      },
    },
  ];

  const onChange = (value, selectedOptions) => {
    console.log(value, selectedOptions);
    if (selectedOptions) {
      setProvinceSelected(selectedOptions[0]?.label);
      setDistrictSelected(selectedOptions[1]?.label);
      setWardSelected(selectedOptions[2]?.label);
      setProvinceSelectedCode(selectedOptions[0]?.value);
      setDistrictSelectedCode(selectedOptions[1]?.value);
      setWardSelectedCode(selectedOptions[2]?.value);
    }
  };
  const filter = (inputValue, path) =>
    path.some(
      (option) =>
        option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    );

  return (
    <>
      <Breadcrumb style={{ margin: "5px", alignItems: "center" }}>
        <Breadcrumb.Item href="/admin">
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item href="">
          B??o c??o doanh s??? theo kh??ch h??ng
        </Breadcrumb.Item>
      </Breadcrumb>

      <Form form={form} autoComplete="off">
        <Row style={{ padding: "0 5rem 0 5rem" }} gutter={[16]}>
          <Col span={24}>
            <Typography.Title level={2} className="content-center">
              B??o c??o doanh s??? theo kh??ch h??ng
            </Typography.Title>
          </Col>

          <Col span={3}>
            <Form.Item
              rules={[
                {
                  required: true,
                },
              ]}
              name="typeDate"
              initialValue="d"
            >
              <Select
                onChange={onChangeTypeDate}
                value={typeDate}
                style={{ width: "100%" }}
              >
                <Select.Option value="d">Ng??y</Select.Option>
                <Select.Option value="m">Th??ng</Select.Option>
                <Select.Option value="y">N??m</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              rules={[
                {
                  required: true,
                },
              ]}
              name="rangerDate"
              initialValue={[moment(moment().subtract(7, "days")), moment()]}
            >
              {handleDatePicker()}
            </Form.Item>
          </Col>

          <Col span={7}>
            <Form.Item name="customer">
              <Select
                style={{ width: "100%" }}
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
              >
                {customers.map((item) => (
                  <Option value={item.id}>
                    {item?.name + " - " + item?.phoneNumber}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={1}>
            <Button
              icon={<ClearOutlined />}
              style={{ width: "100%" }}
              onClick={() => {
                form.setFieldsValue({
                  customer: undefined,
                  addressvn: undefined,
                });
                setProvinceSelected(undefined);
                setDistrictSelected(undefined);
                setWardSelected(undefined);
                setProvinceSelectedCode(undefined);
                setDistrictSelectedCode(undefined);
                setWardSelectedCode(undefined);
              }}
              type="dashed"
            ></Button>
          </Col>
          <Col span={3}>
            <Button
              style={{ width: "100%" }}
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
              type="dashed"
            >
              Th???ng k??
            </Button>
          </Col>
          <Col span={4}>
            <Button
              style={{ width: "100%" }}
              onClick={() => {
                form
                  .validateFields()
                  .then((values) => {
                    handleExportExcel(values);
                  })
                  .catch((info) => {
                    console.log("Validate Failed:", info);
                  });
              }}
              icon={<FileExcelOutlined />}
              type="primary"
            >
              Xu???t b??o c??o
            </Button>
          </Col>
          <Col span={24}>
            <Form.Item name="addressvn">
              <Cascader
                changeOnSelect
                options={addressData}
                onChange={onChange}
                placeholder="T???nh/Th??nh ph??? - Qu???n/Huy???n - Ph?????ng/X??"
                showSearch={{
                  filter,
                }}
                onSearch={(value) => console.log(value)}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table
              bordered
              columns={columns}
              dataSource={dataSaleReport}
              scroll={{
                y: 280,
              }}
              pagination={{
                pageSize: 20,
              }}
            />
          </Col>
        </Row>
      </Form>
      <Loading loading={loading} />
    </>
  );
};
export default SaleReportCustomer;
